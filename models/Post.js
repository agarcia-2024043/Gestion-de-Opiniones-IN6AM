const mongoose = require('mongoose');

const CATEGORIAS = [
  'Tecnología',
  'Política',
  'Deportes',
  'Entretenimiento',
  'Ciencia',
  'Salud',
  'Educación',
  'Economía',
  'Cultura',
  'Otros',
];

const postSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      minlength: [3, 'El título debe tener al menos 3 caracteres'],
      maxlength: [150, 'El título no puede superar 150 caracteres'],
    },
    categoria: {
      type: String,
      required: [true, 'La categoría es obligatoria'],
      enum: {
        values: CATEGORIAS,
        message: `La categoría debe ser una de: ${CATEGORIAS.join(', ')}`,
      },
    },
    contenido: {
      type: String,
      required: [true, 'El contenido es obligatorio'],
      minlength: [10, 'El contenido debe tener al menos 10 caracteres'],
      maxlength: [5000, 'El contenido no puede superar 5000 caracteres'],
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
module.exports.CATEGORIAS = CATEGORIAS;
