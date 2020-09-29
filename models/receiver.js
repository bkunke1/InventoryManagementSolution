const mongoose = require('mongoose');
const { Double } = require('mongodb');

const Schema = mongoose.Schema;

const receiverSchema = new Schema({
  receiverNum: {
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
  vendorInvoiceNum: {
    type: String,
    required: false
  },
  orderDate: {
    type: Date,
    required: true
  },
  receivedDate: {
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
  receiverTableData: [
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
    qtyReceived: {
      type: String,
      required: true
  },
    uom: {
        type: String,
        required: true
    },
    cost: {
        type: String,
        required: true
    }
    }
  ],
});

module.exports = mongoose.model('Receiver', receiverSchema);