const orderController = {};
const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");

orderController.createOrder = async (req, res) => {
  try {
    // 프론트엔드에서 데이터 받기 userId, totalPrice, shipTo, contact, orderList
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;
    // 재고확인, 재고 업데이트
    const insufficentStockItems =
      await productController.checkItemListStock(orderList);

    //재고가 부족한 상품이 있다면 에러 반환
    if (insufficentStockItems.length > 0) {
      const errorMessage = insufficentStockItems.reduce(
        (total, item) => (total += item.message),
        "",
      );
      throw new Error(errorMessage);
    }

    // order 만들기
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });

    // DB에 저장
    await newOrder.save();

    //save후 카트 비우기

    res.status(200).json({
      message: "주문이 성공적으로 생성되었습니다.",
      orderNum: newOrder.orderNum,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ status: "주문 생성 실패", error: error.message });
  }
};

module.exports = orderController;
