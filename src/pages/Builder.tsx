import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { motion } from 'framer-motion';
import {
  createLayout,
  listLayouts,
  publishLayout,
  updateLayout,
  type BuilderLayoutPayload,
} from '../utils/layoutApi';
import { fetchProjects } from '../utils/projectApi';
import { fetchSkills } from '../utils/skillApi';

type BuilderBlockType = 'container' | 'text' | 'image' | 'button' | 'code' | 'divider' | 'collection';

interface BuilderBlock {
  id: string;
  type: BuilderBlockType;
  content: string;
  className?: string;
  children?: BuilderBlock[];
  dataSource?: 'projects' | 'skills';
  limit?: number;
  collectionLayout?: 'cards' | 'list';
}

interface PageSettings {
  maxWidth: 'standard' | 'wide' | 'full';
  minHeight: number;
  infiniteLength: boolean;
  padding: number;
  backgroundMode: 'solid' | 'gradient';
  backgroundPrimary: string;
  backgroundSecondary: string;
}

interface DropTarget {
  parentId: string | null;
  index: number;
}

interface BuilderSnapshot {
  blocks: BuilderBlock[];
  pageSettings: PageSettings;
  pages: BuilderPage[];
  activePageId: string;
}

interface BuilderTemplate {
  id: string;
  name: string;
  description: string;
  blocks: BuilderBlock[];
}

interface BuilderPage {
  id: string;
  name: string;
  slug: string;
  blocks: BuilderBlock[];
  pageSettings: PageSettings;
}

const BUILDER_DRAFT_KEY = 'devfolio:builder:draft:v2';

const DEFAULT_PAGE_SETTINGS: PageSettings = {
  maxWidth: 'standard',
  minHeight: 920,
  infiniteLength: true,
  padding: 24,
  backgroundMode: 'solid',
  backgroundPrimary: '#ffffff',
  backgroundSecondary: '#f5f7fb',
};

const DEFAULT_BLOCKS: BuilderBlock[] = [
  { id: uid(), type: 'text', content: 'Welcome to the Builder', className: 'text-2xl font-semibold text-slate-900' },
  {
    id: uid(),
    type: 'container',
    content: 'Hero Container',
    className: 'p-4 border border-slate-300 rounded-xl bg-white space-y-3',
    children: [
      { id: uid(), type: 'text', content: 'Drag blocks into this container to chain sections.', className: 'text-slate-700' },
      { id: uid(), type: 'button', content: 'Get Started', className: 'px-4 py-2 rounded-md bg-[#6366f1] text-white text-sm font-mono' },
    ],
  },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const blockTemplates: Record<BuilderBlockType, BuilderBlock> = {
  container: {
    id: '',
    type: 'container',
    content: 'Container',
    className: 'p-4 border border-slate-300 rounded-xl bg-white space-y-3',
    children: [],
  },
  text: { id: '', type: 'text', content: 'Editable text block', className: 'text-slate-800' },
  image: { id: '', type: 'image', content: 'https://placehold.co/640x360/png', className: 'w-full rounded-lg border border-white/10' },
  button: { id: '', type: 'button', content: 'Call to Action', className: 'px-4 py-2 rounded-md bg-[#6366f1] text-white text-sm font-mono' },
  code: { id: '', type: 'code', content: '<div>Hello builder</div>', className: 'p-3 rounded-md bg-black/40 border border-white/10 text-green-300 font-mono text-xs whitespace-pre-wrap' },
  divider: { id: '', type: 'divider', content: '', className: 'h-px w-full bg-white/20 my-2' },
  collection: {
    id: '',
    type: 'collection',
    content: 'Dynamic Collection',
    className: 'grid md:grid-cols-2 gap-3',
    dataSource: 'projects',
    limit: 6,
    collectionLayout: 'cards',
  },
};

function cloneBlock(template: BuilderBlock): BuilderBlock {
  return {
    ...template,
    id: uid(),
    children: template.children ? [] : undefined,
  };
}

function cloneTreeWithNewIds(block: BuilderBlock): BuilderBlock {
  return {
    ...block,
    id: uid(),
    children: (block.children || []).map(cloneTreeWithNewIds),
  };
}

function cloneBlocks(blocks: BuilderBlock[]): BuilderBlock[] {
  return blocks.map(cloneTreeWithNewIds);
}

function findBlock(blocks: BuilderBlock[], id: string): BuilderBlock | null {
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.children?.length) {
      const found = findBlock(block.children, id);
      if (found) return found;
    }
  }
  return null;
}

function updateBlock(blocks: BuilderBlock[], id: string, patch: Partial<BuilderBlock>): BuilderBlock[] {
  return blocks.map((block) => {
    if (block.id === id) {
      return {
        ...block,
        ...patch,
      };
    }

    if (block.children?.length) {
      return {
        ...block,
        children: updateBlock(block.children, id, patch),
      };
    }

    return block;
  });
}

function removeBlock(blocks: BuilderBlock[], id: string): { next: BuilderBlock[]; removed: BuilderBlock | null } {
  let removed: BuilderBlock | null = null;
  const next: BuilderBlock[] = [];

  for (const block of blocks) {
    if (block.id === id) {
      removed = block;
      continue;
    }

    if (block.children?.length) {
      const result = removeBlock(block.children, id);
      if (result.removed) {
        removed = result.removed;
      }
      next.push({
        ...block,
        children: result.next,
      });
      continue;
    }

    next.push(block);
  }

  return { next, removed };
}

function insertBlock(
  blocks: BuilderBlock[],
  parentId: string | null,
  index: number,
  node: BuilderBlock,
): BuilderBlock[] {
  if (!parentId) {
    const next = [...blocks];
    const target = Math.max(0, Math.min(index, next.length));
    next.splice(target, 0, node);
    return next;
  }

  return blocks.map((block) => {
    if (block.id === parentId) {
      const children = [...(block.children || [])];
      const target = Math.max(0, Math.min(index, children.length));
      children.splice(target, 0, node);
      return {
        ...block,
        children,
      };
    }

    if (block.children?.length) {
      return {
        ...block,
        children: insertBlock(block.children, parentId, index, node),
      };
    }

    return block;
  });
}

