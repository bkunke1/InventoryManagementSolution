const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const paymentTermSchema = new Schema({
  ID: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  days: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('PaymentTerm', paymentTermSchema);