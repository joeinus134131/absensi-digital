import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'wajibabsen_store.json');

class RelationalDatabase {
  constructor() {
    this.data = {
      companies: [],
      branches: [],
      qr_stations: [],
      shifts: [],
      users: [],
      attendance_logs: [],
      leave_requests: [],
      audit_logs: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error loading DB file, initializing clean store:', err);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving DB file:', err);
    }
  }

  // Generic helpers
  getTable(tableName) {
    return this.data[tableName] || [];
  }

  find(tableName, predicate) {
    return this.getTable(tableName).find(predicate);
  }

  filter(tableName, predicate) {
    return this.getTable(tableName).filter(predicate);
  }

  insert(tableName, record) {
    if (!this.data[tableName]) this.data[tableName] = [];
    const newRecord = {
      id: record.id || `id_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      created_at: new Date().toISOString(),
      ...record
    };
    this.data[tableName].push(newRecord);
    this.save();
    return newRecord;
  }

  update(tableName, id, updates) {
    const list = this.getTable(tableName);
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...updates, updated_at: new Date().toISOString() };
    this.save();
    return list[index];
  }

  delete(tableName, id) {
    const list = this.getTable(tableName);
    const index = list.findIndex(item => item.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    this.save();
    return true;
  }

  clearAll() {
    this.data = {
      companies: [],
      branches: [],
      qr_stations: [],
      shifts: [],
      users: [],
      attendance_logs: [],
      leave_requests: [],
      audit_logs: []
    };
    this.save();
  }
}

export const db = new RelationalDatabase();
