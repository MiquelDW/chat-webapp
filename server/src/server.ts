import * as socket from "socket.io";
import http from "http";
import app from "./app";
import { socketHandlers } from "./sockets/socketHandlers";
import {
  streamDeletedRequests,
  streamNewRequests,
} from "./service/StreamServiceNotifications";
import {
  streamNewConversations,
  streamUpdatedConversationMembers,
  streamUpdatedConversations,
} from "./service/streamServiceConversation";
import { streamNewChatMessages } from "./service/streamServiceMessages";

// determine which port the server runs on
const PORT = process.env.PORT || 8080;

// create HTTP server that listens for and handles incoming HTTP requests, passing them to the Express 'app' for processing
const server = http.createServer(app);

// create new WebSockets server that enables real-time, bidirectional communication over the HTTP 'server'
const io = new socket.Server(server, {
  // allows cross-origin WebSockets requests with specific methods and permit credentials (cookies, authorization headers etc) to be included in the requests
  cors: { origin: true, methods: ["GET", "POST"], credentials: true },
});

// setup Socket event listeners
socketHandlers(io);

// set up the HTTP server to accept connections
server.listen(PORT, async () => {
  // logic to handle when a client connects to the HTTP server
  console.log(`Server is listening on port: ${PORT}`);
  // set up streams to make data available in real-time
  await Promise.all([
    streamNewChatMessages(io),
    streamNewRequests(io),
    streamDeletedRequests(io),
    streamNewConversations(io),
    streamUpdatedConversations(io),
    streamUpdatedConversationMembers(io),
  ]);
});
