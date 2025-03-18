const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const CarouselModel = require('../models/Carousel');

/*
  Exemplo de modelo (models/Carousel.js):
  
  const mongoose = require('mongoose');
  
  const carouselSchema = new mongoose.Schema({
    images: {
      type: [String], // array de nomes de arquivo
      default: []
    }
  });
  
  module.exports = mongoose.model('Carousel', carouselSchema);
*/

/*
  Resumo das rotas:
  - POST   /api/carousel        -> Adicionar novo nome de arquivo ao carrossel
  - GET    /api/carousel        -> Retornar array de nomes de arquivo
  - DELETE /api/carousel/:fileName -> Remover um nome de arquivo do carrossel
*/

// ===============================
// 1. POST /api/carousel -> Adicionar nova imagem (armazena só o nome do arquivo)
// ===============================
router.post('/', verifyToken, async (req, res) => {
  try {
    // Esperamos que o front-end envie { "fileName": "1683213073453.jpg" }
    const { fileName } = req.body;
    if (!fileName) {
      return res.status(400).json({ error: "Nome do arquivo não fornecido." });
    }

    // Busca (ou cria) o documento do carrossel
    let doc = await CarouselModel.findOne({});
    if (!doc) {
      doc = new CarouselModel({ images: [] });
    }

    // Exemplo: limitar a 5 imagens
    if (doc.images.length >= 5) {
      return res.status(400).json({ error: "Limite de 5 imagens atingido." });
    }

    // Adiciona somente o nome do arquivo ao array
    doc.images.push(fileName);
    await doc.save();

    return res.status(200).json({ message: 'Imagem adicionada ao carrossel com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar imagem ao carrossel:', error);
    return res.status(500).json({ error: 'Erro ao adicionar imagem ao carrossel.' });
  }
});

// ===============================
// 2. GET /api/carousel -> Retorna todos os nomes de arquivo do carrossel
// ===============================
router.get('/', async (req, res) => {
  try {
    const doc = await CarouselModel.findOne({});
    if (!doc || doc.images.length === 0) {
      // Se não existir doc ou estiver vazio, retorna um array vazio
      return res.json({ images: [] });
    }
    // doc.images é um array de strings (nomes de arquivo)
    return res.json({ images: doc.images });
  } catch (error) {
    console.error('Erro ao buscar carrossel:', error);
    return res.status(500).json({ error: 'Erro ao buscar carrossel.' });
  }
});

// ===============================
// 3. DELETE /api/carousel/:fileName -> Remove imagem do array pelo nome
// ===============================
router.delete('/:fileName', verifyToken, async (req, res) => {
  try {
    const { fileName } = req.params;
    const doc = await CarouselModel.findOne({});
    if (!doc) {
      return res.status(404).json({ error: 'Carrossel não encontrado.' });
    }

    // Procura o nome do arquivo no array doc.images
    const index = doc.images.indexOf(fileName);
    if (index === -1) {
      return res.status(404).json({ error: 'Imagem não encontrada no carrossel.' });
    }

    doc.images.splice(index, 1);
    await doc.save();

    return res.status(200).json({ message: 'Imagem removida do carrossel com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover imagem do carrossel:', error);
    return res.status(500).json({ error: 'Erro ao remover imagem do carrossel.' });
  }
});

module.exports = router;
