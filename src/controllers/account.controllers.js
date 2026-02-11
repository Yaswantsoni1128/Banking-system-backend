import Account from "../models/account.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

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
  /**
   * - Get all accounts of the logged in user
   */
  getUserAccounts: asyncHandler(async(req, res) => {
      const user = req.user;

      const accounts = await Account.find({user: user._id});

      return res.status(200).json({
        success: true,
        message: "Accounts fetched successfully",
        data: accounts
    })
  }),
  /**
   * - Get balance of a specific account
   */
  getUserBalance: asyncHandler(async(req, res) => {
      const {accountId} = req.params;

      const account = await Account.findOne({_id: accountId, user: req.user._id}); 

      if(!account){
        throw new ApiError(404, "Account not found");
      }

      const balance = await account.getBalance();

      return res.status(200).json({
        success: true,
        message: "Balance fetched successfully",
        data: {
          accountId,
          balance
        }
      })
  })
};

export default accountController;