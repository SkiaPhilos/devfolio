import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { createContactStore } from './stores/contactStore.mjs';
import { createLayoutStore } from './stores/layoutStore.mjs';
import { createProjectStore } from './stores/projectStore.mjs';
import { createSkillStore } from './stores/skillStore.mjs';

const app = express();
const PORT = Number(process.env.PORT || 8787);
const MONGO_URI = process.env.MONGODB_URI?.trim();
const ADMIN_API_KEY = process.env.ADMIN_API_KEY?.trim() || 'dev-admin-key';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const validStatuses = new Set(['new', 'read', 'replied']);

const contactStore = await createContactStore({
  rootDir: __dirname,
  mongoUri: MONGO_URI,
});
const layoutStore = await createLayoutStore({ rootDir: __dirname });
const projectStore = await createProjectStore({ rootDir: __dirname });
const skillStore = await createSkillStore({ rootDir: __dirname });

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
  credentials: false,
}));
app.use(express.json({ limit: '1mb' }));

function sanitize(value) {
  return String(value ?? '').trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function requireAdmin(req, res, next) {
  const header = req.get('x-admin-key');
  if (!header || header !== ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  return next();
}

function slugify(value) {
  return sanitize(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'devfolio-api',
    storage: contactStore.mode,
  });
});

app.get('/api/projects', async (req, res) => {
  const category = sanitize(req.query?.category);
  try {
    const projects = await projectStore.list({
      category: category || undefined,
    });
    return res.json({ ok: true, projects });
  } catch (error) {
    console.error('Failed to fetch projects', error);
    return res.status(500).json({ error: 'Could not fetch projects.' });
  }
});

app.get('/api/skills', async (_req, res) => {
  try {
    const { skills, categoryColors } = await skillStore.list();
    return res.json({ ok: true, skills, categoryColors });
  } catch (error) {
    console.error('Failed to fetch skills', error);
    return res.status(500).json({ error: 'Could not fetch skills.' });
  }
});

app.get('/api/admin/projects', requireAdmin, async (req, res) => {
  const category = sanitize(req.query?.category);
  try {
    const projects = await projectStore.list({
      category: category || undefined,
    });
    return res.json({ ok: true, projects });
  } catch (error) {
    console.error('Failed to fetch admin projects', error);
    return res.status(500).json({ error: 'Could not fetch projects.' });
  }
});

app.put('/api/admin/projects/:id', requireAdmin, async (req, res) => {
  const id = sanitize(req.params?.id);
  const title = sanitize(req.body?.title);
  const category = sanitize(req.body?.category);
  const description = sanitize(req.body?.description);
  const tech = Array.isArray(req.body?.tech) ? req.body.tech : [];
  const color = sanitize(req.body?.color);
  const icon = sanitize(req.body?.icon);

  if (!id) {
    return res.status(400).json({ error: 'Project id is required.' });
  }
  if (!title || title.length < 2) {
    return res.status(400).json({ error: 'Project title must be at least 2 characters.' });
  }
  if (!category) {
    return res.status(400).json({ error: 'Project category is required.' });
  }
  if (!description || description.length < 10) {
    return res.status(400).json({ error: 'Project description must be at least 10 characters.' });
  }

  try {
    const project = await projectStore.upsert({
      id,
      title,
      category,
      description,
      tech,
      color,
      icon,
    });
    return res.json({ ok: true, project });
  } catch (error) {
    console.error('Failed to save project', error);
    return res.status(500).json({ error: 'Could not save project.' });
  }
});

app.delete('/api/admin/projects/:id', requireAdmin, async (req, res) => {
  const id = sanitize(req.params?.id);
  if (!id) {
    return res.status(400).json({ error: 'Project id is required.' });
  }

  try {
    const removed = await projectStore.delete(id);
    if (!removed) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    return res.json({ ok: true, id });
  } catch (error) {
    console.error('Failed to delete project', error);
    return res.status(500).json({ error: 'Could not delete project.' });
  }
});

app.get('/api/admin/skills', requireAdmin, async (_req, res) => {
  try {
    const { skills, categoryColors } = await skillStore.list();
    return res.json({ ok: true, skills, categoryColors });
  } catch (error) {
    console.error('Failed to fetch admin skills', error);
    return res.status(500).json({ error: 'Could not fetch skills.' });
  }
});

