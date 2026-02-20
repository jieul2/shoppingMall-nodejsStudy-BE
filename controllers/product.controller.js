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

productController.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});

    if (products.length > 0) {
      res.status(200).json({ status: "성공", products });
    } else {
      throw new Error("상품을 찾을 수 없습니다.");
    }
  } catch (error) {
    res.status(400).json({ status: "상품 조회 실패", error: error.message });
  }
};
module.exports = productController;
