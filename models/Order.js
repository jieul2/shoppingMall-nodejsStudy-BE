const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Cart = require("./Cart");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    shipTo: {
      type: Object,
      required: true,
    },
    contact: {
      type: Object,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.ObjectId,
      ref: User,
      required: true,
    },
    status: {
      type: String,
      default: "preparing", // preparing(준비중), shipping(배송중), delivered(배송완료), refunded(환불)
    },
    orderNum: {
      type: String,
    },
    items: [
      {
        productId: {
          type: mongoose.ObjectId,
          ref: Product,
          required: true,
        },
        qty: {
          type: Number,
          default: 1,
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

orderSchema.post("save", async function () {
  //카트 비우기
  const cart = await Cart.findOne({
    userId: this.userId,
  });
  cart.items = [];
  await cart.save();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
