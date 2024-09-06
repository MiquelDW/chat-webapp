import express from "express";
import cors from "cors";
// modules where various API endpoints are defined
import messageRoutes from "./routes/messageRoutes";

// create Express app and enable Cross-Origin Resource Sharing
const app = express();

// enable CORS in your Express app to allow your server to accept requests from different origins (domains or ports)
app.use(cors());

// use the routes defined in the given modules for handling HTTP requests
app.use(messageRoutes);

export default app;
