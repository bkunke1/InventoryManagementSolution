// node library used to help validate fields
const { validationResult } = require('express-validator/check');

const Item = require('../models/item');
const Warehouse = require('../models/warehouse');
const UOM = require('../models/uom');
const Category = require('../models/category');
const PurchaseOrder = require('../models/purchaseOrder');
const uom = require('../models/uom');
const { name } = require('ejs');

exports.getPurchaseOrder = (req, res, next) => {
  res.render('purchaseOrder/purchase-order-blank', {
    pageTitle: 'Purchase Orders',
    mainMenuPath: 'purchaseOrders',
    subMenuPath: '',
  });
};

exports.getNewPurchaseOrder = (req, res, next) => {
  UOM.find()
    .then((uomList) => {
      PurchaseOrder.find()
        .then((poList) => {
          console.log(uomList);
          res.render('purchaseOrder/purchase-order-new', {
            pageTitle: 'New Purchase Orders',
            mainMenuPath: 'purchaseOrders',
            subMenuPath: '',
            newPONumber: ++poList.length,
            createdBy: req.session.user.email,
            shippingMethods: uomList, // should be updated to shippingMethod once crud is setup
          });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCreatePO = (req, res, next) => {
  const poNum = req.body.poNum;
  const poSelection = req.body.poSelection;
  const poStatus = 'OPEN';
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
    status: poStatus,
    vendorNum: vendor,
    orderDate: orderDate,
    expectedDate: expectedDate,
    shippingMethod: shippingMethod,
    terms: terms,
    createdBy: createdBy,
    shipToLocation: shipToLocation,
    poTableData: poTableData,
  });
  purchaseOrder
    .save()
    .then((result) => {
      console.log('Created Purchase Order');
      req.flash('createdMessage', 'PO was created!');
      res.redirect('/po');
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/500');
    });
};

// sends uom table data to front end
exports.getUOMs = (req, res, next) => {
  res.status(200).json({
    uoms: [
      { name: 'EACH', conversionQty: 1 },
      { name: 'CS12', conversionQty: 12 },
    ],
  });
};

// sends uom table data to front end
exports.getShippingMethods = (req, res, next) => {
  res.status(200).json({
    shippingMethods: ['DOCK PICKUP', 'DELIVERY', 'LTL', 'DROP SHIP'],
  });
};
