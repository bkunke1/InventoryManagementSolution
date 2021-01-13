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

  exports.postCreateSalesOrder = (req, res, next) => {
    const soNum = req.body.soNum;
    const customer = req.body.customer;
    const customerPoNum = req.body.customerPoNum;
    const orderDate = new Date(req.body.orderDate.split("-")[0], req.body.orderDate.split("-")[1] - 1, req.body.orderDate.split("-")[2]);
    const expectedDate = new Date(req.body.expectedDate.split("-")[0], req.body.expectedDate.split("-")[1] - 1, req.body.expectedDate.split("-")[2]);
    const shippingMethod = req.body.shippingMethod;
    const terms = req.body.terms;
    const createdBy = req.body.createdBy;
    const shipToLocation = req.body.shipToLocation;
    console.log('test1');
    // const poTableData = JSON.parse(req.body.poTableData);
    const soTableData = JSON.parse(req.body.receiverTableData);
    console.log('made it past table data');
    let UOMLIST;
  
    UOM.find().then(uomList => {
      UOMLIST = uomList;
    });
  
    function UOMQty(uomName) {
      const match = UOMLIST.find(x => x.name === uomName);
      return match.conversionQty;
    }
  
    console.log('soTableData', soTableData);
  
    const salesOrder = new SalesOrder({
      soNum: soNum,
      status: 'OPEN',
      customerNum: customer,
      customerPoNum: customerPoNum,
      orderDate: orderDate,
      expectedDate: expectedDate,
      shippingMethod: shippingMethod,
      terms: terms,
      createdBy: createdBy,
      shipToLocation: shipToLocation,
      soTableData: soTableData,
    });
    salesOrder
      .save()
      .then((result) => {
        soTableData.forEach((line) => {
          Item.findOne({ itemID: line.itemID }).then((item) => {          
            item.qtyOnOrder = +item.qtyOnOrder + +line.qtyOrdered * UOMQty(line.uom);  
            return item.save();
          })
        })
      })
      .then((result) => {
        console.log('Created Sales Order');
        req.flash('message', 'New Sales Order was created!');
        res.redirect(`/po/view/${soNum}`);
      })
      .catch((err) => {
        console.log(err);
        res.redirect('/500');
      });
  };