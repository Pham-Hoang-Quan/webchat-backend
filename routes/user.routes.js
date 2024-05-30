import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUsersForSidebar, getUserById, getUserByUsername } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/",getUsersForSidebar); 
router.get("/:id",getUserById);
router.get("/getByUsername/:username",getUserByUsername);


export default router;
