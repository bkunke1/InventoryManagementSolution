const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Item {
  constructor(itemID, itemStatus, description, category, valuationMethod, type, defaultWarehouse, baseUOM, salesUOM, purchaseUOM, defaultPrice, totalQtyOnHand) {
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
  }

  save() {
    const db = getDb();
    return db
      .collection('items')
      .insertOne(this)
      .then((result) => {
        console.log(result);
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

  static findDuplicateID(itemID) {
    const db = getDb();
    return db
      .collection('items')
      .find({ itemID: itemID })
      .next()
      .then((item) => {
        console.log(item);
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
