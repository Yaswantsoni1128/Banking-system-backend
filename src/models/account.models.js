import mongoose from "mongoose";

const accountSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
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

const Account = mongoose.model("account", accountSchema)

export default Account;