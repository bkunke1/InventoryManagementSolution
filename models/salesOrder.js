const mongoose = require('mongoose');
const { Double } = require('mongodb');

const Schema = mongoose.Schema;

const salesOrderSchema = new Schema({
  soNum: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  customerNum: {
    type: String,
    required: true,
  },
  customerPoNum: {
    type: String,
  },
  orderDate: {
    type: Date,
    required: true,
  },
  expectedDate: {
    type: Date,
    required: true,
  },
  shippingMethod: {
    type: String,
    required: true,
  },
  terms: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  shipToLocation: {
    type: String,
    required: true,
  },
  soTableData: [
    {
      line: {
        type: String,
        required: true,
      },
      itemID: {
        type: String,
        required: true,
      },
      itemDescription: {
        type: String,
        required: true,
      },
      qtyOrdered: {
        type: String,
        required: true,
      },
      uom: {
        type: String,
        required: true,
      },
      price: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
