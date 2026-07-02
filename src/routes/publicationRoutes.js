const express = require("express");

const {
  getPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
  addComment,
  ratePublication,
} = require("../controllers/publicationController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", getPublications);
router.get("/:id", getPublicationById);
router.post("/", authMiddleware, createPublication);
router.patch("/:id", authMiddleware, updatePublication);
router.put("/:id", authMiddleware, updatePublication);
router.delete("/:id", authMiddleware, deletePublication);
router.post("/:id/comments", addComment);
router.post("/:id/rate", ratePublication);

module.exports = router;
