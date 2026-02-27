const mongoose = require("mongoose");
const User = require("./User");
const Schema = mongoose.Schema;

const AddressSchema = new Schema(
  {
    userId: {
      type: mongoose.ObjectId,
      ref: User,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    addressList: [
      {
        address: {
          type: String,
          required: true,
        },
        city: {
          type: String,
          required: true,
        },
        zipCode: {
          type: String,
          required: true,
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    phoneNumber: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

AddressSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v; // Mongoose 버전키 제외

  return obj;
};

const Address = mongoose.model("Address", AddressSchema);

module.exports = Address;
