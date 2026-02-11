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

      const isTransationExists = await Transaction.findOne({idempotencyKey});
      
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

      let transaction;
      
      try {
        /**
       * - Create transaction
       */
      const session = await mongoose.startSession();
      session.startTransaction(); // session started

      // save transaction with pending status and then update it to completed after saving ledger entries. This is to make sure that if any error occurs while saving ledger entries, we can easily identify the transaction as failed and also we can easily reverse the transaction if needed.
      transaction = (await Transaction.create(
        [{
          fromAccount,
          toAccount,
          amount,
          idempotencyKey,
          status: "PENDING"
        }],
        {session}
      ))[0]; 

      const debitLedger = await Ledger.create(
        [{
          account: fromAccount,
          amount,
          transaction: transaction._id,
          type: "DEBIT",
        }],
        {
          session
        }
      );
      
      
      await new Promise(resolve => setTimeout(resolve, 10000));



      const creaditLedger = await Ledger.create(
        [{
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "CREDIT",
        }],
        {
          session
        }
      )

      // update transaction status to completed after saving ledger entries
      transaction = await Transaction.findOneAndUpdate(
        {_id: transaction._id},
        {status: "COMPLETED"},
        {returnDocument: "after", session}
      )

      await session.commitTransaction(); // transaction commited
      session.endSession(); // session ended

      } catch (error) {
        return res.status(400).json({
          message: "Transaction is pending due to some error. Please try again later or contact support if the issue persists.",
        })
      }


      /**
       * - Send notification email to both sender
       */

      await sendTransactionEmail(req.user.email, req.user.name, toAccount, transaction);
      
      /**
       * - Return response       
      */
      res.status(201).json({
        message: "Transaction completed successfully",
        data: transaction
        });
    }),

    /**
     * - Create initial funds transaction for new accounts
     */
    createInitialFundsTransaction: asyncHandler(async (req, res) => {
        const {toAccount , amount , idempotencyKey} = req.body;

        if(!toAccount || !amount || !idempotencyKey){
          throw new ApiError(400, "All fields are required");
        }

        const fetchToAccount = await Account.findOne({_id: toAccount});

        if(!fetchToAccount){
          throw new ApiError(400, "To account not found");
        }
    
        const fetchSystemAccount = await Account.findOne({ user: req.user._id });

        if(!fetchSystemAccount){
          throw new ApiError(400, "System account not found");
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        const transaction = new Transaction(
          {
            fromAccount: fetchSystemAccount._id,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
          }
        )

        const debitLedger = await Ledger.create(
          [{
            account: fetchSystemAccount._id,
            amount,
            transaction: transaction._id,
            type: "DEBIT",
          }],
          {
            session
          }
        )
        const creaditLedger = await Ledger.create(
          [{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "CREDIT",
          }],
          {
            session
          }
        )

        transaction.status = "COMPLETED";
        await transaction.save({session});

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
          message: "Initial funds transaction completed successfully",
          data: transaction
        });
    })
}

export default transactionController;