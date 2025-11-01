const blacklistedTokenModel = require("../Model/blacklistedToken.model");
const userModel = require("../Model/user.model")
const jwt = require('jsonwebtoken')

exports.verifyUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ status: "failed", message: "Email and password are required" });
        }

        const foundUser = await userModel.findOne({ email });
        if (!foundUser) {
            return res.status(401).json({ status: "failed", message: "Invalid credentials" });
        }

        const isPasswordCorrect = await foundUser.checkPassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ status: "failed", message: "Invalid credentials" });
        }
        req.user = foundUser;
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
}

exports.verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header OR cookie
    const token =
      req.headers.authorization?.split(" ")[1] || // from header: "Bearer <token>"
      req.cookies?.token;                         // from cookie: token=<token>

    if (!token) {
      return res.status(400).json({
        status: "Failed",
        message: "Token not provided",
      });
    }
    const checkBlacklisted = await blacklistedTokenModel.findOne({token})
    if(checkBlacklisted){
      return res.status(400).json({
        status: "Failed",
        message: "Invalid Token",
      });
    }
    // Verify token
    const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!verifiedToken) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid Token",
      });
    }
    const id = verifiedToken.id
    const user = await userModel.findById(id).select("-password")
    if(!user){
        return res.status(400).json({status: "Failed" , message: "Something went wrong"})
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);

    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ status: "Failed", message: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ status: "Failed", message: "Invalid token" });
    }

    // General fallback
    return res.status(500).json({
      status: "Failed",
      message: "Server error during token verification",
    });
  }
};
