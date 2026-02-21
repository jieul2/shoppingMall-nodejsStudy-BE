const Cart = require("../models/Cart");

const cartController = {};
cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    // 유저를 가지고 카트 찾기
    let cart = await Cart.findOne({ userId });
    // 카트가 없다면 새로 만들기
    if (!cart) {
      cart = new Cart({
        userId,
      });
      await cart.save();
    }
    // 이미 카트에 들어가있는 상품인지 확인하기
    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size,
    );
    // 상품이 있다면 이미 들어가있습니다 에러 보내기
    if (existItem) {
      throw new Error("이미 카트에 들어가있는 상품입니다.");
    }
    // 상품이 없다면 카트에 상품 추가하기
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    res
      .status(200)
      .json({ status: "성공", cart, cartItemQty: cart.items.length });
  } catch (error) {
    res
      .status(400)
      .json({ status: "장바구니 추가 실패", error: error.message });
  }
};

cartController.getCart = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    if (!cart) {
      throw new Error("장바구니를 찾을 수 없습니다.");
    }

    res.status(200).json({ status: "성공", data: cart.items });
  } catch (error) {
    res
      .status(400)
      .json({ status: "장바구니 조회 실패", error: error.message });
  }
};

cartController.getCartQty = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      throw new Error("장바구니를 찾을 수 없습니다.");
    }

    res.status(200).json({ status: "성공", cartItemQty: cart.items.length });
  } catch (error) {
    res
      .status(400)
      .json({ status: "장바구니 수량 조회 실패", error: error.message });
  }
};

cartController.updateCartItemQty = async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.params;
    const { qty } = req.body;

    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    if (!cart) {
      throw new Error("장바구니를 찾을 수 없습니다.");
    }
    const index = cart.items.findIndex((item) => item._id.equals(id));
    if (index === -1) {
      throw new Error("장바구니 아이템을 찾을 수 없습니다.");
    }
    cart.items[index].qty = qty;
    await cart.save();
    res.status(200).json({ status: "성공", data: cart.items });
  } catch (error) {
    res
      .status(400)
      .json({ status: "장바구니 아이템 수정 실패", error: error.message });
  }
};

cartController.deleteCartItem = async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.params;

    const cart = await Cart.find({ userId });
    cart.items = cart.items.filter((item) => !item._id.equals(id));

    await cart.save();
    res.status(200).json({ status: "성공", cartItemQty: cart.items.length });
  } catch (error) {
    res
      .status(400)
      .json({ status: "장바구니 아이템 삭제 실패", error: error.message });
  }
};

module.exports = cartController;
