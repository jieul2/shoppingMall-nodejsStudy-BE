const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Address = require("../models/Address");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
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

authController.loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();
    console.log("nnn", email, name);
    let user = await User.findOne({ email });
    if (!user) {
      // 유저생성
      const randomPassword = "" + Math.floor(Math.random() * 9999);
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);
      user = new User({
        name,
        email,
        password: newPassword,
      });
      await user.save();
    }
    //토큰발행 / 리턴
    const sessionToken = await user.generateToken();
    res.status(200).json({ status: "성공", user, token: sessionToken });
  } catch (error) {
    res
      .status(400)
      .json({ status: "loginWithGoogle - 실패 : ", error: error.message });
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

authController.addAddress = async (req, res) => {
  try {
    const { userId } = req;
    const {
      firstName,
      lastName,
      address,
      city,
      zipCode,
      phoneNumber,
      isDefault,
    } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("유저를 찾을 수 없습니다.");
    }
    if (isDefault) {
      // 기존의 기본 주소를 찾아서 isDefault를 false로 업데이트
      await Address.updateMany(
        { userId, "addressList.isDefault": true },
        { $set: { "addressList.$.isDefault": false } },
      );
    }
    const newAddress = new Address({
      userId,
      firstName,
      lastName,
      addressList: [
        {
          address,
          city,
          zipCode,
          isDefault,
        },
      ],
      phoneNumber,
    });
    await newAddress.save();
    res.status(200).json({ status: "주소 추가 성공", newAddress });

    // 주소 추가 로직 작성
  } catch (error) {
    res.status(400).json({ status: "주소 추가 실패 : ", error: error.message });
  }
};

authController.getAddresses = async (req, res) => {
  try {
    const { userId } = req;
    const addresses = await Address.find({ userId });
    res.status(200).json({ status: "주소 조회 성공", addresses });
  } catch (error) {
    res.status(400).json({ status: "주소 조회 실패 : ", error: error.message });
  }
};

authController.deleteAddress = async (req, res) => {
  try {
    const { userId } = req;
    const { addressId } = req.params;
    await Address.findOneAndDelete({ _id: addressId, userId });
    res.status(200).json({ status: "주소 삭제 성공" });
  } catch (error) {
    res.status(400).json({ status: "주소 삭제 실패 : ", error: error.message });
  }
};

authController.updateAddress = async (req, res) => {
  try {
    const { userId } = req;
    const { addressId } = req.params;
    const {
      firstName,
      lastName,
      address,
      city,
      zipCode,
      phoneNumber,
      isDefault,
    } = req.body;

    if (isDefault) {
      await Address.updateOne(
        { userId },
        { $set: { "addressList.$[].isDefault": false } },
      );
    }
    const updatedAddress = await Address.findOneAndUpdate(
      { userId, "addressList._id": addressId }, // 쿼리 조건: 유저 아이디와 배열 내 객체 아이디 매칭
      {
        $set: {
          firstName,
          lastName,
          phoneNumber,
          "addressList.$.address": address, // $는 쿼리에서 찾은 인덱스를 의미함
          "addressList.$.city": city,
          "addressList.$.zipCode": zipCode,
          "addressList.$.isDefault": isDefault,
        },
      },
      { returnDocument: "after" },
    );
    res.status(200).json({ status: "주소 수정 성공", updatedAddress });
  } catch (error) {
    res.status(400).json({ status: "주소 수정 실패 : ", error: error.message });
  }
};

module.exports = authController;
