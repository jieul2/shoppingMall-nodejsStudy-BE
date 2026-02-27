const Product = require("../models/Product");

const PAGE_SIZE = 5;
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
    const { page, name } = req.query;
    const condition = name
      ? { name: { $regex: name, $options: "i" }, isDeleted: false }
      : { isDeleted: false };
    let query = Product.find(condition);
    let response = { status: "성공" };
    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);

      const totalItemNum = await Product.find(condition).countDocuments();
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    const productList = await query.exec();
    response.productList = productList;
    if (productList.length > 0) {
      res.status(200).json(response);
    } else {
      throw new Error("상품을 찾을 수 없습니다.");
    }
  } catch (error) {
    res.status(400).json({ status: "상품 조회 실패", error: error.message });
  }
};

productController.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      { isDeleted: true },
    );
    if (!product) {
      throw new Error("상품을 찾을 수 없습니다.");
    }
    res.status(200).json({ status: "성공", product });
  } catch (error) {
    res.status(400).json({ status: "상품 삭제 실패", error: error.message });
  }
};

productController.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById({ _id: productId });
    if (!product) throw new Error("상품을 찾을 수 없습니다.");
    res.status(200).json({ status: "성공", product });
  } catch (error) {
    res.status(400).json({ status: "상품 조회 실패", error: error.message });
  }
};
productController.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { sku, name, image, category, description, price, stock, status } =
      req.body;

    const product = await Product.findByIdAndUpdate(
      { _id: productId },
      {
        sku,
        name,
        image,
        category,
        description,
        price,
        stock,
        status,
      },
      { returnDocument: "after" },
    );
    if (!product) {
      throw new Error("상품을 찾을 수 없습니다.");
    }
    res.status(200).json({ status: "성공", product });
  } catch (error) {
    res.status(400).json({ status: "상품 수정 실패", error: error.message });
  }
};

productController.checkStock = async (item) => {
  const product = await Product.findById(item.productId);

  // 재고 확인
  if (product.stock[item.size] < item.qty) {
    return {
      isVerify: false,
      message: `${product.name}의 ${item.size} 사이즈 재고가 부족합니다.`,
    };
  }
  // 재고 업데이트
  const newStock = { ...product.stock };
  newStock[item.size] -= item.qty;
  product.stock = newStock;
  await product.save();

  // 재고 확인 및 업데이트가 모두 성공적으로 완료된 경우
  return { isVerify: true };
};

productController.checkItemListStock = async (itemList) => {
  const insufficientStockItems = [];

  await Promise.all(
    itemList.map(async (item) => {
      const stockCheck = await productController.checkStock(item);
      if (stockCheck.isVerify === false) {
        insufficientStockItems.push({ item, message: stockCheck.message });
      }
      return stockCheck;
    }),
  );

  return insufficientStockItems;
};

module.exports = productController;
