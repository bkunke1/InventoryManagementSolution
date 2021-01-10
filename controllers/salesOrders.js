// node library used to help validate fields
const { validationResult } = require('express-validator/check');

const SalesOrder = require('../models/salesOrder');
const Customer = require('../models/customer');
const Item = require('../models/item');
const Warehouse = require('../models/warehouse');
const UOM = require('../models/uom');
const Category = require('../models/category');
const ShippingMethod = require('../models/shippingMethod');
const PaymentTerm = require('../models/paymentTerm');

exports.getSalesOrder = (req, res, next) => {
  res.render('salesOrder/sales-order-blank', {
    pageTitle: 'Sales Orders',
    mainMenuPath: 'salesOrders',
    subMenuPath: '',
    soList: [],
  });
};

exports.getNewSalesOrder = (req, res, next) => {
  res.render('salesOrder/sales-order-new', {
    pageTitle: 'Sales Orders',
    mainMenuPath: 'salesOrders',
    subMenuPath: '',
    soList: [],
    soDetails: []
  });
};

exports.getNewSalesOrder = (req, res, next) => {
    console.log('trying to load new sales order')
    Item.find()
      .then((itemList) => {
        Customer.find().then((customerList) => {
            console.log('found customer list')
          Warehouse.find().then((warehouseList) => {
            console.log('found whs list')
            PaymentTerm.find().then((paymentTermList) => {
              ShippingMethod.find().then((shippingMethodList) => {
                SalesOrder.find().then((soList) => {
                    console.log('found salesOrders list')
                  // console.log(soList);
                  let lastSoNum;
                  if (soList.length < 1) {
                    lastSoNum = 0;
                  res.render('salesOrder/sales-order-new', {
                    pageTitle: 'New Sales Order',
                    mainMenuPath: 'salesOrders',
                    subMenuPath: '',
                    newSONumber: +lastSoNum + 1,
                    createdBy: req.session.user.email,
                    shippingMethodList: shippingMethodList,
                    paymentTermList: paymentTermList,
                    warehouseList: warehouseList,
                    customerList: customerList,
                    itemList: itemList,
                    soList: soList,
                  });
                  } else {
                    lastSoNum = soList[soList.length - 1].soNum;
                  // console.log(soList[soList.length - 1].soNum);
                  res.render('salesOrder/sales-order-new', {
                    pageTitle: 'New Sales Order',
                    mainMenuPath: 'salesOrders',
                    subMenuPath: '',
                    newSONumber: +lastSoNum + 1,
                    createdBy: req.session.user.email,
                    shippingMethodList: shippingMethodList,
                    paymentTermList: paymentTermList,
                    warehouseList: warehouseList,
                    customerList: customerList,
                    itemList: itemList,
                    soList: soList,
                  });
                  }
                  
                });
              });
            });
          });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };