// node library used to help validate fields
const { validationResult } = require('express-validator/check');

const Item = require('../models/item');
const Warehouse = require('../models/warehouse');
const UOM = require('../models/uom');
const Category = require('../models/category');
const PurchaseOrder = require('../models/purchaseOrder');

exports.postCreatePO = (req, res, next) => {
  const poNum = req.body.poNum;
  const status = req.body.status;
  const orderDate = req.body.orderDate;
  const expectedDate = req.body.expectedDate;
  const shippingMethod = req.body.shippingMethod;
  const terms = req.body.terms;
  const createdBy = req.body.createdBy;
  const shipToLocation = req.body.shipToLocation;
  const lineDetails = req.body.lineDetails;

  console.log(req.body)
}
   
    
//   },
//   lineDetails: [
//     { line: {
        
//     },
//     itemID: {
       
//     },
//     itemDescription: {
        
//     },
//     qtyOrdered: {
       
//     },
//     cost: {
       