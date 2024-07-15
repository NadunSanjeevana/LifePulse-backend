const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Adjust the path as necessary

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded, "jj");
    req.user = await User.findById(decoded.userId).select(
      "-password -createdAt -updatedAt"
    );
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    next();
  } catch (err) {
    console.error("Something went wrong with the auth middleware", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authMiddleware;
