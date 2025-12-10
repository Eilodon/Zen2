import Dexie, { type Table } from 'dexie';

export interface MoodEntry {
  id?: number;
  timestamp: number;
  input: string;
  realm: string;
  advice: string;
}

export class MoodDB extends Dexie {
  moods!: Table<MoodEntry>;

  constructor() {
    super('MindfulOS_Quantum');
    // Using type assertion to bypass potential type mismatch where version() is not recognized
    (this as any).version(1).stores({
      moods: '++id, timestamp'
    });
  }

  async getLast5Moods(): Promise<string> {
    const entries = await this.moods.orderBy('timestamp').reverse().limit(5).toArray();
    if (entries.length === 0) return "No previous history.";
    return entries.map(e => `[${new Date(e.timestamp).toLocaleDateString()}] User felt ${e.realm}: "${e.input}"`).join('\n');
  }
}

export const db = new MoodDB();