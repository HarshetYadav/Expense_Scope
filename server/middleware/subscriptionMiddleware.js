import User from "../models/user.js";

// Middleware to check if user's subscription is active
export const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if subscription has expired
    const now = new Date();
    const subscriptionEndsAt = new Date(user.subscriptionEndsAt);
    
    if (now > subscriptionEndsAt) {
      return res.status(403).json({ 
        error: "subscription_expired",
        message: "Your subscription has expired. Please renew to continue using the service.",
        subscriptionEndsAt: user.subscriptionEndsAt
      });
    }

    // Subscription is active, continue to next middleware
    next();
  } catch (error) {
    console.error("Subscription check error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Middleware to check subscription for specific routes
export const requireActiveSubscription = (req, res, next) => {
  // Skip subscription check for auth routes and balance management
  const allowedRoutes = [
    '/api/auth/profile',
    '/api/auth/balance',
    '/api/auth/subscribe'
  ];
  
  if (allowedRoutes.includes(req.path)) {
    return next();
  }
  
  return checkSubscription(req, res, next);
};
