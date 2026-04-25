import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Application, ApplicationAdapter } from "./index";
import { generateSerial } from "./serial";

export function createFileAdapter(dataDir: string): ApplicationAdapter {
  const file = path.join(dataDir, "applications.jsonl");

  async function readAll(): Promise<Application[]> {
    try {
      const raw = await fs.readFile(file, "utf8");
      return raw
        .split("\n")
        .filter(Boolean)
        .map((l) => JSON.parse(l) as Application);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw e;
    }
  }

  return {
    async save(input) {
      await fs.mkdir(dataDir, { recursive: true });
      const existing = await readAll();
      const application: Application = {
        ...input,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        status: "pending",
        serial: generateSerial(existing.length + 1),
      };
      await fs.appendFile(
        file,
        JSON.stringify(application) + "\n",
        "utf8"
      );
      return application;
    },

    async findByEmail(email) {
      const all = await readAll();
      return all.find((a) => a.email === email.toLowerCase()) ?? null;
    },

    async get(id) {
      const all = await readAll();
      return all.find((a) => a.id === id) ?? null;
    },
  };
}
