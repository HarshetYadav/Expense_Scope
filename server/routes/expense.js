import express from "express";
import { createExpense, getExpenses, updateExpense, deleteExpense, getSummary, getMonthlyExpenses, getDateComparison, getWeeklyExpenses } from "../Controllers/expenseControllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { requireActiveSubscription } from "../middleware/subscriptionMiddleware.js";

const router = express.Router();

// All routes are protected and require active subscription
router.use(authMiddleware);
router.use(requireActiveSubscription);

router.post("/", createExpense);
router.get("/", getExpenses);
router.get("/summary", getSummary);
router.get("/monthly", getMonthlyExpenses);
router.get("/date-comparison", getDateComparison);
router.get("/weekly", getWeeklyExpenses);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
