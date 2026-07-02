const Joi = require("joi");
const mongoose = require("mongoose");

const Publication = require("../models/Publication");
const Comment = require("../models/Comment");
const { normalizeProfile } = require("../utils/userSerializer");

const currentYear = new Date().getFullYear();

const PUBLICATION_TYPES = ["Tinto", "Blanco", "Rosado", "Espumante", "Otro"];
const PUBLICATION_CATEGORIES = [
  "Recomendación",
  "Consulta",
  "Reseña",
  "Evento",
  "Compra/Venta",
  "Otro",
];

const validationOptions = {
  abortEarly: false,
  errors: {
    wrap: {
      label: false,
    },
  },
};

const protectedFields = {
  user: Joi.any().strip(),
  businessName: Joi.any().strip(),
  wineryName: Joi.any().strip(),
  contactEmail: Joi.any().strip(),
  address: Joi.any().strip(),
  phone: Joi.any().strip(),
  ratingAverage: Joi.any().strip(),
  ratingCount: Joi.any().strip(),
  isActive: Joi.any().strip(),
};

const publicationCreateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(120).required(),
  productName: Joi.string().trim().min(1).max(120).required(),
  description: Joi.string().trim().min(1).max(2000).required(),
  imageUrl: Joi.string().trim().max(2000).allow("").optional(),
  type: Joi.string().trim().valid(...PUBLICATION_TYPES).required(),
  category: Joi.string().trim().valid(...PUBLICATION_CATEGORIES).required(),
  price: Joi.number().min(0).optional(),
  year: Joi.number().integer().min(1900).max(currentYear + 1).optional(),
  ...protectedFields,
}).unknown(false);

const publicationUpdateSchema = Joi.object({
  title: Joi.string().trim().min(1).max(120).optional(),
  productName: Joi.string().trim().min(1).max(120).optional(),
  description: Joi.string().trim().min(1).max(2000).optional(),
  imageUrl: Joi.string().trim().max(2000).allow("").optional(),
  type: Joi.string().trim().valid(...PUBLICATION_TYPES).optional(),
  category: Joi.string().trim().valid(...PUBLICATION_CATEGORIES).optional(),
  price: Joi.number().min(0).optional(),
  year: Joi.number().integer().min(1900).max(currentYear + 1).optional(),
  ...protectedFields,
}).unknown(false);

const commentSchema = Joi.object({
  authorName: Joi.string().trim().min(1).max(80).required(),
  content: Joi.string().trim().min(1).max(1000).required(),
  rating: Joi.number().integer().min(1).max(5).optional(),
}).unknown(false);

const ratingSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
}).unknown(false);

const validate = (schema, body) => {
  const { error, value } = schema.validate(body, validationOptions);

  if (!error) {
    return { value };
  }

  return {
    error: error.details.map((detail) => detail.message),
  };
};

