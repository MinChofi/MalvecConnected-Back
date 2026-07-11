const mongoose = require("mongoose");

const publicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    title: {
      type: String,
      trim: true,
      default: "",
    },

    businessName: {
      type: String,
      trim: true,
      default: "",
    },

    wineryName: {
      type: String,
      trim: true,
      default: "",
    },

    productName: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1500,
      default: "",
    },

    publicationDate: {
      type: Date,
      default: Date.now,
    },

    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    contactEmail: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    type: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      default: "",
    },

    price: {
      type: Number,
      min: 0,
    },

    ratingAverage: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    ratingCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

publicationSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model("Publication", publicationSchema);
