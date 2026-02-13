const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    shipTo: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.ObjectId,
      ref: User,
    },
    status: {
      type: String,
      default: "preparing", // preparing(준비중), shipping(배송중), delivered(배송완료), refunded(환불)
    },
    items: [
      {
        productId: {
          type: mongoose.ObjectId,
          ref: Product,
        },
        qty: {
          type: Number,
          default: 1,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        size: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true },
);

orderSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v; // Mongoose 버전키 제외
  delete obj.updatedAt; // 업데이트 시간 제외
  delete obj.createdAt; // 생성 시간 제외

  return obj;
};

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
