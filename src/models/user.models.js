import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true , "Name is required to creating an account"],
  },
  email: {
    type: String,
    required: [true, "Email is required to creating an account"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: "Please enter a valid email address",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required to creating an account"],
    minlength: [6, "Password must be at least 6 characters long"],
    select: false
  },
  systemUser: {
    type: Boolean,
    default: false,
    immutable: true,
    select: false
  }
},{timestamps: true});

userSchema.pre("save", async function() {
  // Hash the password before saving
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
  
  return;
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
