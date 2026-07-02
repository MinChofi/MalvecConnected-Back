const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, "");

app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));

app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({ message: "API Malbec Connected funcionando" });
});

const authRoutes = require("./routes/authRoutes");
const publicationRoutes = require("./routes/publicationRoutes");
const profileRoutes = require("./routes/profileRoutes");

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/api/profile", profileRoutes);
app.use("/publications", publicationRoutes);
app.use("/api/publications", publicationRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada",
  });
});

module.exports = app;
