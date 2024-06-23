import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUsersForSidebar, getConversationsWithMostMessages, countBlockedUsersByMonth, getUserById, getUserByUsername, getAllUsers, blockUser, getAllBlockedUsers, unblockUser, countUsersByDay } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getUsersForSidebar); 
router.get("/all", getAllUsers);
router.get("/static", countUsersByDay);
router.get("/staticBlockUser", countBlockedUsersByMonth);  
router.get("/mostMessage", getConversationsWithMostMessages); 
router.put("/unBlock/:id", unblockUser);
router.get("/getByUsername/:username", getUserByUsername);
router.get("/getBlockUsers", getAllBlockedUsers); 
router.get("/:id", getUserById);
router.put("/block/:id", blockUser); 

export default router;
