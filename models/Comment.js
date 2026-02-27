const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    contenido: {
      type: String,
      required: [true, 'El comentario no puede estar vacío'],
      trim: true,
      minlength: [1, 'El comentario debe tener al menos 1 carácter'],
      maxlength: [1000, 'El comentario no puede superar 1000 caracteres'],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
