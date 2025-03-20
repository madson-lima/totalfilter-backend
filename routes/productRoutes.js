const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');

const productController = require('../controllers/productController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

// Configurar o armazenamento do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Criar Produto com Upload de Imagem (com autenticação)
router.post(
  '/upload',
  verifyToken,
  upload.single('image'),
  [
    body('name').notEmpty().withMessage('O nome do produto é obrigatório'),
    body('description').notEmpty().withMessage('A descrição é obrigatória'),
  ],
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Imagem não enviada.' });
    }

    const { name, description, price } = req.body;
    // Monta URL completa
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const newProduct = {
      name,
      description,
      price: price || '',
      imageUrl
    };

    productController.createProduct(req, res, newProduct);
  }
);

// Criar Produto via URL de Imagem (PROTEGIDO)
router.post(
  '/',
  verifyToken,
  [
    body('name').notEmpty().withMessage('O nome do produto é obrigatório'),
    body('description').notEmpty().withMessage('A descrição é obrigatória'),
    body('price').isNumeric().withMessage('O preço deve ser um número'),
    body('imageUrl').notEmpty().withMessage('A URL da imagem é obrigatória')
  ],
  productController.createProduct
);

// Listar novos lançamentos
router.get('/new-releases', productController.getNewReleases);

// Listar todos os produtos
router.get('/', productController.getAllProducts);

// Obter produto por ID (valida se ID é ObjectId)
router.get('/:id', (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID inválido!' });
  }
  next();
}, productController.getProductById);

// Atualizar Produto
router.put(
  '/:id',
  verifyToken,
  [
    body('name').notEmpty().withMessage('O nome do produto é obrigatório'),
    body('description').notEmpty().withMessage('A descrição é obrigatória'),
    body('price').isNumeric().withMessage('O preço deve ser um número'),
    body('imageUrl').notEmpty().withMessage('A URL da imagem é obrigatória')
  ],
  productController.updateProduct
);

// Deletar Produto
router.delete('/:id', verifyToken, productController.deleteProduct);

module.exports = router;
