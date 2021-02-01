const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const uomSchema = new Schema({
  ID: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  conversionQty: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('UOM', uomSchema);
