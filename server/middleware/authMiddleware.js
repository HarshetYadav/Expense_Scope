import jwt from "jsonwebtoken";
import User from "../models/user.js";


const authMiddleware = async (req, res, next) => {
  try {
   
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1]; 

    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Attach user to request object
    req.user = await User.findById(decoded.id).select("-password"); // remove password

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    next(); 
  } catch (error) {
    console.error("AuthMiddleware error:", error.message);
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export default authMiddleware;
