// node library used to help validate fields
const { validationResult } = require('express-validator/check');

const Item = require('../models/item');
const Warehouse = require('../models/warehouse');
const UOM = require('../models/uom');
const Category = require('../models/category');
const PurchaseOrder = require('../models/purchaseOrder');
const ShippingMethod = require('../models/shippingMethod');
const PaymentTerm = require('../models/paymentTerm');
const Vendor = require('../models/vendor');

exports.getPurchaseOrder = (req, res, next) => {
  res.render('purchaseOrder/purchase-order-blank', {
    pageTitle: 'Purchase Orders',
    mainMenuPath: 'purchaseOrders',
    subMenuPath: '',
  });
};

exports.getNewPurchaseOrder = (req, res, next) => {
  Vendor
    .find()
    .then((vendorList) => {
      Warehouse.find()
        .then((warehouseList) => {
          PaymentTerm.find()
            .then((paymentTermList) => {
              ShippingMethod.find()
                .then((shippingMethodList) => {
                  PurchaseOrder.find()
                    .then((poList) => {
                      console.log(vendorList);
                      res.render('purchaseOrder/purchase-order-new', {
                        pageTitle: 'New Purchase Orders',
                        mainMenuPath: 'purchaseOrders',
                        subMenuPath: '',
                        newPONumber: ++poList.length,
                        createdBy: req.session.user.email,
                        shippingMethodList: shippingMethodList,
                        paymentTermList: paymentTermList,
                        warehouseList: warehouseList,
                        vendorList: vendorList
                      });
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                })
                .catch((err) => {
                  console.log(err);
                });
            })
            .catch((err) => {
              console.log(err);
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

exports.getOptions = (req, res, next) => {
  PaymentTerm.find()
    .then((paymentTermList) => {
      ShippingMethod.find()
        .then((shippingMethodList) => {
          console.log(shippingMethodList);
          res.render('purchaseOrder/options', {
            pageTitle: 'Purchasing Options',
            mainMenuPath: 'purchaseOptions',
            subMenuPath: '',
            shippingMethodList: shippingMethodList,
            paymentTermList: paymentTermList,
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

exports.postAddShippingMethod = (req, res, next) => {
  const ID = req.body.shippingMethodID;
  const name = req.body.shippingMethodName;

  const errors = validationResult(req);
  console.log('postAddShippingMethod Errors', errors);
  ShippingMethod.find()
    .then((shippingMethodList) => {
      if (!errors.isEmpty()) {
        PaymentTerm.find()
          .then((paymentTermList) => {
            res.render('purchaseOrder/options', {
              pageTitle: 'Purchasing Options',
              mainMenuPath: 'purchaseOptions',
              subMenuPath: '',
              shippingMethodList: shippingMethodList,
              paymentTermList: paymentTermList,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } else if (!ID) {
        console.log('Missing Shipping Method ID!');
        return res.redirect('/po/options');
      } else {
        const shippingMethod = new ShippingMethod({
          ID: ID,
          name: name.toUpperCase(),
        });
        shippingMethod
          .save()
          .then((result) => {
            console.log('Shipping Method Item was created!');
            req.flash('createdMessage', 'Shipping Method was created!');
            return res.redirect('/po/options');
          })
          .catch((err) => {
            console.log(err);
            res.redirect('/500');
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditShippingMethod = (req, res, next) => {
  const ID = req.body.editShippingMethodID;
  const name = req.body.editShippingMethodName;

  const errors = validationResult(req);
  console.log('postEditShippingMethod Errors', errors);
  ShippingMethod.find()
    .then((shippingMethodList) => {
      if (!errors.isEmpty()) {
        res.render('purchaseOrder/options', {
          pageTitle: 'Purchasing Options',
          mainMenuPath: 'purchaseOptions',
          subMenuPath: '',
          shippingMethodList: shippingMethodList,
          paymentTermList: paymentTermList,
        });
      } else if (!ID) {
        console.log('Missing Shipping Method ID!');
        return res.redirect('/po/options');
      } else {
        ShippingMethod.findOne({ ID: ID })
          .then((shippingMethod) => {
            shippingMethod.ID = ID;
            shippingMethod.name = name.toUpperCase();
            return shippingMethod.save().then((result) => {
              console.log('Shipping Method was Updated!');
              req.flash('createdMessage', 'Shipping Method was created!');
              return res.redirect('/po/options');
            });
          })
          .catch((err) => {
            console.log(err);
            res.redirect('/500');
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteShippingMethod = (req, res, next) => {
  const ID = req.body.shippingMethodID;
  console.log(ID);
  ShippingMethod.deleteOne({ ID: ID })
    .then(() => {
      console.log('DESTROYED Shipping Method');
      return res.redirect('/po/options');
    })
    .catch((err) => console.log(err));
};

exports.postAddPaymentTerm = (req, res, next) => {
  const ID = req.body.paymentTermID;
  const code = req.body.paymentTermCode;
  const days = req.body.paymentTermDays;

  const errors = validationResult(req);
  console.log('postAddPaymentTerm Errors', errors);
  PaymentTerm.find()
    .then((paymentTermList) => {
      if (!errors.isEmpty()) {
        res.render('purchaseOrder/options', {
          pageTitle: 'Purchasing Options',
          mainMenuPath: 'purchaseOptions',
          subMenuPath: '',
          shippingMethodList: shippingMethodList,
          paymentTermList: paymentTermList,
        });
      } else if (!ID) {
        console.log('Missing Payment Term ID!');
        return res.redirect('/po/options');
      } else {
        const paymentTerm = new PaymentTerm({
          ID: ID,
          code: code.toUpperCase(),
          days: days,
        });
        paymentTerm
          .save()
          .then((result) => {
            console.log('Payment Term Item was created!');
            req.flash('createdMessage', 'Payment Term was created!');
            return res.redirect('/po/options');
          })
          .catch((err) => {
            console.log(err);
            res.redirect('/500');
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditPaymentTerm = (req, res, next) => {
  const ID = req.body.editPaymentTermID;
  const code = req.body.editPaymentTermCode;
  const days = req.body.editPaymentTermDays;

  const errors = validationResult(req);
  console.log('postEditPaymentTerm Errors', errors);
  PaymentTerm.find()
    .then((paymentTermList) => {
      if (!errors.isEmpty()) {
        res.render('purchaseOrder/options', {
          pageTitle: 'Purchasing Options',
          mainMenuPath: 'purchaseOptions',
          subMenuPath: '',
          shippingMethodList: shippingMethodList,
          paymentTermList: paymentTermList,
        });
      } else if (!ID) {
        console.log('Missing Payment Term ID!');
        return res.redirect('/po/options');
      } else {
        PaymentTerm.findOne({ ID: ID })
          .then((paymentTerm) => {
            paymentTerm.ID = ID;
            paymentTerm.code = code.toUpperCase();
            paymentTerm.days = days;
            return paymentTerm.save().then((result) => {
              console.log('Payment Term was Updated!');
              req.flash('createdMessage', 'Payment Term was created!');
              return res.redirect('/po/options');
            });
          })
          .catch((err) => {
            console.log(err);
            res.redirect('/500');
          });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeletePaymentTerm = (req, res, next) => {
  const ID = req.body.paymentTermID;
  console.log(ID);
  PaymentTerm.deleteOne({ ID: ID })
    .then(() => {
      console.log('DESTROYED Payment Term');
      return res.redirect('/po/options');
    })
    .catch((err) => console.log(err));
};
