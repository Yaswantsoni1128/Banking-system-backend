import User from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { sendRegistrationEmail } from "../services/email.service.js";
import TokenBlackList from "../models/blackList.models.js";


const authController = {
    /**
    * - User Registration
    * - POST /api/v1/auth/register
    */
  registerUser: asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const isExists = await User.findOne({email: email})

    if(isExists){
      throw new ApiError(422, "User already exists");
    }

    const user = await User.create({
      email, password, name
    })

    const token = jwt.sign({userId: user._id},
      process.env.JWT_SECRET,
      {expiresIn: '3d'}
    )

    res.cookie("token", token)

    res.status(201).json({
      message: "User created successfully",
      data:{
        _id: user._id,
        email: user.email,
        name: user.name
      },
      token
    })

    await sendRegistrationEmail(user);

  }),
  /**
    * - User Login
    * - POST /api/v1/auth/login
  */
  loginUser: asyncHandler(async (req,res)=>{
    const {email, password} = req.body;

    const user = await User.findOne({email}).select("+password");

    if(!user){
      throw new ApiError(401, "User not found")
    }

    const isMatched = await user.comparePassword(password); // make sure user should be finded user not User 

    if(!isMatched){
      throw new ApiError(401, "Email or password invalid")
    }

    const token = jwt.sign({userId: user._id},
      process.env.JWT_SECRET,
      {expiresIn: '3d'}
    )

    res.cookie("token", token)

    res.status(200).json({
      message: "Login successfully",
      data:{
        _id: user._id,
        email: user.email,
        name: user.name
      },
      token
    })
  }),

  /*
    * - User Logout
  */
  logoutUser: asyncHandler(async (req, res) => {
      const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

      if (!token) {
        throw new ApiError(401, "Unauthorized - No token provided");
      }

      res.clearCookie("token");

      // Add token to blacklist
      await TokenBlackList.create({ token });

      res.status(200).json({
        message: "User Logout successfully"
      });

  })
} 

export default authController;