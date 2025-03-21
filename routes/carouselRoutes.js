const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const CarouselModel = require('../models/Carousel');

// POST /api/carousel -> Adiciona nova imagem
router.post('/', verifyToken, async (req, res) => {
  try {
    // Agora esperamos "https://seu-dominio.com/uploads/arquivo.jpg" no body
    const { imageUrl } = req.body;

    let doc = await CarouselModel.findOne({});
    if (!doc) {
      doc = new CarouselModel({ images: [] });
    }
    
    // Limite de 5 imagens
    if (doc.images.length >= 5) {
      return res.status(400).json({ error: "Limite de 5 imagens atingido." });
    }
    
    doc.images.push(imageUrl);
    await doc.save();

    return res.status(200).json({ message: 'Imagem adicionada ao carrossel com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar carrossel:', error);
    return res.status(500).json({ error: 'Erro ao atualizar carrossel.' });
  }
});

// GET /api/carousel -> Retorna todas as imagens
router.get('/', async (req, res) => {
  try {
    const doc = await CarouselModel.findOne({});
    if (!doc || doc.images.length === 0) {
      return res.json({ images: [] });
    }
    return res.json({ images: doc.images });
  } catch (error) {
    console.error('Erro ao buscar carrossel:', error);
    return res.status(500).json({ error: 'Erro ao buscar carrossel.' });
  }
});

// DELETE /api/carousel/:imageFile -> Remove imagem do array
router.delete('/:imageFile', verifyToken, async (req, res) => {
  try {
    const { imageFile } = req.params;
    // Ex.: "1683213073453.jpg"

    const doc = await CarouselModel.findOne({});
    if (!doc) {
      return res.status(404).json({ error: 'Carrossel não encontrado.' });
    }

    // Se estamos salvando a URL completa:
    // "https://totalfilter-backend-production.up.railway.app/uploads/1683213073453.jpg"
    const fullUrlToRemove = `https://totalfilter-backend-production.up.railway.app/uploads/${imageFile}`;

    const index = doc.images.indexOf(fullUrlToRemove);
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
