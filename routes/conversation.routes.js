import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { createConversationUser, getConversationById, getConversationsByUserId, getParticipants } from "../controllers/conversation.controller.js";

const router = express.Router();

router.get("/get/:userId", getConversationsByUserId); // get các cuộc trò chuyện của user
router.post("/creact/:id/:myId",createConversationUser); // id của người nhận và id của mình
router.get("/getParticipants/:conversationId/:currentUserId", getParticipants) // lấy các thành viên trong conversation trừ user hiện tại
router.get("/getConversationById/:conversationId/:userId", getConversationById)
export default router;