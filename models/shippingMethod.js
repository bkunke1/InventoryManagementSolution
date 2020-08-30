const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const shippingMethodSchema = new Schema({
  ID: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('ShippingMethod', shippingMethodSchema);