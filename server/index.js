import express from 'express'
import  mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import connectdb from './config/db.js'
import authRoutes from "./routes/auth.js";
import expenseRoutes from "./routes/expense.js";
import paymentRoutes from "./routes/payment.js";

dotenv.config();
const app=express();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

//connect to db
connectdb();

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/payments", paymentRoutes);

// Serve static files from the React app
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// Express 5 compatible catch-all route
app.use((req, res, next) => {
  // If the request is for an API route, pass it along
  if (req.path.startsWith('/api')) {
    return next();
  }
  // Otherwise, serve the React app
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{   console.log(`server is listening on port ${PORT}`)});



