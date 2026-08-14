import fs from 'fs';
import path from 'path';
import { PerfexAuthConfig } from './perfex/perfexTypes.js';

export interface UserCredentialsRecord {
  userId: string;
  username: string;
  csrfToken: string;
  sessionCookie: string;
  updatedAt: string;
}

export class CredentialStore {
  private filePath: string;

  constructor(customFilePath?: string) {
    this.filePath = customFilePath || path.resolve(process.cwd(), 'data/user_credentials.json');
  }

  private ensureDirectoryExists(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadAll(): Record<string, UserCredentialsRecord> {
    try {
      if (!fs.existsSync(this.filePath)) {
        return {};
      }
      const data = fs.readFileSync(this.filePath, 'utf-8');
      if (!data.trim()) {
        return {};
      }
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  private saveAll(records: Record<string, UserCredentialsRecord>): void {
    this.ensureDirectoryExists();
    fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
  }

  public saveCredentials(
    userId: string,
    username: string,
    csrfToken: string,
    sessionCookie: string
  ): UserCredentialsRecord {
    const records = this.loadAll();
    const record: UserCredentialsRecord = {
      userId,
      username,
      csrfToken: csrfToken.trim(),
      sessionCookie: sessionCookie.trim(),
      updatedAt: new Date().toISOString(),
    };
    records[userId] = record;
    this.saveAll(records);
    return record;
  }

  public getCredentials(userId: string): PerfexAuthConfig | null {
    const records = this.loadAll();
    const record = records[userId];
    if (!record) {
      return null;
    }
    return {
      csrfToken: record.csrfToken,
      sessionCookie: record.sessionCookie,
    };
  }

  public getUserRecord(userId: string): UserCredentialsRecord | null {
    const records = this.loadAll();
    return records[userId] || null;
  }

  public deleteCredentials(userId: string): boolean {
    const records = this.loadAll();
    if (!records[userId]) {
      return false;
    }
    delete records[userId];
    this.saveAll(records);
    return true;
  }

  public hasCredentials(userId: string): boolean {
    return this.getCredentials(userId) !== null;
  }
}

export const defaultCredentialStore = new CredentialStore();
