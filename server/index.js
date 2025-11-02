import express from 'express'
import  mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import connectdb from './config/db.js'
import authRoutes from "./routes/auth.js";
import expenseRoutes from "./routes/expense.js";
import paymentRoutes from "./routes/payment.js";

dotenv.config();
const app=express();


app.use(cors());
app.use(express.json());



//connect to db
connectdb();


//using routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/payments", paymentRoutes);


const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{   console.log(`server is listening on port ${PORT}`)});



