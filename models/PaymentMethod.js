const mongoose = require("mongoose");
const User = require("./User");
const Schema = mongoose.Schema;

const paymentMethodSchema = new Schema(
  {
    userId: {
      type: mongoose.ObjectId,
      ref: User,
      required: true,
    },
    cardName: {
      type: String,
      required: true,
      placeholder: "예: 개인 카드, 법인 카드",
    },
    // 실제 서비스에서는 카드번호 전체를 저장하지 않고 마스킹 처리(ex: 4111-****-****-1111)하여 저장합니다.
    displayNumber: {
      type: String,
      required: true,
    },
    expiry: {
      type: String,
      required: true,
    },
    cardHolderName: {
      type: String,
      required: true,
    },
    // PG사를 사용하는 경우 받는 빌링키 (실제 재결제 시 사용)
    billingKey: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);

module.exports = PaymentMethod;
