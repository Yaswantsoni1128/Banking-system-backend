import User from "../models/user.models.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";

const authMiddleware = asyncHandler(async(req , res , next) => {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1]
    console.log("token:", token);
    if(!token){
      return next(new ApiError(401, "Unauthorized"))
    }

    const decoded = jwt.verify(token , process.env.JWT_SECRET);
    console.log(decoded)
    const user = await User.findOne({ _id: decoded.userId }) // make sure to use userId

    if(!user){
      return next(new ApiError(401, "Unauthorized"))
    }

    req.user = user;
    next();

})

export default authMiddleware;