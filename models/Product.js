const mongoose = require('mongoose');

// Definindo o Schema do Produto
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, default: "" }, // Permite string vazia se o preço não for enviado
  imageUrl: { type: String, required: true },
  isNewRelease: { type: Boolean, default: false } // Indica se é lançamento
});

// Exporta o modelo para ser usado em outras partes do projeto
module.exports = mongoose.model('Product', productSchema);
