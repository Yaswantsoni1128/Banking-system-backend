import mongoose from "mongoose";

const tokenBlackListSchema = new mongoose.Schema({
  token: {
    type: String,
    required: [true, "Token is required to blacklist"],
    unique: true,
  }
},{timestamps: true})

tokenBlackListSchema.index({ createdAt: 1 }, {
  expireAfterSeconds: 60 * 60 * 24 * 3 // Expire documents after 3 days
}); // Index on token field for faster lookups

const TokenBlackList = mongoose.model("TokenBlackList", tokenBlackListSchema);

export default TokenBlackList;