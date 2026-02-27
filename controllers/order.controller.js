const orderController = {};
const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");
const PAGE_SIZE = 10;

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

orderController.getOrder = async (req, res) => {
  try {
    const { userId } = req;
    const orderList = await Order.find({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
        select: "image name",
      },
    });
    const totalItemNum = await Order.find({ userId: userId }).countDocuments();
    const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
    res.status(200).json({ status: "주문 조회 성공", orderList, totalPageNum });
  } catch (error) {
    return res
      .status(400)
      .json({ status: "주문 조회 실패", error: error.message });
  }
};

orderController.getAllOrders = async (req, res) => {
  try {
    const { page, ordernum } = req.query;
    let condition = {};

    // 주문 번호 검색 조건 설정
    if (ordernum) {
      condition = {
        orderNum: { $regex: ordernum, $options: "i" },
      };
    }

    // 1. 쿼리 객체 생성 (실행 전)
    let query = Order.find(condition)
      .populate("userId")
      .populate({
        path: "items",
        populate: {
          path: "productId",
          model: "Product",
          select: "image name",
        },
      })
      .sort({ createdAt: -1 });

    let response = { status: "성공" };

    // 2. 페이지네이션 처리
    if (page) {
      query.skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE);

      // 전체 아이템 개수 및 전체 페이지 수 계산
      const totalItemNum = await Order.find(condition).countDocuments();
      const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
      response.totalPageNum = totalPageNum;
    }

    // 3. 쿼리 실행
    const orderList = await query.exec();
    response.orderList = orderList;

    // 4. 결과 반환 (상품 조회 로직과 동일하게 리스트 확인)
    if (orderList.length >= 0) {
      // 주문은 0개일 수도 있으므로 보통 >= 0으로 처리합니다.
      res.status(200).json(response);
    } else {
      throw new Error("주문 목록을 찾을 수 없습니다.");
    }
  } catch (error) {
    res.status(400).json({ status: "주문 조회 실패", error: error.message });
  }
};
orderController.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      id,
      { status: status },
      { returnDocument: "after" },
    );
    if (!order) throw new Error("주문을 찾을 수 없습니다.");
    res.status(200).json({ status: "주문 상태 업데이트 성공", order });
  } catch (error) {
    res
      .status(400)
      .json({ status: "주문 상태 업데이트 실패", error: error.message });
  }
};

module.exports = orderController;
