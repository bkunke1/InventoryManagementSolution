// node library used to help validate fields
const { validationResult } = require('express-validator/check');

const Item = require('../models/item');
const Warehouse = require('../models/warehouse');
const UOM = require('../models/uom');
const Category = require('../models/category');
const PurchaseOrder = require('../models/purchaseOrder');

exports.postCreatePO = (req, res, next) => {
  const poNum = req.body.poNum;
  const poSelection = req.body.poSelection;
  const poStatus = req.body.poStatus;
  const vendor = req.body.vendor;
  const orderDate = req.body.orderDate;
  const expectedDate = req.body.expectedDate;
  const shippingMethod = req.body.shippingMethod;
  const terms = req.body.terms;
  const createdBy = req.body.createdBy;
  const shipToLocation = req.body.shipToLocation;
  const poTableData = JSON.parse(req.body.poTableData);

  console.log(req.body);

  const purchaseOrder = new PurchaseOrder({
    poNum: poNum,
    status: 'new',
    vendorNum: vendor,
    orderDate: orderDate,
    expectedDate: expectedDate,
    shippingMethod: shippingMethod,
    terms: terms,
    createdBy: createdBy,
    shipToLocation: 'needTofillin',
    poTableData: poTableData
  });
  purchaseOrder
    .save()
    .then((result) => {
      console.log('Created Purchase Order');
      req.flash('createdMessage', 'PO was created!');
      res.redirect('/po');;
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/500');
    });


  
};
