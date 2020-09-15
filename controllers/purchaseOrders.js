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
const purchaseOrder = require('../models/purchaseOrder');

exports.getPurchaseOrder = (req, res, next) => {
  purchaseOrder
    .find()
    .then((poList) => {
      res.render('purchaseOrder/purchase-order-blank', {
        pageTitle: 'Purchase Orders',
        mainMenuPath: 'purchaseOrders',
        subMenuPath: '',
        poList: poList,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getNewPurchaseOrder = (req, res, next) => {
  Item.find()
    .then((itemList) => {
      Vendor.find().then((vendorList) => {
        Warehouse.find().then((warehouseList) => {
          PaymentTerm.find().then((paymentTermList) => {
            ShippingMethod.find().then((shippingMethodList) => {
              PurchaseOrder.find().then((poList) => {
                console.log(poList);
                res.render('purchaseOrder/purchase-order-new', {
                  pageTitle: 'New Purchase Orders',
                  mainMenuPath: 'purchaseOrders',
                  subMenuPath: '',
                  newPONumber: ++poList.length,
                  createdBy: req.session.user.email,
                  shippingMethodList: shippingMethodList,
                  paymentTermList: paymentTermList,
                  warehouseList: warehouseList,
                  vendorList: vendorList,
                  itemList: itemList,
                  poList: poList
                });
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
    status: 'OPEN',
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

// sends item data to front end
exports.postFindItem = (req, res, next) => {
  const itemId = req.params.itemId;
  Item.findOne({ itemID: itemId })
    .then((item) => {
      console.log('item', item);
      res.status(200).json(item);
    })
    .catch((err) => {
      console.log(err);
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

// // filters item list in item loopup modal
// exports.postFilterItemSelectionList = (req, res, next) => {
//   res.status(200).json({
//     uoms: [
//       { name: 'EACH', conversionQty: 1 },
//       { name: 'CS12', conversionQty: 12 },
//     ],
//   });
// };

exports.getExistingPurchaseOrder = (req, res, next) => {
  const poNum = req.params.poNum;
  console.log('poNum', poNum);
  Item.find()
    .then((itemList) => {
      Vendor.find().then((vendorList) => {
        Warehouse.find().then((warehouseList) => {
          PaymentTerm.find().then((paymentTermList) => {
            ShippingMethod.find().then((shippingMethodList) => {
              PurchaseOrder.findOne({ poNum: poNum }).then((po) => {
                PurchaseOrder.find().then((poList) => {
                  const poExpectedDateYear = po.expectedDate.getFullYear();
                  const poExpectedDateMonth = po.expectedDate
                    .getMonth()
                    .toLocaleString('en-US', {
                      minimumIntegerDigits: 2,
                      useGrouping: false,
                    });
                  const poExpectedDateDate = po.expectedDate
                    .getDate()
                    .toLocaleString('en-US', {
                      minimumIntegerDigits: 2,
                      useGrouping: false,
                    });
                  const poExpectedDate = `${poExpectedDateYear}-${poExpectedDateMonth}-${poExpectedDateDate}`;
                  console.log('expectedDate', poExpectedDate);
                  const poOrderDateYear = po.orderDate.getFullYear();
                  const poOrderDateMonth = po.orderDate
                    .getMonth()
                    .toLocaleString('en-US', {
                      minimumIntegerDigits: 2,
                      useGrouping: false,
                    });
                  const poOrderDateDate = po.orderDate
                    .getDate()
                    .toLocaleString('en-US', {
                      minimumIntegerDigits: 2,
                      useGrouping: false,
                    });
                  const poOrderDate = `${poOrderDateYear}-${poOrderDateMonth}-${poOrderDateDate}`;
                  console.log('orderDate', poOrderDate);
                  res.render('purchaseOrder/purchase-order-view', {
                    pageTitle: 'View Purchase Orders',
                    mainMenuPath: 'purchaseOrders',
                    subMenuPath: 'viewPO',
                    newPONumber: po.poNum,
                    createdBy: po.createdBy,
                    shippingMethodList: shippingMethodList,
                    paymentTermList: paymentTermList,
                    warehouseList: warehouseList,
                    vendorList: vendorList,
                    itemList: itemList,
                    poDetails: po,
                    poList: poList,
                    poOrderDate: poOrderDate,
                    poExpectedDate: poExpectedDate,
                  });
                });
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

exports.postUpdatePO = (req, res, next) => {
  const id = req.body.id;
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

  PurchaseOrder.findById(id)
    .then((po) => {
      console.log('po', po);
      // po.poNum = poNum;
      // po.status = poStatus;
      po.vendorNum = vendor;
      po.orderDate = orderDate;
      po.expectedDate = expectedDate;
      po.shippingMethod = shippingMethod;
      po.terms = terms;
      po.createdBy = createdBy;
      po.shipToLocation = shipToLocation;
      po.poTableData = poTableData;
      return po.save();
    })
    .then((result) => {
      console.log('Updated Purchase Order');
      req.flash('updatedMessage', 'PO was updated!');
      res.redirect('/po');
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/500');
    });
};
