/**
 * productRoutes.js
 * Rotas relacionadas a produtos
 */

const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');

// Controllers e Middlewares
const productController = require('../controllers/productController');
const verifyToken = require('../middlewares/verifyToken'); // Verifique o caminho do arquivo

// Cria o roteador do Express
const router = express.Router();

/**
 * Configuração do multer para upload de imagens
 * Armazena em "public/uploads" com nome do arquivo: timestamp-originalname
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/'); // Pasta onde as imagens serão armazenadas
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Nome do arquivo com timestamp
  }
});

const upload = multer({ storage });

/**
 * POST /api/products/upload
 * Rota para criar produto com upload de imagem
 * Exige token (verifyToken) e campos obrigatórios (name, description).
 */
router.post(
  '/upload',
  verifyToken, // Apenas admin (ou usuário autenticado) pode criar produto
  upload.single('image'), // Envia uma única imagem no campo "image"
  [
    body('name').notEmpty().withMessage('O nome do produto é obrigatório'),
    body('description').notEmpty().withMessage('A descrição é obrigatória')
    // 'price' é opcional, mas se quiser validar, adicione aqui
  ],
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Imagem não enviada.' });
    }

    // Pega campos do body
    const { name, description, price } = req.body;

    // Monta a URL completa ou relativa
    // Exemplo de URL completa apontando para seu domínio de produção:
    const imageUrl = `https://totalfilter-backend-production.up.railway.app/uploads/${req.file.filename}`;
    // Se preferir só o caminho relativo: "/uploads/" + req.file.filename

    const newProduct = {
      name,
      description,
      price: price || '', // Se não houver preço, define como string vazia
      imageUrl
    };

    // Chama o controller para criar o produto
    productController.createProduct(req, res, newProduct);
  }
);

/**
 * POST /api/products
 * Criar produto via URL de imagem (sem upload).
 * Exige token e valida campos obrigatórios (name, description, price, imageUrl).
 */
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

/**
 * GET /api/products/new-releases
 * Lista de produtos de lançamento (sem autenticação).
 * Ajuste a lógica no controller (ex.: buscar últimos produtos criados).
 */
router.get('/new-releases', productController.getNewReleases);

/**
 * GET /api/products
 * Lista todos os produtos (sem autenticação).
 */
router.get('/', productController.getAllProducts);

/**
 * GET /api/products/:id
 * Obter produto por ID, com validação de ObjectId
 */
router.get(
  '/:id',
  (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID inválido!' });
    }
    next();
  },
  productController.getProductById
);

/**
 * PUT /api/products/:id
 * Atualizar produto (exige token).
 * Valida campos obrigatórios (name, description, price, imageUrl).
 */
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

/**
 * DELETE /api/products/:id
 * Excluir produto (exige token).
 */
router.delete('/:id', verifyToken, productController.deleteProduct);

module.exports = router;
