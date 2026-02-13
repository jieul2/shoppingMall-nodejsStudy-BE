const express = require("express");
const authController = require("../controllers/auth.controller");
const router = express.Router();

router.post("/login", authController.loginWithEmail); // 로그인

module.exports = router;
