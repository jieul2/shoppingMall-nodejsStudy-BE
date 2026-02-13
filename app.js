const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const indexRouter = require("./routes/index");
const app = express();

require("dotenv").config();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // req.body가 객체 형태로 인식
app.use("/api", indexRouter); // /api 경로로 들어오는 요청은 routes/index.js에서 처리

const mongoURI = process.env.Local_DB_ADDRESS;
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err) => console.log("DB 연결 실패: ", err));

app.listen(process.env.PORT || 5000, () => {
  console.log("서버가 포트", process.env.PORT || 5000, "에서 실행 중입니다.");
});
