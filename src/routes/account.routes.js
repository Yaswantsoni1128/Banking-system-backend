import express from "express";
import protect from "../middlewares/auth.middlewares.js";
import accountController from "../controllers/account.controllers.js";

const router = express.Router();

router.use(protect.authMiddleware);

/**
 * - POST /api/v1/accounts
 * - Create a new account
 * - protect route
 */
router.post("/", accountController.createAccount);
router.get("/", accountController.getUserAccounts);
router.get("/balance/:accountId", accountController.getUserBalance);

export default router;