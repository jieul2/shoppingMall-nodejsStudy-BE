const express = require("express");
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");

const router = express.Router();

router.post("/", authController.authenticate, orderController.createOrder); // 주문 생성
// userId로 주문 조회
router.get("/me", authController.authenticate, orderController.getOrder);
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.updateOrder,
); // 관리자용 주문 상태 업데이트
router.get(
  "/",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.getAllOrders,
); // 관리자용 전체 주문 조회

module.exports = router;
