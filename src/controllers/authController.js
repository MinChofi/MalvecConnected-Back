const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { serializeUser } = require("../utils/userSerializer");

const createToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Usuario y contrasena son obligatorios",
      });
    }

    const userExists = await User.findOne({ username });

    if (userExists) {
      return res.status(400).json({
        message: "El usuario ya existe",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
    });

    const token = createToken(user._id);

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Error en register:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Usuario y contrasena son obligatorios",
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({
        message: "Credenciales invalidas",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Credenciales invalidas",
      });
    }

    const token = createToken(user._id);

    return res.json({
      message: "Login correcto",
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("Error en login:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

const me = async (req, res) => {
  try {
    return res.json({
      user: serializeUser(req.user),
    });
  } catch (error) {
    console.error("Error en me:", error);

    return res.status(500).json({
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
  register,
  login,
  me,
};
