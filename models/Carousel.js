const mongoose = require('mongoose');

const carouselSchema = new mongoose.Schema({
  images: {
    type: [String], // Armazena várias URLs de imagens
    default: []
  }
});

module.exports = mongoose.model('Carousel', carouselSchema);
