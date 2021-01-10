const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const customerSchema = new Schema({
  ID: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('CUSTOMER', customerSchema);