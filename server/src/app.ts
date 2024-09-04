import express from "express";
import cors from "cors";
import messageRoutes from "./routes/messageRoutes";

// create Express app and enable Cross-Origin Resource Sharing
const app = express();
// middleware
app.use(cors());

// Routes
app.use(messageRoutes);

export default app;
