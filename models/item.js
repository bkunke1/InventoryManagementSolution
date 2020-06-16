const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;

class Item {
  constructor(description, category, totalQty, uom, avgCost, retailPrice) {
    this.description = description;
    this.category = category;
    this.totalQtyOnHand = totalQty;
    this.uom = uom;
    this.avgCost = avgCost;
    this.retailPrice = retailPrice;
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
        console.log(items);
        return items;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findById(prodId) {
    const db = getDb();
    return db
      .collection('items')
      .find({ _id: new mongodb.ObjectId(prodId) })
      .next()
      .then((item) => {
        console.log(item);
        return item;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = Item;
