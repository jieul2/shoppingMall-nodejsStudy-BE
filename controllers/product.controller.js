const Product = require("../models/Product");

const productController = {};

productController.createProduct = async (req, res) => {
  try {
    const { sku, name, image, category, description, price, stock, status } =
      req.body;
    const product = new Product({
      sku,
      name,
      image,
      category,
      description,
      price,
      stock,
      status,
    });
    await product.save();
    res.status(200).json({ status: "성공", product });
  } catch (error) {
    res.status(400).json({ status: "상품 생성 실패 : ", error: error.message });
  }
};

module.exports = productController;
