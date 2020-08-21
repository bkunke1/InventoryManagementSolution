const mongoose = require('mongoose');
const { Double } = require('mongodb');

const Schema = mongoose.Schema;

const purchaseOrderSchema = new Schema({
  poNum: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  vendorNum: {
    type: String,
    required: true
  },
  orderDate: {
    type: Date,
    required: true
  },
  expectedDate: {
    type: Date,
    required: true
  },
  shippingMethod: {
    type: String,
    required: true
  },
  terms: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  shipToLocation: {
    type: String,
    required: true
  },
  lineDetails: [
    { line: {
        type: String,
        required: true
    },
    itemID: {
        type: String,
        required: true
    },
    itemDescription: {
        type: String,
        required: true
    },
    qtyOrdered: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true
    }
    }
  ],
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);