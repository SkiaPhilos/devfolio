import path from 'node:path';
import { promises as fs } from 'node:fs';

function normalizeLimit(limit) {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed)) return 100;
  return Math.min(Math.max(parsed, 1), 500);
}

export class FileLayoutStore {
  constructor({ dataDir, layoutsFile }) {
    this.dataDir = dataDir;
    this.layoutsFile = layoutsFile;
    this.mode = 'file';
  }

  async init() {
    await fs.mkdir(this.dataDir, { recursive: true });
    try {
      await fs.access(this.layoutsFile);
    } catch {
      await fs.writeFile(this.layoutsFile, '[]', 'utf8');
    }
  }

  async _read() {
    await this.init();
    const raw = await fs.readFile(this.layoutsFile, 'utf8');
    return JSON.parse(raw);
  }

  async _write(layouts) {
    await fs.writeFile(this.layoutsFile, JSON.stringify(layouts, null, 2), 'utf8');
  }

  async create(layout) {
    const layouts = await this._read();
    layouts.push(layout);
    await this._write(layouts);
    return layout;
  }

  async list({ ownerId, limit }) {
    const layouts = await this._read();
    const filtered = ownerId ? layouts.filter((item) => item.ownerId === ownerId) : layouts;
    const sorted = filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return sorted.slice(0, normalizeLimit(limit));
  }

  async getById(id) {
    const layouts = await this._read();
    return layouts.find((item) => item.id === id) ?? null;
  }

  async update(id, updater) {
    const layouts = await this._read();
    const index = layouts.findIndex((item) => item.id === id);
    if (index === -1) return null;
    const next = updater(layouts[index]);
    layouts[index] = next;
    await this._write(layouts);
    return next;
  }

  async getPublishedBySlug(slug) {
    const layouts = await this._read();
    const found = layouts.find((item) => item.slug === slug && item.publishedVersion);
    return found ?? null;
  }
}

export async function createLayoutStore({ rootDir }) {
  const dataDir = path.join(rootDir, 'data');
  const layoutsFile = path.join(dataDir, 'layouts.json');
  const store = new FileLayoutStore({ dataDir, layoutsFile });
  await store.init();
  return store;
}
