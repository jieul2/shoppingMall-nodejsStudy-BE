const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/", authController.authenticate, authController.addAddress); // 주소 추가
router.get("/", authController.authenticate, authController.getAddresses); // 주소 목록 가져오기
router.delete("/:addressId", authController.authenticate, authController.deleteAddress); // 주소 삭제
router.put("/:addressId", authController.authenticate, authController.updateAddress); // 주소 수정
module.exports = router;
