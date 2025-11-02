import express from "express";
import { getPayments, createPayment } from "../Controllers/paymentControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(authMiddleware);

router.get("/", getPayments);
router.post("/", createPayment);

export default router;
