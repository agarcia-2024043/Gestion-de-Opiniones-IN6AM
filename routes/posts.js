const express = require('express');
const router = express.Router();
// 1. Unificado express-validator en una sola línea
const { body, validationResult } = require('express-validator'); 
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// 2. Helper local para validación (ya que no usamos el archivo externo)
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const CATEGORIAS = [
  'Tecnología', 'Política', 'Deportes', 'Entretenimiento',
  'Ciencia', 'Salud', 'Educación', 'Economía', 'Cultura', 'Otros',
];

// GET /api/posts — Listar todas las publicaciones
router.get('/', async (req, res, next) => {
  try {
    const { categoria, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (categoria) filter.categoria = categoria;

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('autor', 'username nombre')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      pagina: Number(page),
      totalPaginas: Math.ceil(total / Number(limit)),
      data: posts,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/posts/:id — Ver publicación específica
router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('autor', 'username nombre');
    if (!post) return res.status(404).json({ success: false, message: 'Publicación no encontrada.' });

    // Comentado para evitar error hasta que tengas el modelo de Comentarios
    /*
    const comentarios = await Comment.find({ post: post._id })
      .populate('autor', 'username nombre')
      .sort({ createdAt: 1 });
    */

    res.json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
});

// POST /api/posts — Crear publicación
router.post(
  '/',
  protect,
  [
    body('titulo').trim().notEmpty().withMessage('El título es obligatorio')
      .isLength({ min: 3, max: 150 }).withMessage('El título debe tener entre 3 y 150 caracteres'),
    body('categoria').notEmpty().withMessage('La categoría es obligatoria')
      .isIn(CATEGORIAS).withMessage(`Categoría inválida.`),
    body('contenido').trim().notEmpty().withMessage('El contenido es obligatorio')
      .isLength({ min: 10, max: 5000 }).withMessage('El contenido debe tener entre 10 y 5000 caracteres'),
  ],
  checkValidation, // Usando el helper local
  async (req, res, next) => {
    try {
      const { titulo, categoria, contenido } = req.body;
      const post = await Post.create({ titulo, categoria, contenido, autor: req.user._id });
      await post.populate('autor', 'username nombre');
      res.status(201).json({ success: true, message: 'Publicación creada.', data: post });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/posts/:id — Editar publicación
router.put(
  '/:id',
  protect,
  [
    body('titulo').optional().trim().isLength({ min: 3, max: 150 }).withMessage('El título debe tener entre 3 y 150 caracteres'),
    body('categoria').optional().isIn(CATEGORIAS).withMessage(`Categoría inválida.`),
    body('contenido').optional().trim().isLength({ min: 10, max: 5000 }).withMessage('El contenido debe tener entre 10 y 5000 caracteres'),
  ],
  checkValidation,
  async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ success: false, message: 'Publicación no encontrada.' });
      if (post.autor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'No puedes editar publicaciones de otros usuarios.' });
      }

      const { titulo, categoria, contenido } = req.body;
      const updated = await Post.findByIdAndUpdate(
        req.params.id,
        { ...(titulo && { titulo }), ...(categoria && { categoria }), ...(contenido && { contenido }) },
        { new: true, runValidators: true }
      ).populate('autor', 'username nombre');

      res.json({ success: true, message: 'Publicación actualizada.', data: updated });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/posts/:id — Eliminar publicación
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Publicación no encontrada.' });
    if (post.autor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'No puedes eliminar publicaciones de otros usuarios.' });
    }

    // await Comment.deleteMany({ post: post._id }); // Comentado por ahora
    await post.deleteOne();

    res.json({ success: true, message: 'Publicación eliminada correctamente.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;