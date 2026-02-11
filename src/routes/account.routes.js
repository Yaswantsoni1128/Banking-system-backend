import express from "express";
import authMiddleware from "../middlewares/auth.middlewares.js";
import accountController from "../controllers/account.controllers.js";

const router = express.Router();

router.use(authMiddleware);

/**
 * POST /api/v1/accounts
 * - Create a new account
 * - protect route
 */
router.post("/", accountController.createAccount);

export default router;