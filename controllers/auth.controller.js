const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const authController = {};

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const token = await user.generateToken();
        return res.status(200).json({ status: "성공", user, token });
      }
    }
    throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
  } catch (error) {
    res
      .status(400)
      .json({ status: "loginWithEmail - 실패 : ", error: error.message });
  }
};

authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) {
      throw new Error("토큰이 없습니다.");
    }
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) {
        throw new Error("유효하지 않은 토큰입니다.");
      }
      req.userId = payload._id;
    });
    next();
  } catch (error) {
    res.status(400).json({ status: "인증 실패 : ", error: error.message });
  }
};

authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user.level === "admin") {
      next();
    }
  } catch (error) {
    res.status(400).json({ status: "권한 없음 : ", error: error.message });
  }
};

module.exports = authController;
