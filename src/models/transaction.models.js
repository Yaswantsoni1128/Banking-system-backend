import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    fromAccount:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      index: true,
      required: [true, "From account is required"]
    },
    toAccount:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      index: true,
      required: [true, "To account is required"]
    },
    status:{
      type: String,
      enum:{
        values: ["PENDING","COMPLETED","REVERSED","FAILED"],
        message: "Status must be either PENDING, COMPLETED, REVERSED, or FAILED"
      },
      default: "PENDING"
    },
    amount: {
      type: Number,
      required:[true, "Amount is required"],
      min: [0, "Amount must be positive"]
    },
    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required"],
      unique: true,
      index: true
    }
},{
  timestamps: true
});

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;