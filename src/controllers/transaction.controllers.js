import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import Transaction from "../models/transaction.models.js";
import Account from "../models/account.models.js";
import mongoose from "mongoose";
import Ledger from "../models/ledger.models.js";
import { sendTransactionEmail } from "../services/email.service.js";

const transactionController = {
    createTransaction: asyncHandler(async (req, res) => {

      /**
       * 1- Validate request
       */
      const {fromAccount , toAccount , idempotencyKey, amount} = req.body;

      if(!fromAccount ||  !toAccount || !idempotencyKey || !amount){
        throw new ApiError(400 , "All fields are required");
      }

      const userFromAccount = await Account.findOne({_id: fromAccount});
      const userToAccount = await Account.findOne({_id: toAccount});

      if(!userFromAccount || !userToAccount){
        throw new ApiError(400, "Account with these accounts are not there")
      }

      /**
       * - Validate idempotency key
       */

      const isTransationExists = await Transaction({idempotencyKey});
      
      if(isTransationExists){

        if(isTransationExists.status === "COMPLETED"){
          return res.status(200).json({
            message: "Transaction already completed",
            data: isTransationExists
          });
        }

        if(isTransationExists.status === "PENDING"){
          return res.status(200).json({
            message: "Transaction is still pending"
          });
        }

        if(isTransationExists.status === "FAILED"){
          throw new ApiError(500, "Transaction with this idempotency key already failed. Please try again with a new idempotency key");
        }

        if(isTransationExists.status === "REVERSED"){
          throw new ApiError(500, "Transaction with this idempotency key has already been reversed. Please try again with a new idempotency key");
        }
      }

      /**
       * - Check account status
       */

      if(userFromAccount.status !== "ACTIVE" || userToAccount.status !== "ACTIVE"){
        throw new ApiError(400, "Both accounts must be active");
      }

      /**
       * - Check balance of sender account
       */

      const fromAccountBalance = await userFromAccount.getBalance();

      if(fromAccountBalance < amount){
        throw new ApiError(400, "Insufficient balance in sender account");
      }

      /**
       * - Create transaction
       */
      const session = await mongoose.startSession();
      session.startTransaction(); // session started

      const transaction = await Transaction.create(
        {
          fromAccount,
          toAccount,
          amount,
          idempotencyKey,
          status: "PENDING"
        },
        {
          session
        }
      )

      const debitLedger = await Ledger.create(
        {
          account: fromAccount,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
        {
          session
        }
      )
      const creaditLedger = await lender.create(
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
        {
          session
        }
      )

      transaction.status = "COMPLETED";
      await transaction.save({session});

      await session.commitTransaction(); // transaction commited
      session.endSession(); // session ended


      /**
       * - Send notification email to both sender and receiver
       */
      sendTransactionEmail(userFromAccount.email, userFromAccount.name, toAccount, transaction);
      sendTransactionEmail(userToAccount.email, userToAccount.name, toAccount, transaction);
     
      /**
       * - Return response       
      */
      res.status(201).json({
        message: "Transaction completed successfully",
        data: transaction
        });
    }),
}

export default transactionController;