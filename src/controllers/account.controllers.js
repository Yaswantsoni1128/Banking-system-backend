import Account from "../models/account.models.js";
import asyncHandler from "../utils/asyncHandler.js";

const accountController = {
  /**
   * - Create a new bank account
   * - POST /api/v1/accounts
   * - Private
   */
  createAccount: asyncHandler(async(req , res) => {
      const decodedUser = req.user;
      const account = await Account.create({user: decodedUser.id })

      res.status(201).json({
          success: true,
          message: "Account created successfully",
          data: account
      })
  }),
};

export default accountController;