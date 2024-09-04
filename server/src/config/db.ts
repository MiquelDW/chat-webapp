import { PrismaClient } from "@prisma/client";
import { withPulse } from "@prisma/extension-pulse";

const db = new PrismaClient().$extends(
  withPulse({
    apiKey: process.env.PULSE_API_KEY || "",
  })
);

export default db;