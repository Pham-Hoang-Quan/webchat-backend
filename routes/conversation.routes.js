import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { createConversationUser, getConversationsByUserId } from "../controllers/conversation.controller.js";

const router = express.Router();

router.get("/get/:userId", getConversationsByUserId); // get các cuộc trò chuyện của user
router.post("/creact/:id/:myId",createConversationUser); // id của người nhận và id của mình


export default router;