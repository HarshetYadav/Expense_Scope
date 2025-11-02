import express from "express";
import { signup, login, getProfile, updateProfile, updateBalance, subscribe, forgotPassword, resetPassword } from "../Controllers/authControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/profile", authMiddleware, getProfile); // protected route
router.put("/profile", authMiddleware, updateProfile); // protected route
router.put("/balance", authMiddleware, updateBalance); // protected route
router.post("/subscribe", authMiddleware, subscribe); // protected route

export default router;
