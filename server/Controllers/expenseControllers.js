import Expense from "../models/Expense.js";
import User from "../models/user.js";


export const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    const userId = req.user._id;

    // Validate amount is positive
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        message: "Expense amount must be greater than zero. Negative expenses are not allowed." 
      });
    }

    // Validate date is not in the future
    const expenseDate = new Date(date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    if (expenseDate > today) {
      return res.status(400).json({ 
        message: "You cannot enter a future date. Please select today's date or a past date." 
      });
    }

    // Check if user has sufficient balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.balance < amount) {
      return res.status(400).json({ 
        message: `Insufficient balance. You have $${user.balance.toFixed(2)} available, but trying to spend $${amount.toFixed(2)}. Please add funds to your account before adding this expense.` 
      });
    }

    // Create the expense
    const expense = await Expense.create({
      user: userId,
      title,
      amount,
      category,
      date,
    });

    // Deduct the amount from user's balance
    user.balance -= amount;
    await user.save();

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { user: req.user._id };
    
    // Add date filtering if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    const expenses = await Expense.find(query).sort({
      date: -1,
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date } = req.body;
    const userId = req.user._id;

    // Validate amount is positive
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        message: "Expense amount must be greater than zero. Negative expenses are not allowed." 
      });
    }

    // Validate date is not in the future
    if (date) {
      const expenseDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (expenseDate > today) {
        return res.status(400).json({ 
          message: "You cannot enter a future date. Please select today's date or a past date." 
        });
      }
    }

    // Find the original expense to get the old amount
    const originalExpense = await Expense.findOne({
      _id: id,
      user: userId,
    });

    if (!originalExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const amountDifference = amount - originalExpense.amount;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user has sufficient balance for the increase
    if (amountDifference > 0 && user.balance < amountDifference) {
      return res.status(400).json({ 
        message: `Insufficient balance. You have $${user.balance.toFixed(2)} available, but need $${amountDifference.toFixed(2)} more.` 
      });
    }

    // Update the expense
    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: userId },
      { title, amount, category, date },
      { new: true }
    );

    // Adjust user's balance based on the amount difference
    user.balance -= amountDifference;
    await user.save();

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the expense first to get the amount
    const expense = await Expense.findOne({
      _id: id,
      user: userId,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Delete the expense
    await Expense.findByIdAndDelete(id);

    // Add the amount back to user's balance
    const user = await User.findById(userId);
    if (user) {
      user.balance += expense.amount;
      await user.save();
    }

    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = { user: req.user._id };

    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const summary = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    
    const formattedSummary = summary.map((item) => ({
      category: item._id,
      totalAmount: item.totalAmount,
      count: item.count,
    }));

    const totalSpent = formattedSummary.reduce(
      (acc, cat) => acc + cat.totalAmount,
      0
    );

    res.json({ totalSpent, summary: formattedSummary });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /expenses/monthly
export const getMonthlyExpenses = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          amount: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Format the data for the frontend
    const formattedData = monthlyData.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      amount: item.amount
    }));

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /expenses/date-comparison - Compare selected date vs previous day spending
export const getDateComparison = async (req, res) => {
  try {
    const { selectedDate } = req.query;
    
    // Use provided date or default to today
    const selected = selectedDate ? new Date(selectedDate) : new Date();
    selected.setHours(0, 0, 0, 0);
    const selectedEnd = new Date(selected);
    selectedEnd.setHours(23, 59, 59, 999);

    const previousDay = new Date(selected);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayEnd = new Date(previousDay);
    previousDayEnd.setHours(23, 59, 59, 999);

    // Get selected date expenses
    const selectedExpenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: selected, $lte: selectedEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get previous day expenses
    const previousExpenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: previousDay, $lte: previousDayEnd }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    const selectedTotal = selectedExpenses.length > 0 ? selectedExpenses[0].totalAmount : 0;
    const selectedCount = selectedExpenses.length > 0 ? selectedExpenses[0].count : 0;
    const previousTotal = previousExpenses.length > 0 ? previousExpenses[0].totalAmount : 0;
    const previousCount = previousExpenses.length > 0 ? previousExpenses[0].count : 0;

    res.json({
      selected: {
        amount: selectedTotal,
        count: selectedCount,
        date: selected.toISOString().split('T')[0]
      },
      previous: {
        amount: previousTotal,
        count: previousCount,
        date: previousDay.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET /expenses/weekly - Get past 7 days spending
export const getWeeklyExpenses = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Past 7 days including today
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Get daily expenses for past 7 days
    const weeklyData = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: sevenDaysAgo, $lte: today }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" }
          },
          amount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    // Format the data and fill in missing days with 0
    const formattedData = [];
    const dateMap = new Map();
    
    weeklyData.forEach(item => {
      const dateStr = `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`;
      dateMap.set(dateStr, {
        date: dateStr,
        amount: item.amount,
        count: item.count
      });
    });

    // Fill in all 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (dateMap.has(dateStr)) {
        formattedData.push(dateMap.get(dateStr));
      } else {
        formattedData.push({
          date: dateStr,
          amount: 0,
          count: 0
        });
      }
    }

    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
