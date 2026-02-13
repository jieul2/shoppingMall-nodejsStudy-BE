const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: {
    type: mongoose.ObjectId,
    ref: User,
  },
  items: [
    {
      productId: {
        type: mongoose.ObjectId,
        ref: Product,
      },
      size: {
        type: String,
        required: true,
      },
      qty: {
        type: Number,
        default: 1,
        required: true,
      },
    },
  ],
});

cartSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v; // Mongoose 버전키 제외
  delete obj.updatedAt; // 업데이트 시간 제외

  return obj;
};

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
