import Payment from "../models/Payment.js";

// GET /payments - Get user's payment history
export const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ date: -1 });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /payments - Create a new payment record
export const createPayment = async (req, res) => {
  try {
    const { amount, type, description } = req.body;
    
    const payment = await Payment.create({
      user: req.user._id,
      amount,
      type: type || 'subscription',
      description: description || 'Monthly subscription payment'
    });
    
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
