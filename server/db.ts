import { eq, gte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, registrations, InsertRegistration, settings } from "../drizzle/schema";
import { ENV } from './_core/env';
import * as fs from "fs";
import * as path from "path";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect to MySQL:", error);
      _db = null;
    }
  }
  return _db;
}

// JSON DB Fallback implementation
const JSON_DB_PATH = path.resolve(process.cwd(), "db.json");

interface JsonDbSchema {
  users: Array<{
    id: number;
    openId: string;
    name: string | null;
    email: string | null;
    loginMethod: string | null;
    role: "user" | "admin";
    createdAt: string;
    updatedAt: string;
    lastSignedIn: string;
  }>;
  registrations: Array<{
    id: number;
    name: string;
    company: string;
    title: string;
    phone: string;
    email: string;
    createdAt: string;
  }>;
  settings: Array<{
    key: string;
    value: string;
    updatedAt: string;
  }>;
}

function readJsonDb(): JsonDbSchema {
  try {
    if (!fs.existsSync(JSON_DB_PATH)) {
      const initial: JsonDbSchema = { users: [], registrations: [], settings: [] };
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const content = fs.readFileSync(JSON_DB_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("[JsonDB] Failed to read db.json:", error);
    return { users: [], registrations: [], settings: [] };
  }
}

function writeJsonDb(data: JsonDbSchema) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("[JsonDB] Failed to write db.json:", error);
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (db) {
    try {
      const values: InsertUser = { openId: user.openId };
      const updateSet: Record<string, unknown> = {};

      const textFields = ["name", "email", "loginMethod"] as const;
      type TextField = (typeof textFields)[number];

      const assignNullable = (field: TextField) => {
        const value = user[field];
        if (value === undefined) return;
        const normalized = value ?? null;
        values[field] = normalized;
        updateSet[field] = normalized;
      };

      textFields.forEach(assignNullable);

      if (user.lastSignedIn !== undefined) {
        values.lastSignedIn = user.lastSignedIn;
        updateSet.lastSignedIn = user.lastSignedIn;
      }
      if (user.role !== undefined) {
        values.role = user.role;
        updateSet.role = user.role;
      } else if (user.openId === ENV.ownerOpenId) {
        values.role = 'admin';
        updateSet.role = 'admin';
      }

      if (!values.lastSignedIn) {
        values.lastSignedIn = new Date();
      }

      if (Object.keys(updateSet).length === 0) {
        updateSet.lastSignedIn = new Date();
      }

      await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
      return;
    } catch (error) {
      console.warn("[Database] MySQL operation failed, falling back to JSON DB:", error);
    }
  }

  const data = readJsonDb();
  const existingIndex = data.users.findIndex(u => u.openId === user.openId);
  const now = new Date().toISOString();

  let role: "user" | "admin" = user.role ?? "user";
  if (user.openId === ENV.ownerOpenId) {
    role = "admin";
  }

  if (existingIndex >= 0) {
    const existing = data.users[existingIndex];
    data.users[existingIndex] = {
      ...existing,
      name: user.name !== undefined ? (user.name ?? null) : existing.name,
      email: user.email !== undefined ? (user.email ?? null) : existing.email,
      loginMethod: user.loginMethod !== undefined ? (user.loginMethod ?? null) : existing.loginMethod,
      role: user.role !== undefined ? role : existing.role,
      lastSignedIn: user.lastSignedIn ? user.lastSignedIn.toISOString() : now,
      updatedAt: now,
    };
  } else {
    data.users.push({
      id: data.users.length + 1,
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: user.lastSignedIn ? user.lastSignedIn.toISOString() : now,
    });
  }
  writeJsonDb(data);
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (db) {
    try {
      const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
      return result.length > 0 ? result[0] : undefined;
    } catch (error) {
      console.warn("[Database] MySQL operation failed, falling back to JSON DB:", error);
    }
  }

  const data = readJsonDb();
  const user = data.users.find(u => u.openId === openId);
  if (!user) return undefined;
  return {
    ...user,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
    lastSignedIn: new Date(user.lastSignedIn),
  };
}

export async function createRegistration(reg: InsertRegistration) {
  const db = await getDb();
  if (db) {
    try {
      const result = await db.insert(registrations).values(reg);
      return result;
    } catch (error) {
      console.warn("[Database] MySQL operation failed, falling back to JSON DB:", error);
    }
  }

  const data = readJsonDb();
  const newReg = {
    id: data.registrations.length + 1,
    name: reg.name,
    company: reg.company,
    title: reg.title,
    phone: reg.phone,
    email: reg.email,
    createdAt: new Date().toISOString(),
  };
  data.registrations.push(newReg);
  writeJsonDb(data);
  return { insertId: newReg.id };
}

export async function listRegistrations() {
  const db = await getDb();
  if (db) {
    try {
      return await db.select().from(registrations).orderBy(registrations.createdAt);
    } catch (error) {
      console.warn("[Database] MySQL operation failed, falling back to JSON DB:", error);
    }
  }

  const data = readJsonDb();
  const sorted = [...data.registrations].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return sorted.map(r => ({
    ...r,
    createdAt: new Date(r.createdAt),
  }));
}

export async function countRegistrations(): Promise<number> {
  const db = await getDb();
  if (db) {
    try {
      const result = await db.select({ count: sql<number>`count(*)` }).from(registrations);
      return Number(result[0]?.count ?? 0);
    } catch (error) {
      console.warn("[Database] MySQL operation failed, falling back to JSON DB:", error);
    }
  }

  const data = readJsonDb();
  return data.registrations.length;
}

export async function countTodayRegistrations(): Promise<number> {
  const db = await getDb();
  if (db) {
    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(registrations)
        .where(gte(registrations.createdAt, todayStart));
      return Number(result[0]?.count ?? 0);
    } catch (error) {
      console.warn("[Database] MySQL operation failed, falling back to JSON DB:", error);
    }
  }

  const data = readJsonDb();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartTime = todayStart.getTime();

  return data.registrations.filter(r => new Date(r.createdAt).getTime() >= todayStartTime).length;
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (db) {
    try {
      const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
      return result.length > 0 ? result[0].value : null;
    } catch (error) {
      console.warn("[Database] MySQL operation failed, falling back to JSON DB:", error);
    }
  }

  const data = readJsonDb();
  const setting = data.settings.find(s => s.key === key);
  return setting ? setting.value : null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (db) {
    try {
      await db
        .insert(settings)
        .values({ key, value })
        .onDuplicateKeyUpdate({ set: { value } });
      return;
    } catch (error) {
      console.warn("[Database] MySQL operation failed, falling back to JSON DB:", error);
    }
  }

  const data = readJsonDb();
  const existingIndex = data.settings.findIndex(s => s.key === key);
  const now = new Date().toISOString();
  if (existingIndex >= 0) {
    data.settings[existingIndex] = {
      key,
      value,
      updatedAt: now,
    };
  } else {
    data.settings.push({
      key,
      value,
      updatedAt: now,
    });
  }
  writeJsonDb(data);
}

export async function deleteRegistration(id: number): Promise<void> {
  const db = await getDb();
  if (db) {
    try {
      await db.delete(registrations).where(eq(registrations.id, id));
      return;
    } catch (error) {
      console.warn("[Database] MySQL operation failed, falling back to JSON DB:", error);
    }
  }

  const data = readJsonDb();
  data.registrations = data.registrations.filter(r => r.id !== id);
  writeJsonDb(data);
}
