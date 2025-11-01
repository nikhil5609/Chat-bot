const { validationResult } = require('express-validator');
const userModel = require('../Model/user.model.js');
const blacklistedTokenModel = require('../Model/blacklistedToken.model.js');

exports.createUser = async (req, res) => {
    // validation
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ status: "failed", errors: errors.array() });
        }
        // Collecting Data
        const { name, email, password, age } = req.body

        // check existing user
        const existing = await userModel.findOne({ email });
        if (existing) {
            return res.status(409).json({ status: "failed", message: "Email already registered" });
        }

        // Hash Password
        const hashedPassword = await userModel.hashPassword(password);
        if (!hashedPassword) {
            return res.status(500).json({ status: "failed", message: "Failed to hash password" });
        }

        // Create User in DB
        const user = new userModel({ name, email, password: hashedPassword, age });
        await user.save();
        if (!user || !user._id) {
            return res.status(500).json({ status: "failed", message: "Failed to register user" });
        }

        // Generate Token
        const token = await user.generateToken();
        if (!token) {
            return res.status(500).json({ status: "failed", message: "Failed to generate token" });
        }

        // remove password before sending user object
        const userObj = user.toObject ? user.toObject() : { ...user };
        if (userObj.password) delete userObj.password;

        // set cookie and send result
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        return res.status(201).json({
            status: "success",
            message: "User created successfully",
            token,
            user: userObj
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
}

exports.loginUser = async (req, res) => {
    const user = req.user
    // Generate Token
    const token = await user.generateToken();
    if (!token) {
        return res.status(500).json({ status: "failed", message: "Failed to generate token" });
    }
    // remove password before sending user object
    const userObj = user.toObject ? user.toObject() : { ...user };
    if (userObj.password) delete userObj.password;

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    return res.status(201).json({
        status: "success",
        message: "User LoggedIn successfully",
        token,
        user: userObj
    });
}

exports.userToken = async (req, res) => {
    res.status(200).json({ status: "Success", user: req.user })
}

exports.logoutUser = async (req, res) => {
    const token =
        req.headers.authorization?.split(" ")[1] || // from header: "Bearer <token>"
        req.cookies?.token;
    const blackListToken = new blacklistedTokenModel({ token });
    await blackListToken.save();
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
    });
    res.status(200).json({ status: "Success", message: "User LoggedOut Successfully" })
}