function hasDescendant(node: BuilderBlock, targetId: string): boolean {
  if (!node.children?.length) return false;
  for (const child of node.children) {
    if (child.id === targetId) return true;
    if (hasDescendant(child, targetId)) return true;
  }
  return false;
}

function countBlocks(blocks: BuilderBlock[]): number {
  return blocks.reduce((acc, block) => acc + 1 + countBlocks(block.children || []), 0);
}

function findPlacement(blocks: BuilderBlock[], targetId: string, parentId: string | null = null): DropTarget | null {
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    if (block.id === targetId) {
      return { parentId, index };
    }
    if (block.children?.length) {
      const nested = findPlacement(block.children, targetId, block.id);
      if (nested) return nested;
    }
  }
  return null;
}

function makeTemplateBlocks(label: string): BuilderBlock[] {
  if (label === 'Hero') {
    return [
      {
        id: uid(),
        type: 'container',
        content: 'Hero Section',
        className: 'p-10 rounded-2xl border border-white/15 bg-black/25 space-y-4',
        children: [
          { id: uid(), type: 'text', content: 'Your Product, but better than templates.', className: 'text-4xl font-semibold text-white leading-tight' },
          { id: uid(), type: 'text', content: 'Build polished pages quickly with reusable blocks and scalable layout controls.', className: 'text-white/70 max-w-3xl' },
          { id: uid(), type: 'button', content: 'Start Free', className: 'px-5 py-3 rounded-md bg-[#6366f1] text-white text-sm font-mono' },
        ],
      },
    ];
  }

  if (label === 'Features') {
    return [
      {
        id: uid(),
        type: 'container',
        content: 'Feature Grid',
        className: 'grid md:grid-cols-3 gap-4',
        children: [
          { id: uid(), type: 'container', content: 'Card 1', className: 'p-5 rounded-xl border border-white/10 bg-white/[0.03] space-y-2', children: [
            { id: uid(), type: 'text', content: 'Visual Builder', className: 'text-white font-semibold' },
            { id: uid(), type: 'text', content: 'Drag, chain, and ship sections in minutes.', className: 'text-white/65 text-sm' },
          ] },
          { id: uid(), type: 'container', content: 'Card 2', className: 'p-5 rounded-xl border border-white/10 bg-white/[0.03] space-y-2', children: [
            { id: uid(), type: 'text', content: 'Version History', className: 'text-white font-semibold' },
            { id: uid(), type: 'text', content: 'Undo and redo complex edits safely.', className: 'text-white/65 text-sm' },
          ] },
          { id: uid(), type: 'container', content: 'Card 3', className: 'p-5 rounded-xl border border-white/10 bg-white/[0.03] space-y-2', children: [
            { id: uid(), type: 'text', content: 'Portable JSON', className: 'text-white font-semibold' },
            { id: uid(), type: 'text', content: 'Move layouts between projects instantly.', className: 'text-white/65 text-sm' },
          ] },
        ],
      },
    ];
  }

  return [
    {
      id: uid(),
      type: 'container',
      content: 'Call To Action',
      className: 'p-8 rounded-2xl border border-[#6366f1]/40 bg-[#6366f1]/10 space-y-3 text-center',
      children: [
        { id: uid(), type: 'text', content: 'Ready to publish?', className: 'text-3xl font-semibold text-white' },
        { id: uid(), type: 'text', content: 'Ship your custom page from this builder with one click.', className: 'text-white/75' },
        { id: uid(), type: 'button', content: 'Publish now', className: 'px-5 py-3 rounded-md bg-[#6366f1] text-white text-sm font-mono' },
      ],
    },
  ];
}

const builderTemplates: BuilderTemplate[] = [
  { id: 'hero', name: 'Hero', description: 'Headline, copy, and CTA', blocks: makeTemplateBlocks('Hero') },
  { id: 'features', name: 'Features', description: 'Three-card value section', blocks: makeTemplateBlocks('Features') },
  { id: 'cta', name: 'CTA', description: 'Conversion footer block', blocks: makeTemplateBlocks('CTA') },
];

function getMaxWidthClass(maxWidth: PageSettings['maxWidth']): string {
  if (maxWidth === 'wide') return 'max-w-[1440px]';
  if (maxWidth === 'full') return 'max-w-none';
  return 'max-w-[1120px]';
}

