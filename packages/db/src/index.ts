export interface Application {
  id: string;
  name: string;
  email: string;
  role: string;
  industry: string;
  essayValues: string;
  essayGrowth: string;
  referral?: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  serial: string;
}

export interface ApplicationAdapter {
  save(input: Omit<Application, "id" | "createdAt" | "status" | "serial">): Promise<Application>;
  findByEmail(email: string): Promise<Application | null>;
  get(id: string): Promise<Application | null>;
}

export { createFileAdapter } from "./file-adapter";
export { generateSerial } from "./serial";
