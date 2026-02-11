import express from "express";
import transactionController from "../controllers/transaction.controllers.js";
import authMiddleware from "../middlewares/auth.middlewares.js";

const router = express.Router();

/**
 * - POST /api/v1/transactions
 * - Create a new transaction
 * - Private
 */
router.post("/" ,  authMiddleware,  transactionController.createTransaction)

export default router;