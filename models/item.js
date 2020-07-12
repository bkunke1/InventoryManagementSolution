const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Item {
  constructor(
    itemID,
    itemStatus,
    description,
    category,
    valuationMethod,
    type,
    defaultWarehouse,
    baseUOM,
    salesUOM,
    purchaseUOM,
    defaultPrice,
    totalQtyOnHand,
    userId,
    id
  ) {
    this.itemID = itemID;
    this.itemStatus = itemStatus;
    this.description = description;
    this.category = category;
    this.valuationMethod = valuationMethod;
    this.type = type;
    this.defaultWarehouse = defaultWarehouse;
    this.baseUOM = baseUOM;
    this.salesUOM = salesUOM;
    this.purchaseUOM = purchaseUOM;
    this.defaultPrice = defaultPrice;
    this.totalQtyOnHand = totalQtyOnHand;
    this.userId = userId;
    this._id = id ? new mongodb.ObjectId(id) : null;
  }

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      //update the product
      dbOp = db
      .collection('items')
      .updateOne({ _id: this._id}, { $set: this });
    } else {
      dbOp = db
      .collection('items')
      .insertOne(this);
    }
    return dbOp
      .then((result) => {
        console.log(result);
        // console.log(this);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection('items')
      .find()
      .toArray()
      .then((items) => {
        return items;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findById(itemId) {
    const db = getDb();
    return db
      .collection('items')
      .find({ _id: new mongodb.ObjectId(itemId) })
      .next()
      .then((item) => {
        return item;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findByIdSecondID(itemID) {
    const db = getDb();
    return db
      .collection('items')
      .find({ itemID: itemID })
      .next()
      .then((item) => {
        return item;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = Item;
