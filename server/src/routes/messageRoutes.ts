// router object to define API endpoints
import { Router } from "express";
import { getMessages } from "../controllers/messageController";

const router = Router();

// define a GET API endpoint at /messages and execute the getMessages function to handle incoming requests
// make this dynamic
router.get("/messages/:id", getMessages);

export default router;