const validatePublicationUpdate = (body) => {
  const result = validate(publicationUpdateSchema, body);

  if (result.error) {
    return result;
  }

  if (Object.keys(result.value).length === 0) {
    return {
      error: ["Debe enviar al menos un campo editable"],
    };
  }

  return result;
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const sendValidationError = (res, errors) => {
  return res.status(400).json({
    message: "Datos invalidos",
    errors,
  });
};

const getActivePublication = (id) => {
  return Publication.findOne({ _id: id, isActive: { $ne: false } });
};

const getProfilePublicationData = (user) => {
  const profile = normalizeProfile(user.profile);
  const businessName = profile.fantasyName.trim();

  if (!businessName) {
    return {
      error: "Configurá el nombre de fantasía en tu perfil antes de publicar",
    };
  }

  return {
    value: {
      user: user._id,
      businessName,
      wineryName: businessName,
      contactEmail: profile.contactEmail,
      address: profile.address,
      phone: profile.phone,
    },
  };
};

const userOwnsPublication = (user, publication) => {
  return (
    publication.user &&
    publication.user.toString() === user._id.toString()
  );
};

const sendForbiddenPublication = (res) => {
  return res.status(403).json({
    message: "No autorizado para modificar esta publicacion",
  });
};

const addRatingToPublication = async (publication, rating) => {
  const currentTotal = publication.ratingAverage * publication.ratingCount;
  const nextCount = publication.ratingCount + 1;
  const nextAverage = (currentTotal + rating) / nextCount;

  publication.ratingCount = nextCount;
  publication.ratingAverage = Number(nextAverage.toFixed(2));

  await publication.save();

  return {
    average: publication.ratingAverage,
    count: publication.ratingCount,
  };
};

const getPublications = async (req, res) => {
  try {
    const publications = await Publication.find({ isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.json({
      publications,
    });
  } catch (error) {
    console.error("Error en getPublications:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const getPublicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "ID de publicacion invalido",
      });
    }

    const publication = await getActivePublication(id).select("-__v");

    if (!publication) {
      return res.status(404).json({
        message: "Publicacion no encontrada",
      });
    }

    const comments = await Comment.find({ publication: id })
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.json({
      publication,
      comments,
      rating: {
        average: publication.ratingAverage,
        count: publication.ratingCount,
      },
    });
  } catch (error) {
    console.error("Error en getPublicationById:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const createPublication = async (req, res) => {
  try {
    const { error, value } = validate(publicationCreateSchema, req.body);

    if (error) {
      return sendValidationError(res, error);
    }

    const profileData = getProfilePublicationData(req.user);

    if (profileData.error) {
      return res.status(400).json({
        message: profileData.error,
      });
    }

    const publication = await Publication.create({
      ...value,
      ...profileData.value,
    });

    return res.status(201).json({
      message: "Publicacion creada correctamente",
      publication,
    });
  } catch (error) {
    console.error("Error en createPublication:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const updatePublication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "ID de publicacion invalido",
      });
    }

    const { error, value } = validatePublicationUpdate(req.body);

    if (error) {
      return sendValidationError(res, error);
    }

    const publication = await getActivePublication(id);

    if (!publication) {
      return res.status(404).json({
        message: "Publicacion no encontrada",
      });
    }

    if (!userOwnsPublication(req.user, publication)) {
      return sendForbiddenPublication(res);
    }

    const profileData = getProfilePublicationData(req.user);

    if (profileData.error) {
      return res.status(400).json({
        message: profileData.error,
      });
    }

    const updatedPublication = await Publication.findByIdAndUpdate(
      id,
      {
        ...value,
        ...profileData.value,
      },
      { new: true, runValidators: true }
    ).select("-__v");

    return res.json({
      message: "Publicacion actualizada correctamente",
      publication: updatedPublication,
    });
  } catch (error) {
    console.error("Error en updatePublication:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const deletePublication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "ID de publicacion invalido",
      });
    }

    const publication = await getActivePublication(id);

    if (!publication) {
      return res.status(404).json({
        message: "Publicacion no encontrada",
      });
    }

    if (!userOwnsPublication(req.user, publication)) {
      return sendForbiddenPublication(res);
    }

    const deletedPublication = await Publication.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select("-__v");

    return res.json({
      message: "Publicacion eliminada correctamente",
      publication: deletedPublication,
    });
  } catch (error) {
    console.error("Error en deletePublication:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "ID de publicacion invalido",
      });
    }

    const { error, value } = validate(commentSchema, req.body);

    if (error) {
      return sendValidationError(res, error);
    }

    const publication = await getActivePublication(id);

    if (!publication) {
      return res.status(404).json({
        message: "Publicacion no encontrada",
      });
    }

    const comment = await Comment.create({
      ...value,
      publication: publication._id,
    });

    let rating = {
      average: publication.ratingAverage,
      count: publication.ratingCount,
    };

    if (typeof value.rating === "number") {
      rating = await addRatingToPublication(publication, value.rating);
    }

    return res.status(201).json({
      message: "Comentario creado correctamente",
      comment,
      rating,
    });
  } catch (error) {
    console.error("Error en addComment:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const ratePublication = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "ID de publicacion invalido",
      });
    }

    const { error, value } = validate(ratingSchema, req.body);

    if (error) {
      return sendValidationError(res, error);
    }

    const publication = await getActivePublication(id);

    if (!publication) {
      return res.status(404).json({
        message: "Publicacion no encontrada",
      });
    }

    const rating = await addRatingToPublication(publication, value.rating);

    return res.status(201).json({
      message: "Puntuacion registrada correctamente",
      rating,
    });
  } catch (error) {
    console.error("Error en ratePublication:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  getPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
  addComment,
  ratePublication,
};
