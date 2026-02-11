import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: [true, "Account is required"],
    index: true,
    immutable: true
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0, "Amount must be positive"],
    immutable: true
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: [true, "Transaction is required"],
    immutable: true,
    index: true
  },
  type: {
    type: String,
    enum:{
      values: ["CREDIT", "DEBIT"],
      message: "Type must be either CREDIT or DEBIT"
    },
    immutable: true,
    required: [true, "Type is required"]
  }
},{
  timestamps: true
});

function preventLedgerModification() {
  throw new Error("Ledger documents are immutable and cannot be modified or deleted");
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("update", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("findOneAndRemove", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);


const Ledger = mongoose.model("Ledger", ledgerSchema);

export default Ledger;