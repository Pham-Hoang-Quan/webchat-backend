import express from "express";
import { startCall } from "../controllers/videoCall.controller.js";
import protectRoute from "../middleware/protectRoute.js";
const router = express.Router();

// Route để bắt đầu cuộc gọi
router.post("/start/:callerId/:receiverId", startCall);

export default router;