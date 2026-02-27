const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // ID inválido de MongoDB
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'ID inválido.' });
  }

  // Campo único duplicado (ej: email o username ya registrado)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, message: `El ${campo} ya está registrado.` });
  }

  // Error de validación de Mongoose
  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: mensajes.join('. ') });
  }

  // JWT inválido
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Token inválido.' });
  }

  // JWT expirado
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expirado. Inicia sesión nuevamente.' });
  }

  // Error genérico
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor.',
  });
};

module.exports = errorHandler;
