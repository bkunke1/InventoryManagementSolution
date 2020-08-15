const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const warehouseSchema = new Schema({
  ID: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Warehouse', warehouseSchema);