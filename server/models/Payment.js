import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  type: {
    type: String,
    enum: ["subscription", "balance_topup"],
    default: "subscription",
  },
  description: {
    type: String,
    default: "Monthly subscription payment",
  },
}, {
  timestamps: true
});

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
