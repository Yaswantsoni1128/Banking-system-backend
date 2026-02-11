import express from "express";
import transactionController from "../controllers/transaction.controllers.js";
import protect from "../middlewares/auth.middlewares.js";

const router = express.Router();

/**
 * - POST /api/v1/transactions
 * - Create a new transaction
 * - Private
 */
router.post("/" ,  protect.authMiddleware,  transactionController.createTransaction)

/**
 * - POST /api/v1/transactions/system/initial-funds
 */
router.post("/system/initial-funds", protect.authSystemMiddleware, transactionController.createInitialFundsTransaction)

export default router;