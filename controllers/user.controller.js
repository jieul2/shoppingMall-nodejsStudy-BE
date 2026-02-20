const User = require("../models/User");
const bcrypt = require("bcryptjs");

const userController = {};

userController.createUser = async (req, res) => {
  try {
    const { email, password, name, level } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw new Error("이미 가입된 유저입니다.");
    }
    const salt = await bcrypt.genSaltSync(10);
    const hashedPassword = await bcrypt.hashSync(password, salt);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      level: level ? level : "customer",
    });
    await newUser.save();
    res.status(200).json({ status: "createUser - 성공" });
  } catch (error) {
    res
      .status(400)
      .json({ status: "createUser - 실패 : ", error: error.message });
  }
};

userController.getUser = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user) {
      res.status(200).json({ status: "getUser - 성공", user });
    } else {
      throw new Error("유저를 찾을 수 없습니다.");
    }
  } catch (error) {
    res.status(400).json({ status: "getUser - 실패 : ", error: error.message });
  }
};

module.exports = userController;
