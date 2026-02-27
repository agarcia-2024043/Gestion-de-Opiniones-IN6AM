const express = require('express');
const router = express.Router({ mergeParams: true });
// 1. Unificado body y validationResult en una sola línea (evita el error de "already declared")
const { body, validationResult } = require('express-validator'); 
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');

// 2. Helper local para validación (reemplaza al archivo inexistente)
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// GET /api/posts/:postId/comments — Ver comentarios de un post
router.get('/', async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Publicación no encontrada.' });

    const comentarios = await Comment.find({ post: req.params.postId })
      .populate('autor', 'username nombre')
      .sort({ createdAt: 1 });

    res.json({ success: true, total: comentarios.length, data: comentarios });
  } catch (error) {
    next(error);
  }
});

// POST /api/posts/:postId/comments — Crear comentario
router.post(
  '/',
  protect,
  [
    body('contenido').trim().notEmpty().withMessage('El comentario no puede estar vacío')
      .isLength({ max: 1000 }).withMessage('El comentario no puede superar 1000 caracteres'),
  ],
  checkValidation, // 3. Cambiado 'validate' por 'checkValidation'
  async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.postId);
      if (!post) return res.status(404).json({ success: false, message: 'Publicación no encontrada.' });

      const comment = await Comment.create({
        contenido: req.body.contenido,
        post: req.params.postId,
        autor: req.user._id,
      });

      await comment.populate('autor', 'username nombre');
      res.status(201).json({ success: true, message: 'Comentario agregado.', data: comment });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/posts/:postId/comments/:commentId — Editar comentario
router.put(
  '/:commentId',
  protect,
  [
    body('contenido').trim().notEmpty().withMessage('El comentario no puede estar vacío')
      .isLength({ max: 1000 }).withMessage('El comentario no puede superar 1000 caracteres'),
  ],
  checkValidation, // 3. Cambiado 'validate' por 'checkValidation'
  async (req, res, next) => {
    try {
      const comment = await Comment.findOne({ _id: req.params.commentId, post: req.params.postId });
      if (!comment) return res.status(404).json({ success: false, message: 'Comentario no encontrado.' });
      if (comment.autor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'No puedes editar comentarios de otros usuarios.' });
      }

      comment.contenido = req.body.contenido;
      await comment.save();
      await comment.populate('autor', 'username nombre');

      res.json({ success: true, message: 'Comentario actualizado.', data: comment });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/posts/:postId/comments/:commentId — Eliminar comentario
router.delete('/:commentId', protect, async (req, res, next) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.commentId, post: req.params.postId });
    if (!comment) return res.status(404).json({ success: false, message: 'Comentario no encontrado.' });
    if (comment.autor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'No puedes eliminar comentarios de otros usuarios.' });
    }

    await comment.deleteOne();
    res.json({ success: true, message: 'Comentario eliminado.' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;