export default function Builder() {
  const [layoutName, setLayoutName] = useState('New Builder Layout');
  const [ownerId, setOwnerId] = useState('abdullah');
  const [layoutId, setLayoutId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [recentLayouts, setRecentLayouts] = useState<Record<string, unknown>[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [historyPast, setHistoryPast] = useState<BuilderSnapshot[]>([]);
  const [historyFuture, setHistoryFuture] = useState<BuilderSnapshot[]>([]);
  const [lastAutosaveAt, setLastAutosaveAt] = useState<string | null>(null);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [templateQuery, setTemplateQuery] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [boundData, setBoundData] = useState<{ projects: Record<string, unknown>[]; skills: Record<string, unknown>[] }>({
    projects: [],
    skills: [],
  });

  const [pages, setPages] = useState<BuilderPage[]>([
    {
      id: `page-${uid()}`,
      name: 'Home',
      slug: 'home',
      blocks: JSON.parse(JSON.stringify(DEFAULT_BLOCKS)) as BuilderBlock[],
      pageSettings: JSON.parse(JSON.stringify(DEFAULT_PAGE_SETTINGS)) as PageSettings,
    },
  ]);
  const [activePageId, setActivePageId] = useState<string>('');

  const importRef = useRef<HTMLInputElement | null>(null);

  const [pageSettings, setPageSettings] = useState<PageSettings>(() => JSON.parse(JSON.stringify(DEFAULT_PAGE_SETTINGS)) as PageSettings);

  const [blocks, setBlocks] = useState<BuilderBlock[]>(() => JSON.parse(JSON.stringify(DEFAULT_BLOCKS)) as BuilderBlock[]);

  async function refreshBoundData() {
    setDataLoading(true);
    setError(null);
    try {
      const [projects, skillsPayload] = await Promise.all([fetchProjects(), fetchSkills()]);
      setBoundData({
        projects: projects as unknown as Record<string, unknown>[],
        skills: skillsPayload.skills as unknown as Record<string, unknown>[],
      });
      setMessage(`Collection data synced (${projects.length} projects, ${skillsPayload.skills.length} skills)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync collection data.');
    } finally {
      setDataLoading(false);
    }
  }

  function patchActivePage(nextBlocks: BuilderBlock[], nextPageSettings: PageSettings, sourcePages: BuilderPage[] = pages): BuilderPage[] {
    if (!activePageId) return sourcePages;
    return sourcePages.map((page) => (
      page.id === activePageId
        ? {
          ...page,
          blocks: JSON.parse(JSON.stringify(nextBlocks)) as BuilderBlock[],
          pageSettings: JSON.parse(JSON.stringify(nextPageSettings)) as PageSettings,
        }
        : page
    ));
  }

  function makeSnapshot(nextBlocks: BuilderBlock[] = blocks, nextPageSettings: PageSettings = pageSettings): BuilderSnapshot {
    return {
      blocks: JSON.parse(JSON.stringify(nextBlocks)) as BuilderBlock[],
      pageSettings: JSON.parse(JSON.stringify(nextPageSettings)) as PageSettings,
      pages: patchActivePage(nextBlocks, nextPageSettings),
      activePageId,
    };
  }

  function commit(nextBlocks: BuilderBlock[], nextPageSettings: PageSettings = pageSettings) {
    setHistoryPast((prev) => {
      const snap = makeSnapshot(blocks, pageSettings);
      return [...prev.slice(-49), snap];
    });
    setHistoryFuture([]);
    setBlocks(nextBlocks);
    setPageSettings(nextPageSettings);
    setPages((prev) => patchActivePage(nextBlocks, nextPageSettings, prev));
  }

  function updatePageSetting(patch: Partial<PageSettings>) {
    const nextSettings: PageSettings = {
      ...pageSettings,
      ...patch,
    };
    commit(blocks, nextSettings);
  }

  const selectedDeep = useMemo(() => {
    if (!selectedId) return null;
    return findBlock(blocks, selectedId);
  }, [blocks, selectedId]);

  const backgroundStyle = useMemo(() => {
    if (pageSettings.backgroundMode === 'solid') {
      return {
        background: pageSettings.backgroundPrimary,
      };
    }
    return {
      background: `linear-gradient(160deg, ${pageSettings.backgroundPrimary} 0%, ${pageSettings.backgroundSecondary} 100%)`,
    };
  }, [pageSettings]);

  const totalBlocks = useMemo(() => countBlocks(blocks), [blocks]);

  const filteredTemplates = useMemo(() => {
    const query = templateQuery.trim().toLowerCase();
    if (!query) return builderTemplates;
    return builderTemplates.filter((item) => {
      const text = `${item.name} ${item.description}`.toLowerCase();
      return text.includes(query);
    });
  }, [templateQuery]);

  useEffect(() => {
    if (!activePageId && pages[0]?.id) {
      setActivePageId(pages[0].id);
    }
  }, [activePageId, pages]);

  useEffect(() => {
    void refreshBoundData();
  }, []);

  useEffect(() => {
    if (!autosaveEnabled) return;

    const timer = setTimeout(() => {
      const payload = {
        layoutName,
        ownerId,
        slug,
        pages: patchActivePage(blocks, pageSettings),
        activePageId,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(BUILDER_DRAFT_KEY, JSON.stringify(payload));
      setLastAutosaveAt(payload.savedAt);
    }, 450);

    return () => clearTimeout(timer);
  }, [activePageId, autosaveEnabled, blocks, layoutName, ownerId, pageSettings, pages, slug]);

  const effectivePages = useMemo(() => patchActivePage(blocks, pageSettings), [activePageId, blocks, pageSettings, pages]);

  const activePage = useMemo(
    () => effectivePages.find((page) => page.id === activePageId) || effectivePages[0] || null,
    [activePageId, effectivePages],
  );

  const totalSiteBlocks = useMemo(
    () => effectivePages.reduce((acc, page) => acc + countBlocks(page.blocks), 0),
    [effectivePages],
  );

  const tree = useMemo(() => ({
    type: 'site',
    activePageId,
    pages: effectivePages.map((page) => ({
      id: page.id,
      name: page.name,
      slug: page.slug,
      page: page.pageSettings,
      children: page.blocks.map((b) => ({
        id: b.id,
        type: b.type,
        content: b.content,
        className: b.className || '',
        dataSource: b.dataSource,
        limit: b.limit,
        collectionLayout: b.collectionLayout,
        children: (b.children || []).map(function mapChildren(child): Record<string, unknown> {
          return {
            id: child.id,
            type: child.type,
            content: child.content,
            className: child.className || '',
            dataSource: child.dataSource,
            limit: child.limit,
            collectionLayout: child.collectionLayout,
            children: (child.children || []).map(mapChildren),
          };
        }),
      })),
    })),
    page: pageSettings,
    children: blocks,
  }), [activePageId, blocks, effectivePages, pageSettings]);

  function switchPage(pageId: string) {
    if (pageId === activePageId) return;
    const source = patchActivePage(blocks, pageSettings);
    const target = source.find((page) => page.id === pageId);
    if (!target) return;

    setPages(source);
    setActivePageId(pageId);
    setBlocks(JSON.parse(JSON.stringify(target.blocks)) as BuilderBlock[]);
    setPageSettings(JSON.parse(JSON.stringify(target.pageSettings)) as PageSettings);
    setSelectedId(null);
    setHistoryPast([]);
    setHistoryFuture([]);
    setMessage(`Switched to page ${target.name}.`);
  }

  function createPage() {
    const now = Date.now();
    const nextPage: BuilderPage = {
      id: `page-${uid()}`,
      name: `Page ${effectivePages.length + 1}`,
      slug: `page-${now}`,
      blocks: JSON.parse(JSON.stringify(DEFAULT_BLOCKS)) as BuilderBlock[],
      pageSettings: JSON.parse(JSON.stringify(DEFAULT_PAGE_SETTINGS)) as PageSettings,
    };

    const synced = patchActivePage(blocks, pageSettings);
    const nextPages = [...synced, nextPage];
    setPages(nextPages);
    setActivePageId(nextPage.id);
    setBlocks(JSON.parse(JSON.stringify(nextPage.blocks)) as BuilderBlock[]);
    setPageSettings(JSON.parse(JSON.stringify(nextPage.pageSettings)) as PageSettings);
    setSelectedId(null);
    setHistoryPast([]);
    setHistoryFuture([]);
    setMessage(`Created ${nextPage.name}.`);
  }

  function updateActivePageMeta(patch: Partial<Pick<BuilderPage, 'name' | 'slug'>>) {
    if (!activePageId) return;
    setPages((prev) => prev.map((page) => (
      page.id === activePageId
        ? {
          ...page,
          ...patch,
        }
        : page
    )));
  }

  function deleteActivePage() {
    const synced = patchActivePage(blocks, pageSettings);
    if (synced.length <= 1) {
      setError('At least one page is required.');
      return;
    }

    const nextPages = synced.filter((page) => page.id !== activePageId);
    const fallback = nextPages[0];
    setPages(nextPages);
    setActivePageId(fallback.id);
    setBlocks(JSON.parse(JSON.stringify(fallback.blocks)) as BuilderBlock[]);
    setPageSettings(JSON.parse(JSON.stringify(fallback.pageSettings)) as PageSettings);
    setSelectedId(null);
    setHistoryPast([]);
    setHistoryFuture([]);
    setMessage(`Deleted page. Active page is now ${fallback.name}.`);
  }

  function addBlock(type: BuilderBlockType) {
    const next = cloneBlock(blockTemplates[type]);
    if (selectedDeep?.type === 'container') {
      commit(insertBlock(blocks, selectedDeep.id, selectedDeep.children?.length || 0, next));
    } else {
      commit([...blocks, next]);
    }
    setSelectedId(next.id);
  }

  function removeSelected() {
    if (!selectedId) return;
    commit(removeBlock(blocks, selectedId).next);
    if (draggingId === selectedId) {
      setDraggingId(null);
      setDropTarget(null);
    }
    setSelectedId((current) => (current === selectedId ? null : current));
  }

  function updateSelected(patch: Partial<BuilderBlock>) {
    if (!selectedId) return;
    commit(updateBlock(blocks, selectedId, patch));
  }

  function duplicateSelected() {
    if (!selectedId) return;
    const selectedNode = findBlock(blocks, selectedId);
    if (!selectedNode) return;

    const location = findPlacement(blocks, selectedId);
    if (!location) return;

    const duplicated = cloneTreeWithNewIds(selectedNode);
    commit(insertBlock(blocks, location.parentId, location.index + 1, duplicated));
    setSelectedId(duplicated.id);
  }

  function applyTemplate(template: BuilderTemplate, mode: 'append' | 'replace') {
    const cloned = cloneBlocks(template.blocks);
    if (mode === 'replace') {
      commit(cloned);
      setSelectedId(cloned[0]?.id || null);
      setMessage(`Template ${template.name} loaded as a fresh page.`);
      return;
    }

    const next = [...blocks, ...cloned];
    commit(next);
    setSelectedId(cloned[0]?.id || null);
    setMessage(`Template ${template.name} appended.`);
  }

  function undo() {
    if (historyPast.length === 0) return;
    const prev = historyPast[historyPast.length - 1];
    const nextPast = historyPast.slice(0, -1);
    setHistoryPast(nextPast);
    setHistoryFuture((future) => [makeSnapshot(blocks, pageSettings), ...future].slice(0, 50));
    setBlocks(prev.blocks);
    setPageSettings(prev.pageSettings);
    setPages(prev.pages);
    setActivePageId(prev.activePageId);
  }

  function redo() {
    if (historyFuture.length === 0) return;
    const [next, ...rest] = historyFuture;
    setHistoryFuture(rest);
    setHistoryPast((past) => [...past.slice(-49), makeSnapshot(blocks, pageSettings)]);
    setBlocks(next.blocks);
    setPageSettings(next.pageSettings);
    setPages(next.pages);
    setActivePageId(next.activePageId);
  }

  function restoreAutosave() {
    const raw = localStorage.getItem(BUILDER_DRAFT_KEY);
    if (!raw) {
      setError('No autosaved draft found.');
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        layoutName?: string;
        ownerId?: string;
        slug?: string;
        pages?: BuilderPage[];
        activePageId?: string;
        blocks?: BuilderBlock[];
        pageSettings?: PageSettings;
      };

      if (Array.isArray(parsed.pages) && parsed.pages.length > 0) {
        const restoredActive = parsed.pages.find((page) => page.id === parsed.activePageId) || parsed.pages[0];
        setPages(parsed.pages);
        setActivePageId(restoredActive.id);
        setBlocks(JSON.parse(JSON.stringify(restoredActive.blocks)) as BuilderBlock[]);
        setPageSettings(JSON.parse(JSON.stringify(restoredActive.pageSettings)) as PageSettings);
      } else if (Array.isArray(parsed.blocks) && parsed.pageSettings) {
        const singleId = `page-${uid()}`;
        const fallbackPage: BuilderPage = {
          id: singleId,
          name: 'Imported Page',
          slug: 'imported-page',
          blocks: parsed.blocks,
          pageSettings: parsed.pageSettings,
        };
        setPages([fallbackPage]);
        setActivePageId(singleId);
        setBlocks(JSON.parse(JSON.stringify(parsed.blocks)) as BuilderBlock[]);
        setPageSettings(JSON.parse(JSON.stringify(parsed.pageSettings)) as PageSettings);
      } else {
        setError('Autosaved draft is invalid.');
        return;
      }
      setLayoutName(parsed.layoutName || layoutName);
      setOwnerId(parsed.ownerId || ownerId);
      setSlug(parsed.slug || slug);
      setSelectedId(null);
      setHistoryPast([]);
      setHistoryFuture([]);
      setMessage('Autosaved draft restored.');
    } catch {
      setError('Could not parse autosaved draft.');
    }
  }

  function exportJson() {
    const payload = {
      version: 1,
      createdAt: new Date().toISOString(),
      layoutName,
      ownerId,
      slug,
      tree,
      styles: {
        preset: 'builder-pro',
        pageSettings,
      },
      metadata: {
        blockCount: totalSiteBlocks,
        activePageBlockCount: totalBlocks,
        pageCount: effectivePages.length,
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${layoutName.trim().replace(/\s+/g, '-').toLowerCase() || 'builder-layout'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('Layout exported as JSON.');
  }

  function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || '');
        const parsed = JSON.parse(text) as {
          layoutName?: string;
          ownerId?: string;
          slug?: string;
          activePageId?: string;
          pages?: Array<{
            id?: string;
            name?: string;
            slug?: string;
            page?: PageSettings;
            children?: BuilderBlock[];
          }>;
          tree?: {
            children?: BuilderBlock[];
            page?: PageSettings;
            activePageId?: string;
            pages?: Array<{
              id?: string;
              name?: string;
              slug?: string;
              page?: PageSettings;
              children?: BuilderBlock[];
            }>;
          };
          styles?: { pageSettings?: PageSettings };
        };

        const importedPages = Array.isArray(parsed.pages) && parsed.pages.length > 0
          ? parsed.pages
          : (Array.isArray(parsed.tree?.pages) ? parsed.tree?.pages : []);

        if (importedPages.length > 0) {
          const nextPages: BuilderPage[] = importedPages.map((page, index) => ({
            id: page.id || `page-${uid()}`,
            name: page.name || `Page ${index + 1}`,
            slug: page.slug || `page-${index + 1}`,
            blocks: Array.isArray(page.children) ? page.children : [],
            pageSettings: page.page || parsed.styles?.pageSettings || DEFAULT_PAGE_SETTINGS,
          }));
          const nextActive = nextPages.find((page) => page.id === (parsed.activePageId || parsed.tree?.activePageId)) || nextPages[0];

          setPages(nextPages);
          setActivePageId(nextActive.id);
          setBlocks(JSON.parse(JSON.stringify(nextActive.blocks)) as BuilderBlock[]);
          setPageSettings(JSON.parse(JSON.stringify(nextActive.pageSettings)) as PageSettings);
          setSelectedId(null);
          setHistoryPast([]);
          setHistoryFuture([]);
          setLayoutName(parsed.layoutName || layoutName);
          setOwnerId(parsed.ownerId || ownerId);
          setSlug(parsed.slug || slug);
          setMessage('Site layout imported successfully.');
          return;
        }

        const importedBlocks = parsed.tree?.children;
        const importedSettings = parsed.styles?.pageSettings || parsed.tree?.page;

        if (!Array.isArray(importedBlocks) || !importedSettings) {
          setError('Invalid import format.');
          return;
        }

        const singleId = `page-${uid()}`;
        const fallbackPage: BuilderPage = {
          id: singleId,
          name: 'Imported Page',
          slug: 'imported-page',
          blocks: importedBlocks,
          pageSettings: importedSettings,
        };
        setPages([fallbackPage]);
        setActivePageId(singleId);
        setBlocks(JSON.parse(JSON.stringify(importedBlocks)) as BuilderBlock[]);
        setPageSettings(JSON.parse(JSON.stringify(importedSettings)) as PageSettings);
        setLayoutName(parsed.layoutName || layoutName);
        setOwnerId(parsed.ownerId || ownerId);
        setSlug(parsed.slug || slug);
        setSelectedId(null);
        setHistoryPast([]);
        setHistoryFuture([]);
        setMessage('Layout imported successfully.');
      } catch {
        setError('Failed to import JSON layout.');
      } finally {
        event.target.value = '';
      }
    };
    reader.readAsText(file);
  }

  function moveBlock(dragId: string, target: DropTarget) {
    const draggedNode = findBlock(blocks, dragId);
    if (!draggedNode) return;

    if (target.parentId === dragId) return;
    if (target.parentId && hasDescendant(draggedNode, target.parentId)) {
      return;
    }

    const removed = removeBlock(blocks, dragId);
    if (!removed.removed) return;

    commit(insertBlock(removed.next, target.parentId, target.index, removed.removed));
  }

  function beginDrag(event: DragEvent<HTMLElement>, id: string) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
    setDraggingId(id);
  }

  function allowDrop(event: DragEvent<HTMLElement>, target: DropTarget) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropTarget(target);
  }

  function handleDrop(event: DragEvent<HTMLElement>, target: DropTarget) {
    event.preventDefault();
    const dragId = event.dataTransfer.getData('text/plain') || draggingId;
    if (!dragId) return;
    moveBlock(dragId, target);
    setDraggingId(null);
    setDropTarget(null);
  }

  function cancelDrag() {
    setDraggingId(null);
    setDropTarget(null);
  }

  function renderDropZone(parentId: string | null, index: number) {
    const active = dropTarget?.parentId === parentId && dropTarget?.index === index;
    return (
      <div
        key={`${parentId || 'root'}-${index}`}
        onDragOver={(event) => allowDrop(event, { parentId, index })}
        onDrop={(event) => handleDrop(event, { parentId, index })}
        className={`rounded-md border border-dashed transition-all ${
          active ? 'border-[#6366f1]/70 h-7 bg-[#6366f1]/15 my-2' : 'border-transparent h-3 my-1'
        }`}
      />
    );
  }

  function getCollectionItems(block: BuilderBlock): Record<string, unknown>[] {
    const source = block.dataSource === 'skills' ? boundData.skills : boundData.projects;
    const limit = Math.max(1, Math.min(24, Number(block.limit || 6)));
    return source.slice(0, limit);
  }

  function renderBlockNode(block: BuilderBlock, parentId: string | null, index: number, depth: number): React.ReactNode {
    const isSelected = selectedId === block.id;
    const indentStyle = depth > 0 ? { marginLeft: `${depth * 14}px` } : undefined;
    const blockShell = `rounded-lg border transition-colors ${
      isSelected ? 'border-[#6366f1]/70' : 'border-white/10'
    } ${draggingId === block.id ? 'opacity-40' : 'opacity-100'}`;

    const body = (() => {
      if (block.type === 'image') {
        return <img src={block.content} alt="Builder asset" className={block.className || ''} />;
      }
      if (block.type === 'button') {
        return (
          <button className={block.className || ''} type="button">
            {block.content}
          </button>
        );
      }
      if (block.type === 'code') {
        return <pre className={block.className || ''}>{block.content}</pre>;
      }
      if (block.type === 'divider') {
        return <div className={block.className || ''} aria-hidden="true" />;
      }
      if (block.type === 'collection') {
        const items = getCollectionItems(block);
        return (
          <div>
            <div className="text-[11px] font-mono text-white/55 mb-2">
              Source: {block.dataSource || 'projects'} • Items: {items.length}
            </div>
            <div className={block.className || 'grid gap-2'}>
              {items.map((item, itemIndex) => {
                const title = String(item.title || item.label || `Item ${itemIndex + 1}`);
                const description = String(item.description || item.category || 'No description');
                return (
                  <div key={`${block.id}-item-${itemIndex}`} className="rounded-md border border-white/10 bg-black/25 p-3">
                    <p className="text-white text-sm font-semibold">{title}</p>
                    <p className="text-white/60 text-xs mt-1">{description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
      return <div className={block.className || ''}>{block.content}</div>;
    })();

    return (
      <div key={block.id}>
        {renderDropZone(parentId, index)}
        <div
          style={indentStyle}
          className={blockShell}
          draggable
          onDragStart={(event) => beginDrag(event, block.id)}
          onDragEnd={cancelDrag}
          onClick={() => setSelectedId(block.id)}
        >
          <div className="px-3 py-2 border-b border-white/10 bg-black/20 flex items-center justify-between gap-2">
            <p className="text-[11px] font-mono tracking-[0.08em] uppercase text-white/60">{block.type}</p>
            <p className="text-[10px] font-mono text-white/35">drag</p>
          </div>

          <div className="p-3">{body}</div>

          {block.type === 'container' && (
            <div className="px-3 pb-3">
              <div className="rounded-lg border border-white/10 bg-black/15 p-2">
                {(block.children || []).length === 0 && (
                  <div
                    onDragOver={(event) => allowDrop(event, { parentId: block.id, index: 0 })}
                    onDrop={(event) => handleDrop(event, { parentId: block.id, index: 0 })}
                    className={`rounded-md border border-dashed px-3 py-4 text-xs font-mono text-center transition-colors ${
                      dropTarget?.parentId === block.id && dropTarget?.index === 0
                        ? 'border-[#6366f1]/70 text-[#6366f1] bg-[#6366f1]/10'
                        : 'border-white/15 text-white/45'
                    }`}
                  >
                    Drop blocks here to chain this container
                  </div>
                )}

                {(block.children || []).map((child, childIndex) => renderBlockNode(child, block.id, childIndex, depth + 1))}
                {renderDropZone(block.id, (block.children || []).length)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  async function saveLayout() {
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload: BuilderLayoutPayload = {
      name: layoutName,
      ownerId,
      tree,
      styles: {
        preset: 'builder-pro',
        pageSettings,
      },
      metadata: {
        blockCount: totalSiteBlocks,
        activePageBlockCount: totalBlocks,
        pageCount: effectivePages.length,
      },
    };

    try {
      if (layoutId) {
        const updated = await updateLayout(layoutId, payload);
        const id = String((updated.layout as { id?: string }).id || layoutId);
        setLayoutId(id);
        setMessage(`Layout updated (${id.slice(0, 8)}...)`);
      } else {
        const created = await createLayout(payload);
        const id = String((created.layout as { id?: string }).id || '');
        if (id) setLayoutId(id);
        setMessage(`Layout saved (${id.slice(0, 8)}...)`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save layout.');
    } finally {
      setSaving(false);
    }
  }

  async function publishCurrent() {
    if (!layoutId) {
      setError('Save layout before publishing.');
      return;
    }

    setPublishing(true);
    setError(null);
    setMessage(null);
    try {
      const result = await publishLayout(layoutId, slug || undefined);
      const publishedSlug = String((result.layout as { slug?: string }).slug || '');
      if (publishedSlug) setSlug(publishedSlug);
      setMessage(`Layout published at /api/public/layouts/${publishedSlug || '...'}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish layout.');
    } finally {
      setPublishing(false);
    }
  }

  async function loadRecent() {
    setError(null);
    try {
      const result = await listLayouts(ownerId);
      setRecentLayouts(result.layouts);
      setMessage(`Loaded ${result.layouts.length} layouts`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load layouts.');
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[300px_1fr_320px] gap-6">
        <aside className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-[#6366f1]/80 mb-3">Builder Blocks</p>
          <p className="text-[11px] text-white/45 font-mono mb-3">Pages: {effectivePages.length} • Site Blocks: {totalSiteBlocks}</p>

          <div className="mb-4 border border-white/10 rounded-md p-2 bg-black/20">
            <p className="text-[11px] font-mono tracking-[0.14em] uppercase text-white/45 mb-2">Pages</p>
            <div className="space-y-2 max-h-[180px] overflow-auto">
              {effectivePages.map((page) => {
                const isActive = page.id === activePageId;
                return (
                  <button
                    key={page.id}
                    type="button"
                    onClick={() => switchPage(page.id)}
                    className={`w-full text-left px-3 py-2 rounded-md border text-xs font-mono transition-colors ${
                      isActive
                        ? 'border-[#6366f1]/60 text-[#6366f1] bg-[#6366f1]/10'
                        : 'border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {page.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['container', 'text', 'image', 'button', 'code', 'divider', 'collection'] as BuilderBlockType[]).map((type) => (
              <button
                key={type}
                type="button"
                className="px-3 py-2 rounded-md border border-white/10 text-white/70 hover:text-white hover:border-[#6366f1]/50 transition-colors text-xs font-mono"
                onClick={() => addBlock(type)}
              >
                + {type}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-white/45 font-mono mt-3">Tip: if a container is selected, new blocks are added inside it.</p>

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-white/40 mb-2">Blocks</p>
            <div className="space-y-2 max-h-[320px] overflow-auto">
              {blocks.map((b, index) => {
                const isActive = selectedId === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedId(b.id)}
                    className={`w-full text-left px-3 py-2 rounded-md border text-xs font-mono transition-colors ${
                      isActive
                        ? 'border-[#6366f1]/60 text-[#6366f1] bg-[#6366f1]/10'
                        : 'border-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    {index + 1}. {b.type}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="rounded-xl border border-white/10 bg-[#070b14] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-[#6366f1]/80">Builder Preview</p>
              <p className="text-white/50 text-sm">Page: {activePage?.name || '...'}</p>
            </div>
            <div className="text-[11px] font-mono text-white/40">Page Blocks: {totalBlocks}</div>
          </div>

          <motion.div layout className="rounded-xl border border-white/10 bg-[#0c111d] p-4">
            <div
              className={`mx-auto rounded-xl border border-white/10 overflow-hidden ${getMaxWidthClass(pageSettings.maxWidth)}`}
              style={backgroundStyle}
            >
              <div
                className={pageSettings.infiniteLength ? 'min-h-[1px]' : 'overflow-y-auto'}
                style={{
                  minHeight: `${pageSettings.minHeight}px`,
                  maxHeight: pageSettings.infiniteLength ? undefined : `${pageSettings.minHeight}px`,
                  padding: `${pageSettings.padding}px`,
                }}
              >
                {blocks.map((block, index) => renderBlockNode(block, null, index, 0))}
                {renderDropZone(null, blocks.length)}
              </div>
            </div>
          </motion.div>
        </main>

        <aside className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-[#6366f1]/80 mb-3">Properties</p>

          <label className="block text-[11px] text-white/50 mb-1 font-mono">Layout Name</label>
          <input
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            className="w-full mb-3 px-3 py-2 rounded-md bg-black/30 border border-white/10 text-white/80 text-sm"
          />

          <label className="block text-[11px] text-white/50 mb-1 font-mono">Owner ID</label>
          <input
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full mb-3 px-3 py-2 rounded-md bg-black/30 border border-white/10 text-white/80 text-sm"
          />

          <label className="block text-[11px] text-white/50 mb-1 font-mono">Publish Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full mb-4 px-3 py-2 rounded-md bg-black/30 border border-white/10 text-white/80 text-sm"
          />

          <div className="border-t border-white/10 pt-4 mt-1 mb-4">
            <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-white/40 mb-2">Page Manager</p>
            <label className="block text-[11px] text-white/50 mb-1 font-mono">Active Page Name</label>
            <input
              value={activePage?.name || ''}
              onChange={(e) => updateActivePageMeta({ name: e.target.value })}
              className="w-full mb-3 px-3 py-2 rounded-md bg-black/30 border border-white/10 text-white/80 text-sm"
            />

            <label className="block text-[11px] text-white/50 mb-1 font-mono">Active Page Slug</label>
            <input
              value={activePage?.slug || ''}
              onChange={(e) => updateActivePageMeta({ slug: e.target.value })}
              className="w-full mb-3 px-3 py-2 rounded-md bg-black/30 border border-white/10 text-white/80 text-sm"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={createPage}
                className="px-3 py-2 rounded-md border border-white/15 text-white/80 text-xs font-mono"
              >
                New Page
              </button>
              <button
                type="button"
                onClick={deleteActivePage}
                className="px-3 py-2 rounded-md border border-red-400/40 text-red-300 text-xs font-mono"
              >
                Delete Page
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 mt-1">
            <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-white/40 mb-2">Page Canvas</p>
            <label className="block text-[11px] text-white/50 mb-1 font-mono">Width</label>
            <select
              value={pageSettings.maxWidth}
              onChange={(e) => updatePageSetting({ maxWidth: e.target.value as PageSettings['maxWidth'] })}
              className="w-full mb-3 px-3 py-2 rounded-md bg-black/30 border border-white/10 text-white/80 text-sm"
            >
              <option value="standard">Standard</option>
              <option value="wide">Wide</option>
              <option value="full">Full</option>
            </select>

            <label className="block text-[11px] text-white/50 mb-1 font-mono">Standard Height (px)</label>
            <input
              type="number"
              min={480}
              max={3000}
              step={20}
              value={pageSettings.minHeight}
              onChange={(e) => {
                const next = Number(e.target.value);
                if (!Number.isFinite(next)) return;
                updatePageSetting({ minHeight: Math.max(480, Math.min(3000, next)) });
              }}
              className="w-full mb-3 px-3 py-2 rounded-md bg-black/30 border border-white/10 text-white/80 text-sm"
            />

            <label className="flex items-center gap-2 text-xs text-white/70 mb-3 font-mono">
              <input
                type="checkbox"
                checked={pageSettings.infiniteLength}
                onChange={(e) => updatePageSetting({ infiniteLength: e.target.checked })}
              />
              Infinite length growth
            </label>

            <label className="block text-[11px] text-white/50 mb-1 font-mono">Canvas Padding</label>
            <input
              type="range"
              min={8}
              max={80}
              value={pageSettings.padding}
              onChange={(e) => updatePageSetting({ padding: Number(e.target.value) || 24 })}
              className="w-full mb-3"
            />

            <label className="block text-[11px] text-white/50 mb-1 font-mono">Background Mode</label>
            <select
              value={pageSettings.backgroundMode}
              onChange={(e) => updatePageSetting({ backgroundMode: e.target.value as PageSettings['backgroundMode'] })}
              className="w-full mb-3 px-3 py-2 rounded-md bg-black/30 border border-white/10 text-white/80 text-sm"
            >
              <option value="gradient">Gradient</option>
              <option value="solid">Solid</option>
            </select>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <input
                type="color"
                value={pageSettings.backgroundPrimary}
                onChange={(e) => updatePageSetting({ backgroundPrimary: e.target.value })}
                className="h-10 rounded-md bg-black/30 border border-white/10"
              />
              <input
                type="color"
                value={pageSettings.backgroundSecondary}
                onChange={(e) => updatePageSetting({ backgroundSecondary: e.target.value })}
                disabled={pageSettings.backgroundMode === 'solid'}
                className="h-10 rounded-md bg-black/30 border border-white/10 disabled:opacity-40"
              />
            </div>
          </div>

          {selectedDeep ? (
            <>
              <label className="block text-[11px] text-white/50 mb-1 font-mono">Selected Block Content</label>
              <textarea
                value={selectedDeep.content}
                onChange={(e) => updateSelected({ content: e.target.value })}
                rows={4}
                className="w-full mb-3 px-3 py-2 rounded-md bg-black/30 border border-white/10 text-white/80 text-sm"
              />

              <label className="block text-[11px] text-white/50 mb-1 font-mono">Class Name</label>
              <textarea
                value={selectedDeep.className || ''}
                onChange={(e) => updateSelected({ className: e.target.value })}
                rows={3}
                className="w-full mb-3 px-3 py-2 rounded-md bg-black/30 border border-white/10 text-white/80 text-sm"
              />

              {selectedDeep.type === 'collection' && (
                <>
                  <label className="block text-[11px] text-white/50 mb-1 font-mono">Collection Source</label>
                  <select
                    value={selectedDeep.dataSource || 'projects'}
                    onChange={(e) => updateSelected({ dataSource: e.target.value as 'projects' | 'skills' })}
                    className="w-full mb-3 px-3 py-2 rounded-md bg-black/30 border border-white/10 text-white/80 text-sm"
                  >
                    <option value="projects">Projects</option>
                    <option value="skills">Skills</option>
                  </select>

                  <label className="block text-[11px] text-white/50 mb-1 font-mono">Item Limit</label>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={selectedDeep.limit || 6}
                    onChange={(e) => updateSelected({ limit: Math.max(1, Math.min(24, Number(e.target.value) || 6)) })}
                    className="w-full mb-3 px-3 py-2 rounded-md bg-black/30 border border-white/10 text-white/80 text-sm"
                  />

                  <button
                    type="button"
                    onClick={refreshBoundData}
                    disabled={dataLoading}
                    className="w-full mb-3 px-3 py-2 rounded-md border border-white/15 text-white/80 text-xs font-mono disabled:opacity-50"
                  >
                    {dataLoading ? 'Syncing Data...' : 'Sync Data Source'}
                  </button>
                </>
              )}

              {selectedDeep.type === 'container' && (
                <button
                  type="button"
                  onClick={() => {
                    const child = cloneBlock(blockTemplates.text);
                      commit(insertBlock(blocks, selectedDeep.id, selectedDeep.children?.length || 0, child));
                    setSelectedId(child.id);
                  }}
                  className="w-full mb-3 px-3 py-2 rounded-md border border-white/15 text-white/80 text-xs font-mono"
                >
                  Add Text Child
                </button>
              )}

              <button
                type="button"
                onClick={duplicateSelected}
                className="w-full mb-3 px-3 py-2 rounded-md border border-white/15 text-white/80 text-xs font-mono"
              >
                Duplicate Selected Block
              </button>

              <button
                type="button"
                onClick={removeSelected}
                className="w-full mb-4 px-3 py-2 rounded-md border border-red-400/40 text-red-300 text-xs font-mono hover:bg-red-500/10"
              >
                Remove Selected Block
              </button>
            </>
          ) : (
            <p className="text-white/45 text-sm mb-4">Select a block from the left panel to edit properties.</p>
          )}

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={saveLayout}
              disabled={saving}
              className="px-3 py-2 rounded-md bg-[#6366f1] text-white text-xs font-mono disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={publishCurrent}
              disabled={publishing || !layoutId}
              className="px-3 py-2 rounded-md border border-[#6366f1]/50 text-[#6366f1] text-xs font-mono disabled:opacity-50"
            >
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={undo}
              disabled={historyPast.length === 0}
              className="px-3 py-2 rounded-md border border-white/15 text-white/80 text-xs font-mono disabled:opacity-40"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={historyFuture.length === 0}
              className="px-3 py-2 rounded-md border border-white/15 text-white/80 text-xs font-mono disabled:opacity-40"
            >
              Redo
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={exportJson}
              className="px-3 py-2 rounded-md border border-white/15 text-white/80 text-xs font-mono"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => importRef.current?.click()}
              className="px-3 py-2 rounded-md border border-white/15 text-white/80 text-xs font-mono"
            >
              Import JSON
            </button>
            <input
              ref={importRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={importJson}
            />
          </div>

          <div className="mb-3 rounded-md border border-white/10 p-2 bg-black/20">
            <label className="flex items-center gap-2 text-xs text-white/70 mb-2 font-mono">
              <input
                type="checkbox"
                checked={autosaveEnabled}
                onChange={(e) => setAutosaveEnabled(e.target.checked)}
              />
              Autosave draft
            </label>
            <button
              type="button"
              onClick={restoreAutosave}
              className="w-full px-3 py-2 rounded-md border border-white/15 text-white/80 text-xs font-mono"
            >
              Restore Autosave
            </button>
            <p className="text-[11px] text-white/50 mt-2 font-mono">Last autosave: {lastAutosaveAt ? new Date(lastAutosaveAt).toLocaleTimeString() : 'never'}</p>
          </div>

          <button
            type="button"
            onClick={loadRecent}
            className="w-full px-3 py-2 rounded-md border border-white/15 text-white/70 text-xs font-mono mb-3"
          >
            Load Recent Layouts
          </button>

          <div className="rounded-md border border-white/10 p-2 bg-black/20 mb-3">
            <p className="text-[11px] font-mono tracking-[0.14em] uppercase text-white/45 mb-2">Section Templates</p>
            <input
              value={templateQuery}
              onChange={(e) => setTemplateQuery(e.target.value)}
              placeholder="Search templates"
              className="w-full mb-2 px-3 py-2 rounded-md bg-black/30 border border-white/10 text-white/80 text-xs"
            />
            <div className="space-y-2 max-h-[190px] overflow-auto">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="rounded-md border border-white/10 p-2">
                  <p className="text-white/85 text-xs font-semibold">{template.name}</p>
                  <p className="text-white/50 text-[11px] mb-2">{template.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => applyTemplate(template, 'append')}
                      className="px-2 py-1 rounded-md border border-white/15 text-white/75 text-[11px] font-mono"
                    >
                      Append
                    </button>
                    <button
                      type="button"
                      onClick={() => applyTemplate(template, 'replace')}
                      className="px-2 py-1 rounded-md border border-[#6366f1]/45 text-[#6366f1] text-[11px] font-mono"
                    >
                      Replace
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {message && <p className="text-emerald-300/90 text-xs mb-2">{message}</p>}
          {error && <p className="text-red-300/90 text-xs mb-2">{error}</p>}

          {recentLayouts.length > 0 && (
            <div className="mt-3 border-t border-white/10 pt-3 space-y-2 max-h-[210px] overflow-auto">
              {recentLayouts.map((layout) => {
                const item = layout as { id?: string; name?: string; status?: string; slug?: string };
                return (
                  <div key={item.id} className="rounded-md border border-white/10 p-2">
                    <p className="text-white/80 text-xs font-medium">{item.name || 'Unnamed'}</p>
                    <p className="text-white/45 text-[11px] font-mono">{item.status || 'draft'} {item.slug ? `• ${item.slug}` : ''}</p>
                  </div>
                );
              })}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

