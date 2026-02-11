import dotenv from "dotenv";
import express from "express";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";


dotenv.config();

const app = express();

app.use(express.json()); // To parse JSON request bodies 
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded request bodies
app.use(express.static("public")); // To serve static files from the "public" directory
app.use(cookieParser()); // To parse cookies from incoming requests
app.use(morgan("dev")); // To log HTTP requests in the "dev" format

/**
 * Import routes
 */
import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/account.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";

/**
 * Health check route
 */
app.get("/", (req, res) => {
  res.send("Banking system API is running");
});
/**
 * Mount routes
 */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/transactions", transactionRoutes);

connectDB();



export default app;