app.put('/api/admin/skills/:id', requireAdmin, async (req, res) => {
  const id = sanitize(req.params?.id);
  const label = sanitize(req.body?.label);
  const category = sanitize(req.body?.category);
  const level = Number(req.body?.level);
  const position = Array.isArray(req.body?.position) ? req.body.position : [0, 0, 0];
  const connections = Array.isArray(req.body?.connections) ? req.body.connections : [];
  const description = sanitize(req.body?.description);

  if (!id) {
    return res.status(400).json({ error: 'Skill id is required.' });
  }
  if (!label || label.length < 2) {
    return res.status(400).json({ error: 'Skill label must be at least 2 characters.' });
  }
  if (!category) {
    return res.status(400).json({ error: 'Skill category is required.' });
  }
  if (!Number.isFinite(level) || level < 0 || level > 1) {
    return res.status(400).json({ error: 'Skill level must be a number between 0 and 1.' });
  }
  if (!description || description.length < 10) {
    return res.status(400).json({ error: 'Skill description must be at least 10 characters.' });
  }

  try {
    const skill = await skillStore.upsert({
      id,
      label,
      category,
      level,
      position,
      connections,
      description,
    });
    return res.json({ ok: true, skill });
  } catch (error) {
    console.error('Failed to save skill', error);
    return res.status(500).json({ error: 'Could not save skill.' });
  }
});

app.delete('/api/admin/skills/:id', requireAdmin, async (req, res) => {
  const id = sanitize(req.params?.id);
  if (!id) {
    return res.status(400).json({ error: 'Skill id is required.' });
  }

  try {
    const removed = await skillStore.delete(id);
    if (!removed) {
      return res.status(404).json({ error: 'Skill not found.' });
    }
    return res.json({ ok: true, id });
  } catch (error) {
    console.error('Failed to delete skill', error);
    return res.status(500).json({ error: 'Could not delete skill.' });
  }
});

app.post('/api/contact', async (req, res) => {
  const payload = {
    name: sanitize(req.body?.name),
    email: sanitize(req.body?.email).toLowerCase(),
    subject: sanitize(req.body?.subject),
    message: sanitize(req.body?.message),
    budget: sanitize(req.body?.budget),
    projectType: sanitize(req.body?.projectType),
  };

  if (!payload.name || payload.name.length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters.' });
  }
  if (!payload.email || !isValidEmail(payload.email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!payload.message || payload.message.length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters.' });
  }

  const record = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'new',
    ...payload,
  };

  try {
    await contactStore.create(record);
    return res.status(201).json({ ok: true, id: record.id });
  } catch (error) {
    console.error('Failed to persist contact', error);
    return res.status(500).json({ error: 'Could not save inquiry.' });
  }
});

app.get('/api/admin/contacts', requireAdmin, async (req, res) => {
  const status = sanitize(req.query?.status);
  const limit = sanitize(req.query?.limit);

  if (status && !validStatuses.has(status)) {
    return res.status(400).json({ error: 'Invalid status filter.' });
  }

  try {
    const contacts = await contactStore.list({
      status: status || undefined,
      limit: limit || undefined,
    });
    return res.json({ ok: true, contacts });
  } catch (error) {
    console.error('Failed to list contacts', error);
    return res.status(500).json({ error: 'Could not fetch inquiries.' });
  }
});

