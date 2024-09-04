import { PrismaClient } from "@prisma/client";
import { withPulse } from "@prisma/extension-pulse";
import * as socket from "socket.io";
import { Server } from "socket.io";
import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";

const prisma = new PrismaClient().$extends(
  withPulse({
    apiKey: process.env.PULSE_API_KEY || "",
  })
);

// create Express app and enable Cross-Origin Resource Sharing
const app = express();
app.use(cors());

async function main() {}

// create HTTP server that listens for and handles incoming requests, passing them to the Express 'app' for processing
const server = http.createServer(app);

// create new WebSockets server that enables real-time, bidirectional communication over the HTTP 'server'
const io = new socket.Server(server, {
  // allows cross-origin WebSockets requests with specific methods and permit credentials (cookies, authorization headers etc) to be included in the requests
  cors: { origin: true, methods: ["GET", "POST"], credentials: true },
});

// determine which port the server runs on
const PORT = process.env.PORT || 8080;

// set up the HTTP server to accept connections
server.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
