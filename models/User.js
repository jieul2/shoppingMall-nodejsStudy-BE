const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      default: "customer", // 2types: 'admin', 'customer'
    },
  },
  { timestamps: true },
);

userSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password; // 비밀번호는 응답에서 제외
  delete obj.__v; // Mongoose 버전키 제외
  delete obj.updatedAt; // 업데이트 시간 제외
  delete obj.createdAt; // 생성 시간 제외

  return obj;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
