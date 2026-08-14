const multer = require('multer');
const path = require('path');

function crearUpload(carpeta) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '..', '..', 'uploads', carpeta));
    },
    filename: (req, file, cb) => {
      const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
      cb(null, nombreUnico);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // máximo 5 MB
    fileFilter: (req, file, cb) => {
      const tiposValidos = /jpeg|jpg|png|webp|avif/;
      const extensionValida = tiposValidos.test(path.extname(file.originalname).toLowerCase());
      if (extensionValida) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten imágenes JPG, PNG o WEBP'));
      }
    },
  });
}

module.exports = crearUpload;