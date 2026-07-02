const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    publication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Publication",
      required: true,
      index: true,
    },

    authorName: {
      type: String,
      required: true,
      trim: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);
