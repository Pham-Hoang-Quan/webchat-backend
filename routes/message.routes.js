import express from "express";
import { getMessages, recallMessage, sendMessage } from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/:id", getMessages);
router.post("/send/:id/:senderId" ,sendMessage);
router.put('/recallMessage/:conversationId/:messageId', recallMessage);


export default router;
