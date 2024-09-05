// router object to define API endpoints
import { Router } from "express";
import {
  getRequests,
  getRequestsCount,
} from "../controllers/notificationController";

const router = Router();

// define a GET API endpoints and execute the the given function to handle incoming requests
router.get("/requests/:id", getRequests);
router.get("/requestsCount/:id", getRequestsCount);

export default router;
