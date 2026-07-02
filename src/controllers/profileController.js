const Joi = require("joi");

const User = require("../models/User");
const { normalizeProfile } = require("../utils/userSerializer");

const validationOptions = {
  abortEarly: false,
  errors: {
    wrap: {
      label: false,
    },
  },
};

const profileSchema = Joi.object({
  fantasyName: Joi.string().trim().min(1).max(120).required(),
  address: Joi.string().trim().max(200).allow("").optional(),
  phone: Joi.string().trim().max(80).allow("").optional(),
  contactEmail: Joi.string()
    .trim()
    .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    .allow("")
    .optional(),
}).unknown(false);

const validateProfile = (body) => {
  const { error, value } = profileSchema.validate(body, validationOptions);

  if (!error) {
    return { value: normalizeProfile(value) };
  }

  return {
    error: error.details.map((detail) => detail.message),
  };
};

const getProfile = async (req, res) => {
  try {
    return res.json({
      profile: normalizeProfile(req.user.profile),
    });
  } catch (error) {
    console.error("Error en getProfile:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { error, value } = validateProfile(req.body);

    if (error) {
      return res.status(400).json({
        message: "Datos invalidos",
        errors: error,
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profile: value },
      { new: true, runValidators: true }
    ).select("-password");

    return res.json({
      message: "Perfil actualizado correctamente",
      profile: normalizeProfile(user.profile),
    });
  } catch (error) {
    console.error("Error en updateProfile:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
