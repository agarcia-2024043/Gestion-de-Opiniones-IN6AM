const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator'); 
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};


const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// POST /api/auth/register
router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('El nombre de usuario es obligatorio')
      .isLength({ min: 3 }).withMessage('El usuario debe tener al menos 3 caracteres'),
    body('email').isEmail().withMessage('Debe ser un correo válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  ],
  checkValidation, // Usamos la misma función que ya tienes en tu archivo
  async (req, res, next) => {
    try {
      const { username, email, password, nombre } = req.body;

      // Verificar si ya existe el usuario o email
      const existeUsuario = await User.findOne({ $or: [{ email }, { username }] });
      if (existeUsuario) {
        return res.status(400).json({ 
          success: false, 
          message: 'El correo o nombre de usuario ya está en uso.' 
        });
      }

      // Crear el usuario (el hashing del password debería estar en tu Modelo de User con .pre('save'))
      const user = await User.create({
        username,
        email,
        password,
        nombre
      });

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente.',
        token,
        data: { id: user._id, username: user.username, email: user.email, nombre: user.nombre }
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('El correo o nombre de usuario es obligatorio'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  ],
  checkValidation, // Usamos la función local en lugar del archivo externo
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username: email }],
      }).select('+password');

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
      }

      const token = generateToken(user._id);

      res.json({
        success: true,
        message: 'Sesión iniciada exitosamente.',
        token,
        data: { id: user._id, username: user.username, email: user.email, nombre: user.nombre },
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/auth/me
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      nombre: req.user.nombre,
      bio: req.user.bio,
      createdAt: req.user.createdAt,
    },
  });
});

// PUT /api/auth/profile
router.put(
  '/profile',
  protect,
  [
    body('username').optional().trim()
      .isLength({ min: 3, max: 30 }).withMessage('El usuario debe tener entre 3 y 30 caracteres')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('El usuario solo puede tener letras, números y guiones bajos'),
    body('nombre').optional().trim().isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres'),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('La bio no puede superar 500 caracteres'),
  ],
  checkValidation,
  async (req, res, next) => {
    try {
      const { username, nombre, bio } = req.body;

      if (username && username !== req.user.username) {
        const existe = await User.findOne({ username });
        if (existe) {
          return res.status(409).json({ success: false, message: 'El nombre de usuario ya está en uso.' });
        }
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { ...(username && { username }), ...(nombre !== undefined && { nombre }), ...(bio !== undefined && { bio }) },
        { new: true, runValidators: true }
      );

      res.json({ success: true, message: 'Perfil actualizado.', data: { id: user._id, username: user.username, email: user.email, nombre: user.nombre, bio: user.bio } });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/auth/change-password
router.put(
  '/change-password',
  protect,
  [
    body('passwordActual').notEmpty().withMessage('La contraseña actual es obligatoria'),
    body('passwordNueva').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres'),
  ],
  checkValidation,
  async (req, res, next) => {
    try {
      const { passwordActual, passwordNueva } = req.body;

      const user = await User.findById(req.user._id).select('+password');
      if (!(await user.comparePassword(passwordActual))) {
        return res.status(401).json({ success: false, message: 'La contraseña actual es incorrecta.' });
      }

      user.password = passwordNueva;
      await user.save();

      res.json({ success: true, message: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;