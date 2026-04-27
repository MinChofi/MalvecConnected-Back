const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "API Malbec Connected funcionando" });
});

module.exports = app;