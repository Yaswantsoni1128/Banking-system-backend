import mongoose from "mongoose";
import ledgers from "./ledger.models.js";

const accountSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true,
    required: [true, "Account must be associated with a user"]
  },
  status:{
    type: String,
    enum: {
      values: ["ACTIVE", "FROZEN" , "CLOSED"],
      message: "Status must be either ACTIVE, FROZEN, or CLOSED",
    },
    default: "ACTIVE"
  },
  currency:{
    type: String,
    required: [true, "Currency is required"],
    default: "INR"
  }
},{timestamps: true})

accountSchema.index({ user: 1, status: 1 });  // Compound index 

accountSchema.methods.getBalance = async function(){
    const accountId = this._id;

    const balanceData = await ledgers.aggregate([
      {$match: {account: accountId}},
      {
        $group: {
          _id: null,
          totalCredit:{
            $sum: {
              $cond: [
                {$eq: ["$type", "CREDIT"]},
                "$amount",
                0
              ]
            }
          },
          totalDebit:{
            $sum: {
              $cond: [
                {$eq: ["$type", "DEBIT"]},
                "$amount",
                0
              ]
            }
          },
        }
      },
      {
        $project: {
          _id: 0,
          balance: {
            $subtract: ["$totalCredit", "$totalDebit"]
          }
        }
      }
    ])

    if(balanceData.length === 0){
      return 0;
    }

    return balanceData[0].balance;
}

const Account = mongoose.model("Account", accountSchema)

export default Account;