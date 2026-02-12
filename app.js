const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();

require("dotenv").config();
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // req.body가 객체 형태로 인식

const mongoURI = process.env.Local_DB_ADDRESS;
mongoose
  .connect(mongoURI)
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log("DB Connection Error: ", err));

app.listen(process.env.PORT || 5000, () => {
  console.log("Server is running on port", process.env.PORT || 5000);
});
