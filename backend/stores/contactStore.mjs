import path from 'node:path';
import { promises as fs } from 'node:fs';
import { MongoClient } from 'mongodb';

function normalizeLimit(limit) {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed)) return 100;
  return Math.min(Math.max(parsed, 1), 500);
}

export class FileContactStore {
  constructor({ dataDir, contactsFile }) {
    this.dataDir = dataDir;
    this.contactsFile = contactsFile;
    this.mode = 'file';
  }

  async init() {
    await fs.mkdir(this.dataDir, { recursive: true });
    try {
      await fs.access(this.contactsFile);
    } catch {
      await fs.writeFile(this.contactsFile, '[]', 'utf8');
    }
  }

  async _read() {
    await this.init();
    const raw = await fs.readFile(this.contactsFile, 'utf8');
    return JSON.parse(raw);
  }

  async _write(contacts) {
    await fs.writeFile(this.contactsFile, JSON.stringify(contacts, null, 2), 'utf8');
  }

  async create(record) {
    const contacts = await this._read();
    contacts.push(record);
    await this._write(contacts);
    return record;
  }

  async list({ status, limit }) {
    const contacts = await this._read();
    const filtered = status ? contacts.filter((item) => item.status === status) : contacts;
    const sorted = filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return sorted.slice(0, normalizeLimit(limit));
  }

  async updateStatus(id, status) {
    const contacts = await this._read();
    const index = contacts.findIndex((item) => item.id === id);
    if (index === -1) return null;
    contacts[index] = {
      ...contacts[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    await this._write(contacts);
    return contacts[index];
  }
}

export class MongoContactStore {
  constructor({ mongoUri }) {
    this.mongoUri = mongoUri;
    this.mode = 'mongodb';
    this.client = null;
    this.collection = null;
  }

  async init() {
    if (this.collection) return;
    this.client = new MongoClient(this.mongoUri, {
      maxPoolSize: 10,
    });
    await this.client.connect();
    const db = this.client.db('devfolio');
    this.collection = db.collection('contacts');
    await this.collection.createIndex({ createdAt: -1 });
    await this.collection.createIndex({ status: 1, createdAt: -1 });
    await this.collection.createIndex({ email: 1 });
    await this.collection.createIndex({ id: 1 }, { unique: true });
  }

  async create(record) {
    await this.init();
    await this.collection.insertOne(record);
    return record;
  }

  async list({ status, limit }) {
    await this.init();
    const query = status ? { status } : {};
    const cursor = this.collection.find(query).sort({ createdAt: -1 }).limit(normalizeLimit(limit));
    return cursor.toArray();
  }

  async updateStatus(id, status) {
    await this.init();
    const result = await this.collection.findOneAndUpdate(
      { id },
      {
        $set: {
          status,
          updatedAt: new Date().toISOString(),
        },
      },
      { returnDocument: 'after' }
    );
    return result.value;
  }

  async close() {
    if (this.client) {
      await this.client.close();
    }
  }
}

export async function createContactStore({ rootDir, mongoUri }) {
  if (mongoUri) {
    const mongoStore = new MongoContactStore({ mongoUri });
    await mongoStore.init();
    return mongoStore;
  }

  const dataDir = path.join(rootDir, 'data');
  const contactsFile = path.join(dataDir, 'contacts.json');
  const fileStore = new FileContactStore({ dataDir, contactsFile });
  await fileStore.init();
  return fileStore;
}
