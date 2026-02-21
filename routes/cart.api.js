const express = require("express");
const authController = require("../controllers/auth.controller");
const cartController = require("../controllers/cart.controller");
const router = express.Router();

router.post("/", authController.authenticate, cartController.addItemToCart); // 장바구니에 상품 추가
router.get("/", authController.authenticate, cartController.getCart); // 장바구니 아이템 가져오기
router.get("/qty", authController.authenticate, cartController.getCartQty); // 장바구니 아이템 수량 가져오기
router.put("/:id", authController.authenticate, cartController.updateCartItemQty); // 장바구니 아이템 수량 업데이트
router.delete("/:id", authController.authenticate, cartController.deleteCartItem); // 장바구니 아이템 삭제
module.exports = router;
