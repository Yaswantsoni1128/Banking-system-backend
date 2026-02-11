import User from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import TokenBlackList from "../models/blackList.models.js";

const protect =  {
  /**
   * - Middleware to protect routes and ensure only authenticated users can access them
   */
  authMiddleware: asyncHandler(async(req , res , next) => {
      const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]
      
      if(!token){
        throw new ApiError(401, "Unauthorized")
      }

      const isBlackListed = await TokenBlackList.findOne({ token });

      if (isBlackListed) {
        throw new ApiError(401, "Unauthorized - Token is Invalid");
      }

      const decoded = jwt.verify(token , process.env.JWT_SECRET);
      
      const user = await User.findOne({ _id: decoded.userId }) // make sure to use userId

      if(!user){
        throw new ApiError(401, "Unauthorized")
      }

      req.user = user;
      next();
  }),
  /**
   * - Middleware to protect routes and ensure only system users can access them
   */
  authSystemMiddleware: asyncHandler(async(req , res , next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]
    
    if(!token){
      throw new ApiError(401, "Unauthorized - No token provided");
    }

    const isBlackListed = await TokenBlackList.findOne({ token });

    if (isBlackListed) {
      throw new ApiError(401, "Unauthorized - Token is Invalid");
    }

    const decoded = jwt.verify(token , process.env.JWT_SECRET);
    
    const user = await User.findOne({ _id: decoded.userId }).select("+systemUser");
    
    if(!user){
      throw new ApiError(401, "Unauthorized - User not found");
    }
    
    if(!user.systemUser){
      throw new ApiError(403, "Forbidden - User is not a system user");
    }

    req.user = user;
    return next();
  })
}

export default protect;