const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const itemSchema = new Schema({
  itemID: {
    type: String,
    required: true,
  },
  itemStatus: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  valuationMethod: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  defaultWarehouse: {
    type: String,
    required: true,
  },
  baseUOM: {
    type: String,
    required: true,
  },
  salesUOM: {
    type: String,
    required: true,
  },
  purchaseUOM: {
    type: String,
    required: true,
  },
  defaultPrice: {
    type: String,
    required: true,
  },
  totalQtyOnHand: {
    type: Number,
    required: true,
  },
  qtyOnOrder: {
    type: Number,
    required: false,
  },
  qtyAllocated: {
    type: Number,
    required: false,
  },
  userId: {
    type: String,
    required: false,
  },
  id: {
    type: String,
    required: false,
  },
  avgCost: {
    type: Number,
    required: false,
  },
  lotCost: {
    type: Object,
    required: false,
  },
});

module.exports = mongoose.model('Item', itemSchema);

// original mongodb model below..

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class Item {
//   constructor(
//     itemID,
//     itemStatus,
//     description,
//     category,
//     valuationMethod,
//     type,
//     defaultWarehouse,
//     baseUOM,
//     salesUOM,
//     purchaseUOM,
//     defaultPrice,
//     totalQtyOnHand,
//     userId,
//     id
//   ) {
//     this.itemID = itemID;
//     this.itemStatus = itemStatus;
//     this.description = description;
//     this.category = category;
//     this.valuationMethod = valuationMethod;
//     this.type = type;
//     this.defaultWarehouse = defaultWarehouse;
//     this.baseUOM = baseUOM;
//     this.salesUOM = salesUOM;
//     this.purchaseUOM = purchaseUOM;
//     this.defaultPrice = defaultPrice;
//     this.totalQtyOnHand = totalQtyOnHand;
//     this.userId = userId;
//     this._id = id ? new mongodb.ObjectId(id) : null;
//   }

//   save() {
//     const db = getDb();
//     let dbOp;
//     if (this._id) {
//       //update the product
//       dbOp = db
//         .collection('items')
//         .updateOne({ _id: this._id }, { $set: this });
//       console.log('updated item');
//     } else {
//       //create the product
//       dbOp = db.collection('items').insertOne(this);
//       console.log('created item');
//     }
//     return dbOp
//       .then((result) => {
//         // console.log('return res', result);
//         // console.log(this);
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static fetchAll() {
//     const db = getDb();
//     return db
//       .collection('items')
//       .find()
//       .toArray()
//       .then((items) => {
//         return items;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static findById(itemId) {
//     const db = getDb();
//     return db
//       .collection('items')
//       .find({ _id: new mongodb.ObjectId(itemId) })
//       .next()
//       .then((item) => {
//         return item;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }

//   static findByIdSecondID(itemID) {
//     const db = getDb();
//     return db
//       .collection('items')
//       .find({ itemID: itemID })
//       .next()
//       .then((item) => {
//         return item;
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// }

// module.exports = Item;