app.patch('/api/admin/contacts/:id/status', requireAdmin, async (req, res) => {
  const id = sanitize(req.params?.id);
  const status = sanitize(req.body?.status);

  if (!id) {
    return res.status(400).json({ error: 'Contact id is required.' });
  }
  if (!validStatuses.has(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    const updated = await contactStore.updateStatus(id, status);
    if (!updated) {
      return res.status(404).json({ error: 'Contact not found.' });
    }
    return res.json({ ok: true, contact: updated });
  } catch (error) {
    console.error('Failed to update contact status', error);
    return res.status(500).json({ error: 'Could not update inquiry status.' });
  }
});

app.get('/api/admin/layouts', requireAdmin, async (req, res) => {
  const ownerId = sanitize(req.query?.ownerId) || undefined;
  const limit = sanitize(req.query?.limit) || undefined;
  try {
    const layouts = await layoutStore.list({ ownerId, limit });
    return res.json({ ok: true, layouts });
  } catch (error) {
    console.error('Failed to list layouts', error);
    return res.status(500).json({ error: 'Could not fetch layouts.' });
  }
});

app.post('/api/layouts', requireAdmin, async (req, res) => {
  const name = sanitize(req.body?.name);
  const ownerId = sanitize(req.body?.ownerId) || 'default';
  const tree = req.body?.tree;
  const styles = req.body?.styles ?? {};
  const metadata = req.body?.metadata ?? {};

  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Layout name must be at least 2 characters.' });
  }
  if (!tree || typeof tree !== 'object') {
    return res.status(400).json({ error: 'Layout tree is required.' });
  }

  const now = new Date().toISOString();
  const layout = {
    id: crypto.randomUUID(),
    ownerId,
    name,
    slug: null,
    status: 'draft',
    currentVersion: 1,
    publishedVersion: null,
    tree,
    styles,
    metadata,
    versions: [
      {
        version: 1,
        createdAt: now,
        tree,
        styles,
        metadata,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  try {
    const created = await layoutStore.create(layout);
    return res.status(201).json({ ok: true, layout: created });
  } catch (error) {
    console.error('Failed to create layout', error);
    return res.status(500).json({ error: 'Could not create layout.' });
  }
});

app.get('/api/layouts/:id', requireAdmin, async (req, res) => {
  const id = sanitize(req.params?.id);
  if (!id) {
    return res.status(400).json({ error: 'Layout id is required.' });
  }

  try {
    const layout = await layoutStore.getById(id);
    if (!layout) {
      return res.status(404).json({ error: 'Layout not found.' });
    }
    return res.json({ ok: true, layout });
  } catch (error) {
    console.error('Failed to fetch layout', error);
    return res.status(500).json({ error: 'Could not fetch layout.' });
  }
});

app.put('/api/layouts/:id', requireAdmin, async (req, res) => {
  const id = sanitize(req.params?.id);
  const name = sanitize(req.body?.name);
  const tree = req.body?.tree;
  const styles = req.body?.styles ?? {};
  const metadata = req.body?.metadata ?? {};

  if (!id) {
    return res.status(400).json({ error: 'Layout id is required.' });
  }
  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Layout name must be at least 2 characters.' });
  }
  if (!tree || typeof tree !== 'object') {
    return res.status(400).json({ error: 'Layout tree is required.' });
  }

  try {
    const updated = await layoutStore.update(id, (current) => {
      const nextVersion = current.currentVersion + 1;
      const now = new Date().toISOString();
      return {
        ...current,
        name,
        tree,
        styles,
        metadata,
        currentVersion: nextVersion,
        updatedAt: now,
        versions: [
          ...current.versions,
          {
            version: nextVersion,
            createdAt: now,
            tree,
            styles,
            metadata,
          },
        ],
      };
    });

    if (!updated) {
      return res.status(404).json({ error: 'Layout not found.' });
    }

    return res.json({ ok: true, layout: updated });
  } catch (error) {
    console.error('Failed to update layout', error);
    return res.status(500).json({ error: 'Could not update layout.' });
  }
});

app.post('/api/layouts/:id/publish', requireAdmin, async (req, res) => {
  const id = sanitize(req.params?.id);
  if (!id) {
    return res.status(400).json({ error: 'Layout id is required.' });
  }

  try {
    const updated = await layoutStore.update(id, (current) => {
      const slugInput = sanitize(req.body?.slug) || current.slug || current.name;
      const slug = slugify(slugInput) || current.id;
      return {
        ...current,
        slug,
        status: 'published',
        publishedVersion: current.currentVersion,
        updatedAt: new Date().toISOString(),
      };
    });

    if (!updated) {
      return res.status(404).json({ error: 'Layout not found.' });
    }

    return res.json({ ok: true, layout: updated });
  } catch (error) {
    console.error('Failed to publish layout', error);
    return res.status(500).json({ error: 'Could not publish layout.' });
  }
});

app.get('/api/public/layouts/:slug', async (req, res) => {
  const slug = sanitize(req.params?.slug);
  if (!slug) {
    return res.status(400).json({ error: 'Layout slug is required.' });
  }

  try {
    const layout = await layoutStore.getPublishedBySlug(slug);
    if (!layout) {
      return res.status(404).json({ error: 'Published layout not found.' });
    }

    return res.json({
      ok: true,
      layout: {
        id: layout.id,
        name: layout.name,
        slug: layout.slug,
        version: layout.publishedVersion,
        tree: layout.tree,
        styles: layout.styles,
        metadata: layout.metadata,
        updatedAt: layout.updatedAt,
      },
    });
  } catch (error) {
    console.error('Failed to fetch published layout', error);
    return res.status(500).json({ error: 'Could not fetch published layout.' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, async () => {
  console.log(`Devfolio API listening on http://localhost:${PORT}`);
  if (!process.env.ADMIN_API_KEY) {
    console.log('Using fallback ADMIN_API_KEY=dev-admin-key (set env var in production).');
  }
  console.log(`Contact store mode: ${contactStore.mode}`);
  console.log(`Layout store mode: ${layoutStore.mode}`);
  console.log(`Project store mode: ${projectStore.mode}`);
  console.log(`Skill store mode: ${skillStore.mode}`);
});

process.on('SIGINT', async () => {
  if (contactStore.close) {
    await contactStore.close();
  }
  process.exit(0);
});

