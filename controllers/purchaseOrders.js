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
const { search } = require('../routes/purchaseOrders');
const Receiver = require('../models/receiver');
const receiver = require('../models/receiver');
const uom = require('../models/uom');
const { aggregate } = require('../models/item');
const { forEach } = require('lodash');
const PDFDocument = require('pdfkit');

exports.getPurchaseOrder = (req, res, next) => {
  let message = req.flash('message');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  let error = req.flash('error');
  if (error.length > 0) {
    error = error[0];
  } else {
    error = null;
  }

  purchaseOrder
    .find()
    .then((poList) => {
      res.render('purchaseOrder/purchase-order-blank', {
        pageTitle: 'Purchase Orders',
        mainMenuPath: 'purchaseOrders',
        subMenuPath: '',
        poList: poList,
        errorMessage: error,
        message: message,
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
                // console.log(poList);
                let lastPoNum;
                if (poList.length < 1) {
                  lastPoNum = 0;
                  res.render('purchaseOrder/purchase-order-new', {
                    pageTitle: 'New Purchase Orders',
                    mainMenuPath: 'purchaseOrders',
                    subMenuPath: '',
                    newPONumber: +lastPoNum + 1,
                    createdBy: req.session.user.email,
                    shippingMethodList: shippingMethodList,
                    paymentTermList: paymentTermList,
                    warehouseList: warehouseList,
                    vendorList: vendorList,
                    itemList: itemList,
                    poList: poList,
                  });
                } else {
                  lastPoNum = poList[poList.length - 1].poNum;
                  // console.log(poList[poList.length - 1].poNum);
                  res.render('purchaseOrder/purchase-order-new', {
                    pageTitle: 'New Purchase Orders',
                    mainMenuPath: 'purchaseOrders',
                    subMenuPath: '',
                    newPONumber: +lastPoNum + 1,
                    createdBy: req.session.user.email,
                    shippingMethodList: shippingMethodList,
                    paymentTermList: paymentTermList,
                    warehouseList: warehouseList,
                    vendorList: vendorList,
                    itemList: itemList,
                    poList: poList,
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

exports.postCreatePO = (req, res, next) => {
  const poNum = req.body.poNum;
  const vendor = req.body.vendor;
  const orderDate = new Date(
    req.body.orderDate.split('-')[0],
    req.body.orderDate.split('-')[1] - 1,
    req.body.orderDate.split('-')[2]
  );
  const expectedDate = new Date(
    req.body.expectedDate.split('-')[0],
    req.body.expectedDate.split('-')[1] - 1,
    req.body.expectedDate.split('-')[2]
  );
  const shippingMethod = req.body.shippingMethod;
  const terms = req.body.terms;
  const createdBy = req.body.createdBy;
  const shipToLocation = req.body.shipToLocation;
  const poTableData = JSON.parse(req.body.poTableData);
  let UOMLIST;

  UOM.find().then((uomList) => {
    UOMLIST = uomList;
  });

  function UOMQty(uomName) {
    const match = UOMLIST.find((x) => x.name === uomName);
    return match.conversionQty;
  }

  // console.log('poTableData', poTableData);

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
      poTableData.forEach((line) => {
        Item.findOne({ itemID: line.itemID }).then((item) => {
          item.qtyOnOrder =
            +item.qtyOnOrder + +line.qtyOrdered * UOMQty(line.uom);
          return item.save();
        });
      });
    })
    .then((result) => {
      console.log('Created Purchase Order');
      req.flash('message', 'PO was created!');
      res.redirect(`/po/view/${poNum}`);
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
      // console.log('item', item);
      res.status(200).json(item);
    })
    .catch((err) => {
      console.log(err);
    });
};

// sends uom table data to front end
exports.getUOMs = (req, res, next) => {
  UOM.find()
    .then((uomList) => {
      let uoms = [];
      for (unit of uomList) {
        uoms.push({ name: unit.name, conversionQty: unit.conversionQty });
      }
      return uoms;
    })
    .then((result) => {
      res.status(200).json({
        uoms: result,
      });
    })
    .catch((err) => {
      console.log(err);
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
          // console.log(shippingMethodList);
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
  // console.log('postAddShippingMethod Errors', errors);
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
  // console.log('postEditShippingMethod Errors', errors);
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
  // console.log(ID);
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
  // console.log('postAddPaymentTerm Errors', errors);
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
  let message = req.flash('message');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  let error = req.flash('error');
  if (error.length > 0) {
    error = error[0];
  } else {
    error = null;
  }

  const poNum = req.params.poNum;
  UOM.find()
    .then((uomList) => {
      Item.find().then((itemList) => {
        Vendor.find().then((vendorList) => {
          Warehouse.find().then((warehouseList) => {
            PaymentTerm.find().then((paymentTermList) => {
              ShippingMethod.find().then((shippingMethodList) => {
                PurchaseOrder.findOne({ poNum: poNum }).then((po) => {
                  PurchaseOrder.find().then((poList) => {
                    const formatOrderDate = new Date(po.orderDate);
                    formatOrderDate.setMinutes(
                      formatOrderDate.getMinutes() + 240
                    );
                    const orderDate = `${formatOrderDate.getFullYear()}-${(
                      +formatOrderDate.getMonth() + 1
                    ).toLocaleString('en-US', {
                      minimumIntegerDigits: 2,
                      useGrouping: false,
                    })}-${formatOrderDate.getDate().toLocaleString('en-US', {
                      minimumIntegerDigits: 2,
                      useGrouping: false,
                    })}`;
                    const formatExpectedDate = new Date(po.expectedDate);
                    formatExpectedDate.setMinutes(
                      formatExpectedDate.getMinutes() + 240
                    );
                    const expectedDate = `${formatExpectedDate.getFullYear()}-${(
                      +formatExpectedDate.getMonth() + 1
                    ).toLocaleString('en-US', {
                      minimumIntegerDigits: 2,
                      useGrouping: false,
                    })}-${formatExpectedDate.getDate().toLocaleString('en-US', {
                      minimumIntegerDigits: 2,
                      useGrouping: false,
                    })}`;

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
                      poOrderDate: orderDate,
                      poExpectedDate: expectedDate,
                      uomList: uomList,
                      errorMessage: error,
                      message: message,
                    });
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

// below are two helper functions to convert the uom converstion qty when updating item info
UOM.find().then((uomList) => {
  UOMLIST = uomList;
});

function UOMQty(uomName) {
  const match = UOMLIST.find((x) => x.name === uomName);
  return match.conversionQty;
}

exports.postUpdatePO = (req, res, next) => {
  const id = req.body.id;
  const poNum = req.body.poNum;
  const poStatus = req.body.poStatus;
  const vendor = req.body.vendor;
  const orderDate = req.body.orderDate;
  const expectedDate = req.body.expectedDate;
  const shippingMethod = req.body.shippingMethod;
  const terms = req.body.terms;
  const createdBy = req.body.createdBy;
  const shipToLocation = req.body.shipToLocation;
  const poTableData = JSON.parse(req.body.poTableData);
  const poTableDataOriginal = JSON.parse(req.body.poTableData);
  const itemOriginalQty = [];
  const itemNewQty = [];

  // console.log('poTableDataOriginal', poTableDataOriginal);

  let message = req.flash('message');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  let error = req.flash('error');
  if (error.length > 0) {
    error = error[0];
  } else {
    error = null;
  }

  PurchaseOrder.findById(id)
    .then((po) => {
      po.poTableData.forEach((line) => {
        itemOriginalQty.push({
          itemID: line.itemID,
          qtyOriginallyOrdered: line.qtyOrdered * UOMQty(line.uom),
        });
      });
      console.log('itemOriginalQty', itemOriginalQty);

      po.vendorNum = vendor;
      po.orderDate = new Date(
        orderDate.split('-')[0],
        orderDate.split('-')[1] - 1,
        orderDate.split('-')[2]
      );
      po.expectedDate = new Date(
        expectedDate.split('-')[0],
        expectedDate.split('-')[1] - 1,
        expectedDate.split('-')[2]
      );
      po.shippingMethod = shippingMethod;
      po.terms = terms;
      po.createdBy = createdBy;
      po.shipToLocation = shipToLocation;
      console.log('oldPoTableData', po.poTableData);
      po.poTableData = poTableData;
      console.log('newPoTableData', poTableData);

      return po.save();
    })
    .then((result) => {
      poTableData.forEach((line) => {
        itemNewQty.push({
          itemID: line.itemID,
          qtyOrdered: line.qtyOrdered * UOMQty(line.uom),
        });
      });
      console.log('itemNewQty', itemNewQty);

      function updateItemQty(itemID) {
        for (let i = 0; i < itemOriginalQty.length; i++) {
          let result = 0;
          if (itemOriginalQty[i].itemID === itemID) {
            console.log(
              'match found',
              itemID,
              'qty',
              itemOriginalQty[i].qtyOriginallyOrdered
            );
            result = Number(itemOriginalQty[i].qtyOriginallyOrdered);
            return result;
          }
        }
      }

      const itemQtyDifference = [];
      itemNewQty.forEach((item) => {
        itemQtyDifference.push({
          itemID: item.itemID,
          oldQty: updateItemQty(item.itemID),
          newQty: +item.qtyOrdered,
          diffQty: +item.qtyOrdered - updateItemQty(item.itemID),
        });
      });
      console.log(itemQtyDifference);

      itemQtyDifference.forEach((el) => {
        Item.findOne({ itemID: el.itemID })
          .then((item) => {
            console.log('item', item.itemID, 'qtyOnOrder', item.qtyOnOrder);
            item.qtyOnOrder = item.qtyOnOrder + el.diffQty;
            console.log('item', item.itemID, 'qtyOnOrder', item.qtyOnOrder);
            return item.save();
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .then((result) => {
      console.log('Updated Purchase Order');
      req.flash('message', 'PO was updated!');
      res.redirect(`/po/view/${poNum}`);
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/500');
    });
};

exports.getNextPurchaseOrder = (req, res, next) => {
  if (req.params.poNum === 'empty') {
    PurchaseOrder.find()
      .then((poList) => {
        if (poList[0].poNum) {
          res.redirect(`/po/view/${poList[0].poNum}`);
        } else {
          res.redirect('/po');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    let poList = [];
    PurchaseOrder.find()
      .then((pos) => {
        for (po of pos) {
          poList.push(po.poNum);
        }
        poNum = req.params.poNum;
        const currentPOIndex = poList.indexOf(poNum);
        const nextPOIndex = currentPOIndex + 1;
        const lastPOIndex = poList.length - 1;
        if (currentPOIndex === lastPOIndex) {
          return poList[0];
        } else {
          return poList[nextPOIndex];
        }
      })
      .then((result) => {
        res.redirect(`/po/view/${result}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.getPreviousPurchaseOrder = (req, res, next) => {
  if (req.params.poNum === 'empty') {
    PurchaseOrder.find()
      .then((poList) => {
        const lastIndexPO = poList.length;
        if (poList[lastIndexPO - 1].poNum) {
          res.redirect(`/po/view/${poList[lastIndexPO - 1].poNum}`);
        } else {
          res.redirect(`/po`);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    let poList = [];
    PurchaseOrder.find()
      .then((pos) => {
        for (po of pos) {
          poList.push(po.poNum);
        }
        poNum = req.params.poNum;
        const currentPOIndex = poList.indexOf(poNum);
        const previousPOIndex = currentPOIndex - 1;
        const lastPOIndex = poList.length - 1;
        if (currentPOIndex === 0) {
          return poList[lastPOIndex];
        } else {
          return poList[previousPOIndex];
        }
      })
      .then((result) => {
        res.redirect(`/po/view/${result}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.postDeletePurchaseOrder = (req, res, next) => {
  const poNum = req.body.poNum;
  const ID = req.body.id;

  UOM.find().then((uomList) => {
    UOMLIST = uomList;
  });

  function UOMQty(uomName) {
    const match = UOMLIST.find((x) => x.name === uomName);
    return match.conversionQty;
  }

  Receiver.find()
    .then((receiverList) => {
      const receiverNums = receiverList.map((receiver) => receiver.receiverNum);
      if (receiverNums.includes(poNum)) {
        console.log('receiver exists');
        res.redirect(`/po/view/${poNum}`);
      } else {
        PurchaseOrder.findOne({ _id: ID })
          .then((po) => {
            console.log('po for deletion', po);
            po.poTableData.forEach((line) => {
              Item.findOne({ itemID: line.itemID })
                .then((item) => {
                  item.qtyOnOrder =
                    +item.qtyOnOrder - +line.qtyOrdered * UOMQty(line.uom);
                  return item.save();
                })
                .then((result) => {})
                .catch((err) => {
                  console.log(err);
                });
            });
          })
          .then((result) => {
            PurchaseOrder.deleteOne({ _id: ID })
              .then(() => {
                console.log('DESTROYED PO', poNum);
                req.flash('message', `PO #${poNum} was deleted!`);
                return res.redirect('/po');
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => {
            console.log(err);
          });
        // PurchaseOrder.deleteOne({ _id: ID })  // moved into block above to prevent conflict in deletion timing
        //   .then(() => {
        //     console.log('DESTROYED PO', poNum);
        //     return res.redirect('/po');
        //   })
        //   .catch((err) => console.log(err));
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// loads blank receiver
exports.getBlankReciever = (req, res, next) => {
  let message = req.flash('message');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  let error = req.flash('error');
  if (error.length > 0) {
    error = error[0];
  } else {
    error = null;
  }

  Item.find()
    .then((itemList) => {
      Vendor.find().then((vendorList) => {
        Warehouse.find().then((warehouseList) => {
          PaymentTerm.find().then((paymentTermList) => {
            ShippingMethod.find().then((shippingMethodList) => {
              Receiver.find().then((receiverList) => {
                res.render('purchaseOrder/receiver-blank', {
                  pageTitle: 'View Receiver',
                  mainMenuPath: 'purchaseOrders',
                  subMenuPath: 'viewReceiver',
                  shippingMethodList: shippingMethodList,
                  paymentTermList: paymentTermList,
                  warehouseList: warehouseList,
                  vendorList: vendorList,
                  itemList: itemList,
                  receiverList: receiverList,
                  errorMessage: error,
                  message: message,
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

// loads unsaved receiver with current PO data
exports.getLoadNewReciever = (req, res, next) => {
  let message = req.flash('message');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  let error = req.flash('error');
  if (error.length > 0) {
    error = error[0];
  } else {
    error = null;
  }

  const poNum = req.params.receiverNum;
  Receiver.find()
    .then((receiverList) => {
      const receiverNums = receiverList.map((receiver) => receiver.receiverNum);
      if (receiverNums.includes(poNum)) {
        res.redirect(`/po/receiver/view/${poNum}`);
      } else {
        console.log('created a new receiver!');
        UOM.find().then((uomList) => {
          Item.find().then((itemList) => {
            Vendor.find().then((vendorList) => {
              Warehouse.find().then((warehouseList) => {
                PaymentTerm.find().then((paymentTermList) => {
                  ShippingMethod.find().then((shippingMethodList) => {
                    PurchaseOrder.findOne({ poNum: poNum }).then((po) => {
                      PurchaseOrder.find().then((poList) => {
                        const formatOrderDate = new Date(po.orderDate);
                        formatOrderDate.setMinutes(
                          formatOrderDate.getMinutes() + 240
                        );
                        const orderDate = `${formatOrderDate.getFullYear()}-${(
                          +formatOrderDate.getMonth() + 1
                        ).toLocaleString('en-US', {
                          minimumIntegerDigits: 2,
                          useGrouping: false,
                        })}-${formatOrderDate
                          .getDate()
                          .toLocaleString('en-US', {
                            minimumIntegerDigits: 2,
                            useGrouping: false,
                          })}`;
                        const formatExpectedDate = new Date(po.expectedDate);
                        formatExpectedDate.setMinutes(
                          formatExpectedDate.getMinutes() + 240
                        );
                        const expectedDate = `${formatExpectedDate.getFullYear()}-${(
                          +formatExpectedDate.getMonth() + 1
                        ).toLocaleString('en-US', {
                          minimumIntegerDigits: 2,
                          useGrouping: false,
                        })}-${formatExpectedDate
                          .getDate()
                          .toLocaleString('en-US', {
                            minimumIntegerDigits: 2,
                            useGrouping: false,
                          })}`;
                        console.log(orderDate);
                        console.log(expectedDate);

                        let testDate = `${
                          orderDate.split('-')[0]
                        }-${orderDate.split('-')[1].toLocaleString('en-US', {
                          minimumIntegerDigits: 2,
                          useGrouping: false,
                        })}-${orderDate.split('-')[2]}`;

                        res.render('purchaseOrder/receiver-new', {
                          pageTitle: 'View Receiver',
                          mainMenuPath: 'purchaseOrders',
                          subMenuPath: 'viewReceiver',
                          newPONumber: po.poNum,
                          createdBy: po.createdBy,
                          shippingMethodList: shippingMethodList,
                          paymentTermList: paymentTermList,
                          warehouseList: warehouseList,
                          vendorList: vendorList,
                          itemList: itemList,
                          poDetails: po,
                          poList: poList,
                          // poOrderDate: orderDate,
                          // poExpectedDate: expectedDate,
                          poOrderDate: testDate.toString(),
                          poExpectedDate: new Date(
                            expectedDate.split('-')[0],
                            expectedDate.split('-')[1] - 1,
                            expectedDate.split('-')[2]
                          ),
                          receiverStatus: 'new',
                          uomList: uomList,
                          errorMessage: error,
                          message: message,
                          receiverList: receiverList,
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCreateReceiver = (req, res, next) => {
  let message = req.flash('message');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  let error = req.flash('error');
  if (error.length > 0) {
    error = error[0];
  } else {
    error = null;
  }

  console.log('created receiver');
  const receiverNum = req.body.poNum;
  const vendor = req.body.vendor;
  const vendorInvoiceNum = req.body.vendorInvoiceNum;
  const orderDate = new Date(
    req.body.orderDate.split('-')[0],
    req.body.orderDate.split('-')[1] - 1,
    req.body.orderDate.split('-')[2]
  );
  console.log('saved orderdate', orderDate);
  const receivedDate = new Date(
    req.body.receivedDate.split('-')[0],
    req.body.receivedDate.split('-')[1] - 1,
    req.body.receivedDate.split('-')[2]
  );
  console.log('saved received date', receivedDate);
  const shippingMethod = req.body.shippingMethod;
  const terms = req.body.terms;
  const createdBy = req.body.createdBy;
  const shipToLocation = req.body.shipToLocation;
  const receiverTableData = JSON.parse(req.body.receiverTableData);

  // console.log('receiverTableData', receiverTableData);
  Receiver.find()
    .then((receiverList) => {
      const receiver = new Receiver({
        receiverNum: receiverNum,
        status: 'OPEN',
        vendorNum: vendor,
        vendorInvoiceNum: vendorInvoiceNum,
        orderDate: orderDate,
        receivedDate: receivedDate,
        shippingMethod: shippingMethod,
        terms: terms,
        createdBy: createdBy,
        shipToLocation: shipToLocation,
        receiverTableData: receiverTableData,
        errorMessage: error,
        message: message,
        receiverList: receiverList,
      });
      receiver.save().then((result) => {
        PurchaseOrder.findOne({ poNum: receiverNum }).then((po) => {
          // console.log('po', po);
          po.status = 'RECEIVED';
          return po.save();
        });

        console.log('Created Receiver');
        req.flash('message', 'Receiver was created!');
        res.redirect(`/po/receiver/view/${receiverNum}`);
      });
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/500');
    });
};

exports.getExistingReceiver = (req, res, next) => {
  let message = req.flash('message');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  let error = req.flash('error');
  if (error.length > 0) {
    error = error[0];
  } else {
    error = null;
  }

  const receiverNum = req.params.receiverNum;
  UOM.find()
    .then((uomList) => {
      Item.find().then((itemList) => {
        Vendor.find().then((vendorList) => {
          Warehouse.find().then((warehouseList) => {
            PaymentTerm.find().then((paymentTermList) => {
              ShippingMethod.find().then((shippingMethodList) => {
                Receiver.findOne({ receiverNum: receiverNum }).then(
                  (receiver) => {
                    Receiver.find().then((receiverList) => {
                      const formatOrderDate = new Date(receiver.orderDate);
                      formatOrderDate.setMinutes(
                        formatOrderDate.getMinutes() + 240
                      );
                      const orderDate = `${formatOrderDate.getFullYear()}-${(
                        +formatOrderDate.getMonth() + 1
                      ).toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false,
                      })}-${formatOrderDate.getDate().toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false,
                      })}`;
                      const formatReceivedDate = new Date(
                        receiver.receivedDate
                      );
                      formatReceivedDate.setMinutes(
                        formatReceivedDate.getMinutes() + 240
                      );
                      const receivedDate = `${formatReceivedDate.getFullYear()}-${(
                        +formatReceivedDate.getMonth() + 1
                      ).toLocaleString('en-US', {
                        minimumIntegerDigits: 2,
                        useGrouping: false,
                      })}-${formatReceivedDate
                        .getDate()
                        .toLocaleString('en-US', {
                          minimumIntegerDigits: 2,
                          useGrouping: false,
                        })}`;

                      res.render('purchaseOrder/receiver-view', {
                        pageTitle: 'View Receiver',
                        mainMenuPath: 'purchaseOrders',
                        subMenuPath: 'viewReceiver',
                        newReceiverNumber: receiver.receiverNum,
                        createdBy: receiver.createdBy,
                        shippingMethodList: shippingMethodList,
                        paymentTermList: paymentTermList,
                        warehouseList: warehouseList,
                        vendorList: vendorList,
                        itemList: itemList,
                        receiverDetails: receiver,
                        receiverList: receiverList,
                        receiverOrderDate: orderDate,
                        receiverReceivedDate: receivedDate,
                        uomList: uomList,
                        message: message,
                        errorMessage: error,
                      });
                    });
                  }
                );
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

exports.postUpdateReceiver = (req, res, next) => {
  let message = req.flash('message');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  let error = req.flash('error');
  if (error.length > 0) {
    error = error[0];
  } else {
    error = null;
  }
  // console.log(req.body);
  const id = req.body.id;
  const receiverNum = req.body.receiverNum;
  const receiverStatus = req.body.receiverStatus;
  const vendor = req.body.vendor;
  const vendorInvoiceNum = req.body.vendorInvoiceNum;
  const orderDate = new Date(
    req.body.orderDate.split('-')[0],
    req.body.orderDate.split('-')[1] - 1,
    req.body.orderDate.split('-')[2]
  );
  const receivedDate = new Date(
    req.body.receivedDate.split('-')[0],
    req.body.receivedDate.split('-')[1] - 1,
    req.body.receivedDate.split('-')[2]
  );
  // console.log(receivedDate);
  const shippingMethod = req.body.shippingMethod;
  const terms = req.body.terms;
  const createdBy = req.body.createdBy;
  const shipToLocation = req.body.shipToLocation;
  const receiverTableData = JSON.parse(req.body.receiverTableData);

  console.log(orderDate);
  console.log(receivedDate);

  if (receiverStatus === 'POSTED') {
    console.log('Receiver is already posted');
    req.flash('message', 'Receiver was already updated!');
    res.redirect(`/po/receiver/view/${receiverNum}`);
  }

  Receiver.findById(id)
    .then((receiver) => {
      // console.log('receiver', receiver);
      receiver.receiverNum = receiverNum;
      receiver.status = receiverStatus;
      receiver.vendorNum = vendor;
      receiver.vendorInvoiceNum = vendorInvoiceNum;
      receiver.orderDate = orderDate;
      receiver.receivedDate = receivedDate;
      receiver.shippingMethod = shippingMethod;
      receiver.terms = terms;
      receiver.createdBy = createdBy;
      receiver.shipToLocation = shipToLocation;
      receiver.receiverTableData = receiverTableData;
      return receiver.save();
    })
    .then((result) => {
      console.log('Updated Receiver');
      req.flash('message', 'Receiver was updated!');
      res.redirect(`/po/receiver/view/${receiverNum}`);
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/500');
    });
};

exports.postDeleteReceiver = (req, res, next) => {
  const receiverNum = req.body.receiverNum;
  const ID = req.body.id;
  const status = req.body.receiverStatus;

  if (status === 'POSTED') {
    console.log('cannot delete posted receiver!');
    res.redirect(`/po/receiver/view/${receiverNum}`);
  } else {
    Receiver.findOne({ _id: ID })
      .then((receiver) => {
        console.log('receiver for deletion', receiver);
        receiver.receiverTableData.forEach((line) => {
          Item.findOne({ itemID: line.itemID })
            .then((item) => {
              item.qtyOnOrder =
                +item.qtyOnOrder - +line.qtyOrdered * UOMQty(line.uom);
              return item.save();
            })
            .then((result) => {})
            .catch((err) => {
              console.log(err);
            });
        });
      })
      .then((result) => {
        Receiver.deleteOne({ _id: ID }).then(() => {
          console.log('DESTROYED RECEIVER', receiverNum);
          req.flash('message', `Receiver #${receiverNum} was deleted!`);
          return res.redirect('/po/receiver/view/');
        });
      })
      .catch((err) => console.log(err));
  }
};

exports.getNextReceiver = (req, res, next) => {
  if (req.params.receiverNum === 'empty') {
    Receiver.find()
      .then((receiverList) => {
        if (receiverList[0]) {
          res.redirect(`/po/receiver/view/${receiverList[0].receiverNum}`);
        } else {
          res.redirect('/po/receiver/view/');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    let receiverList = [];
    Receiver.find()
      .then((receivers) => {
        for (rec of receivers) {
          receiverList.push(rec.receiverNum);
        }
        const receiverNum = req.params.receiverNum;
        const currentReceiverIndex = receiverList.indexOf(receiverNum);
        const nextReceiverIndex = currentReceiverIndex + 1;
        const lastReceiverIndex = receiverList.length - 1;
        if (currentReceiverIndex === lastReceiverIndex) {
          return receiverList[0];
        } else {
          return receiverList[nextReceiverIndex];
        }
      })
      .then((result) => {
        res.redirect(`/po/receiver/view/${result}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.getPreviousReceiver = (req, res, next) => {
  if (req.params.receiverNum === 'empty') {
    Receiver.find()
      .then((receiverList) => {
        const lastIndexReceiver = receiverList.length;
        if (receiverList[lastIndexReceiver - 1].receiverNum) {
          res.redirect(
            `/po/receiver/view/${
              receiverList[lastIndexReceiver - 1].receiverNum
            }`
          );
        } else {
          res.redirect(`/po/receiver/view/`);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    let receiverList = [];
    Receiver.find()
      .then((receivers) => {
        for (rec of receivers) {
          receiverList.push(rec.receiverNum);
        }
        receiverNum = req.params.receiverNum;
        const currentReceiverIndex = receiverList.indexOf(receiverNum);
        const previousReceiverIndex = currentReceiverIndex - 1;
        const lastReceiverIndex = receiverList.length - 1;
        if (currentReceiverIndex === 0) {
          return receiverList[lastReceiverIndex];
        } else {
          return receiverList[previousReceiverIndex];
        }
      })
      .then((result) => {
        res.redirect(`/po/receiver/view/${result}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

// exports.postReceiver = (req, res, next) => {
//   const receiverNum = req.body.receiverNum;
//   if (req.body.receiverStatus !== 'POSTED') {
//     console.log('Receiver is already posted!');
//     req.flash('updatedMessage', 'Receiver is already posted!');
//     res.redirect(`/po/receiver/view/${receiverNum}`);
//   } else {
//     const id = req.body.id;
//     const receiverStatus = 'POSTED';
//     const vendor = req.body.vendor;
//     const vendorInvoiceNum = req.body.vendorInvoiceNum;
//     const orderDate = req.body.orderDate;
//     const receivedDate = req.body.receivedDate;
//     const shippingMethod = req.body.shippingMethod;
//     const terms = req.body.terms;
//     const createdBy = req.body.createdBy;
//     const shipToLocation = req.body.shipToLocation;
//     const receiverTableData = JSON.parse(req.body.receiverTableData);

//     UOM.find()
//       .then((uoms) => {
//         Receiver.findById(id)
//           .then((receiver) => {
//             receiver.receiverNum = receiverNum;
//             receiver.status = receiverStatus;
//             receiver.vendorNum = vendor;
//             receiver.vendorInvoiceNum = vendorInvoiceNum;
//             receiver.orderDate = orderDate;
//             receiver.receivedDate = receivedDate;
//             receiver.shippingMethod = shippingMethod;
//             receiver.terms = terms;
//             receiver.createdBy = createdBy;
//             receiver.shipToLocation = shipToLocation;
//             receiver.receiverTableData = receiverTableData;
//             console.log('receiver', receiver);
//             return receiver.save();
//           })
//           .then((result) => {
//             for (line of result.receiverTableData) {
//               console.log('line', line.line);
//               const itemID = line.itemID;
//               Item.findOne({ itemID: itemID })
//                 .then((item) => {
//                   console.log('line3', line.line);
//                   const selectedUOM = uoms.find(
//                     ({ name }) => name === line.uom
//                   );
//                   console.log(line.line, 'item qty', item.totalQtyOnHand);
//                   console.log(
//                     line.line,
//                     'qty rec',
//                     +line.qtyReceived * selectedUOM.conversionQty
//                   );
//                   item.totalQtyOnHand =
//                     +item.totalQtyOnHand +
//                     +line.qtyReceived * selectedUOM.conversionQty;
//                   item.qtyOnOrder =
//                     +item.totalQtyOnHand -
//                     +line.qtyReceived * selectedUOM.conversionQty;

//                   return item.save();
//                 })
//                 .then((result) => {
//                   console.log(result);
//                 })
//                 .catch((err) => {
//                   console.log(err);
//                 });
//             } // end for loop
//           })
//           .then((result) => {
//             console.log('POSTED Receiver');
//             req.flash('updatedMessage', 'Receiver was posted!');
//             res.redirect(`/po/receiver/view/${receiverNum}`);
//           });
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   }
// };

//v2
exports.postReceiver = (req, res, next) => {
  const receiverNum = req.body.receiverNum;
  if (req.body.receiverStatus === 'POSTED') {
    console.log('Receiver is already posted!');
    req.flash('message', 'Receiver is already posted!');
    res.redirect(`/po/receiver/view/${receiverNum}`);
  } else {
    const id = req.body.id;
    const receiverStatus = 'POSTED';
    const vendor = req.body.vendor;
    const vendorInvoiceNum = req.body.vendorInvoiceNum;
    const orderDate = new Date(
      req.body.orderDate.split('-')[0],
      req.body.orderDate.split('-')[1] - 1,
      req.body.orderDate.split('-')[2]
    );
    const receivedDate = new Date(
      req.body.receivedDate.split('-')[0],
      req.body.receivedDate.split('-')[1] - 1,
      req.body.receivedDate.split('-')[2]
    );
    const shippingMethod = req.body.shippingMethod;
    const terms = req.body.terms;
    const createdBy = req.body.createdBy;
    const shipToLocation = req.body.shipToLocation;
    const receiverTableData = JSON.parse(req.body.receiverTableData);

    UOM.find()
      .then((uoms) => {
        Receiver.findById(id)
          .then((receiver) => {
            receiver.receiverNum = receiverNum;
            receiver.status = receiverStatus;
            receiver.vendorNum = vendor;
            receiver.vendorInvoiceNum = vendorInvoiceNum;
            receiver.orderDate = orderDate;
            receiver.receivedDate = receivedDate;
            receiver.shippingMethod = shippingMethod;
            receiver.terms = terms;
            receiver.createdBy = createdBy;
            receiver.shipToLocation = shipToLocation;
            receiver.receiverTableData = receiverTableData;
            return receiver.save();
          })
          .then((result) => {
            // for (let i = 0; i < receiverTableData.length; i++) {     original loop that only only updated duplicate item ids once...
            //   const itemID = receiverTableData[i].itemID;
            //   Item.findOne({ itemID: itemID }).then(item => {
            //     const selectedUOM = uoms.find(
            //       ({ name }) => name === receiverTableData[i].uom
            //     );
            //     console.log('line',receiverTableData[i].line, 'item qty', item.totalQtyOnHand);
            //     console.log('line',
            //       receiverTableData[i].line,
            //       'qty rec',
            //       +receiverTableData[i].qtyReceived * selectedUOM.conversionQty
            //     );
            //     // item.totalQtyOnHand =
            //     //   +item.totalQtyOnHand +
            //     //   +receiverTableData[i].qtyReceived * selectedUOM.conversionQty;
            //     // item.qtyOnOrder =
            //     //   +item.totalQtyOnHand -
            //     //   +receiverTableData[i].qtyReceived * selectedUOM.conversionQty;
            //       item.totalQtyOnHand = item.totalQtyOnHand + 1;
            //       item.qtyOnOrder = item.qtyOnOrder - 1;
            //     return item.save();
            //   })
            //   .catch((err) => {
            //     console.log(err);
            //   });
            // }

            // console.log(receiverTableData);
            const consolidatedLines = receiverTableData.map((item) => {
              const selectedUOM = uoms.find(({ name }) => name === item.uom);
              const line = {};
              line.itemID = item.itemID;
              line.qtyReceived = item.qtyReceived * selectedUOM.conversionQty;
              line.qtyOrdered = item.qtyOrdered * selectedUOM.conversionQty;
              line.cost = item.cost * item.qtyReceived;
              return line;
            });

            console.log(consolidatedLines);

            const consolLine2 = Object.values(
              consolidatedLines.reduce(
                (acc, { itemID, qtyReceived, qtyOrdered, cost }) => {
                  acc[itemID] = acc[itemID] || {
                    itemID,
                    qtysReceived: [],
                    qtysOrdered: [],
                    costs: [],
                  };
                  acc[itemID].qtysReceived.push(qtyReceived);
                  acc[itemID].qtysOrdered.push(qtyOrdered);
                  acc[itemID].costs.push(cost);
                  return acc;
                },
                {}
              )
            );
            console.log(consolLine2);

            const finalLines = consolLine2.map((item) => {
              const line = {};
              line.itemID = item.itemID;
              line.qtyReceived = item.qtysReceived
                .reduce((total, num) => {
                  return +total + +num;
                })
                .toString();
              line.qtyOrdered = item.qtysOrdered
                .reduce((total, num) => {
                  return +total + +num;
                })
                .toString();
              line.totalCost = item.costs
                .reduce((total, num) => {
                  return +total + +num;
                })
                .toString();
              return line;
            });
            console.log(finalLines);
            finalLines.forEach((line) => {
              Item.findOne({ itemID: line.itemID }).then((item) => {
                console.log(
                  'itemID',
                  item.itemID,
                  'qty on hand',
                  item.totalQtyOnHand
                );
                console.log(line.qtyReceived);
                // console.log('avg cost eq', '((', +item.totalQtyOnHand, '*', +item.avgCost,') + (',+line.totalCost,')) / (',+item.totalQtyOnHand, '+', +line.qtyReceived,')')
                item.avgCost =
                  (+item.totalQtyOnHand * +item.avgCost + +line.totalCost) /
                  (+item.totalQtyOnHand + +line.qtyReceived).toFixed(2);
                item.totalQtyOnHand = (
                  +item.totalQtyOnHand + +line.qtyReceived
                ).toString();
                item.qtyOnOrder = (
                  +item.qtyOnOrder - +line.qtyOrdered
                ).toString();
                return item.save();
              });
            });
          });
      })
      .then((result) => {
        console.log('POSTED Receiver');
        req.flash('message', `Receiver #${receiverNum} was posted!`);
        res.redirect(`/po/receiver/view/${receiverNum}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.getPrintPurchaseOrder = (req, res, next) => {
  const poNum = req.params.poNum;

  PurchaseOrder.findOne({ poNum: poNum })
    .then((po) => {
      const vendorNum = po.vendorNum;
      const orderDate = `${
        po.orderDate.getMonth() + 1
      }/${po.orderDate.getDate()}/${po.orderDate.getFullYear()}`;
      const expectedDate = `${
        po.expectedDate.getMonth() + 1
      }/${po.expectedDate.getDate()}/${po.expectedDate.getFullYear()}`;
      const shippingMethod = po.shippingMethod;
      const terms = po.terms;
      const shipToLocation = po.shipToLocation;
      const buyerName = po.createdBy;
      const poTableData = po.poTableData;

      Vendor.findOne({ name: vendorNum }).then((vendor) => {
        const vendorName = vendor.name;
        const vendorAddress = vendor.address;
        const vendorCity = vendor.city;
        const vendorState = vendor.state;
        const vendorZip = vendor.zip;

        Warehouse.findOne({ name: shipToLocation }).then((warehouse) => {
          const pdfDoc = new PDFDocument();
          res.setHeader('Content-Type', 'application/pdf');
          // Not using the pipe below because we're not saving copies to the server.
          // res.setHeader('Content-Disposition', 'inline filename="' + invoiceName + '"');
          // pdfDoc.pipe(fs.createWriteStream(invoicePath));
          pdfDoc.pipe(res);

          //Company Info
          pdfDoc
            .font('Helvetica-Bold')
            .fontSize(16)
            .text('Inventory Management Solutions', 50, 80);
          pdfDoc.fontSize(12).font('Helvetica').text('10000 Derby Ln SE');
          pdfDoc.text('Smyrna, GA 30082');
          pdfDoc.text('Phone: 407-698-6113');
          pdfDoc.text('Fax: 407-698-6119');
          pdfDoc.text('Website: www.customwebware/ims.com');
          pdfDoc.moveDown();

          //Invoice Info
          pdfDoc
            .font('Helvetica-Bold')
            .fontSize(25)
            .text('Purchase Order', 350, 70);
          pdfDoc
            .font('Helvetica')
            .fontSize(12)
            .text(`Order Date: ${orderDate}`, pdfDoc.x + 45, pdfDoc.y);
          pdfDoc.text(`Expected Date: ${expectedDate}`);
          // pdfDoc.text('PO #: ' + poNum);
          pdfDoc.text(`PO # ${poNum}`);
          pdfDoc.moveDown();
          pdfDoc.moveDown();
          pdfDoc.moveDown();

          // Draw bouding rectangle
          pdfDoc.rect(pdfDoc.x - 7, 95, 150, 45).stroke();

          //Vendor Info
          pdfDoc.font('Helvetica-Bold').text('VENDOR:', 50, pdfDoc.y + 20);
          pdfDoc.font('Helvetica').text(vendorNum);
          pdfDoc.text(vendorAddress);
          pdfDoc.text(`${vendorCity}, ${vendorState} ${vendorZip}`);

          pdfDoc.moveUp();
          pdfDoc.moveUp();
          pdfDoc.moveUp();
          pdfDoc.moveUp();

          //Ship to Info
          pdfDoc.font('Helvetica-Bold').text('SHIP TO:', 300, pdfDoc.y);
          pdfDoc.font('Helvetica').text(warehouse.name);
          pdfDoc.text(warehouse.address);
          pdfDoc.text(`${warehouse.city}, ${warehouse.state} ${warehouse.zip}`);
          pdfDoc.moveDown();
          pdfDoc.moveDown();
          pdfDoc.moveDown();

          //PO specLabels
          pdfDoc.moveUp();
          pdfDoc.text('BUYER', 70, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('SHIP METHOD', 150, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('TERMS', 260, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('ORDER DATE', 325, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('EXPECTED DATE', 425, pdfDoc.y);

          // Draw bouding rectangle
          pdfDoc.moveUp();
          pdfDoc.rect(45, pdfDoc.y - 5, 500, 19).stroke();

          //PO specDetails
          pdfDoc.moveDown();
          pdfDoc.moveDown();
          pdfDoc.text('Brandon Kunkel', 48, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text(shippingMethod, 151, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text(terms, 255, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text(orderDate, 340, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text(expectedDate, 455, pdfDoc.y);

          //PO Details
          pdfDoc.moveDown();
          pdfDoc.moveDown();
          pdfDoc.text('Item ID', 50, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('Description', pdfDoc.x + 50, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('QTY', pdfDoc.x + 225, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('UOM', pdfDoc.x + 50, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('Price', pdfDoc.x + 50, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('Extended', pdfDoc.x + 50, pdfDoc.y);
          pdfDoc.moveUp();

          // Draw bouding rectangle
          pdfDoc.rect(45, pdfDoc.y - 5, 500, 20).stroke();

          pdfDoc.moveDown();
          pdfDoc.moveDown();

          let poTotal = 0;

          poTableData.forEach((line) => {
            pdfDoc.text(line.itemID, 52, pdfDoc.y);
            pdfDoc.moveUp();
            pdfDoc.text(
              line.itemDescription.substr(0, 20),
              pdfDoc.x + 50,
              pdfDoc.y
            );
            pdfDoc.moveUp();
            pdfDoc.text(line.qtyOrdered, pdfDoc.x + 223, pdfDoc.y);
            pdfDoc.moveUp();
            pdfDoc.text(line.uom, pdfDoc.x + 48, pdfDoc.y);
            pdfDoc.moveUp();
            pdfDoc.text(line.cost, pdfDoc.x + 55, pdfDoc.y);
            pdfDoc.moveUp();
            pdfDoc.text(
              (line.qtyOrdered * line.cost).toFixed(2),
              pdfDoc.x + 55,
              pdfDoc.y
            );
            poTotal = poTotal + line.qtyOrdered * line.cost;
          });

          // Draw poTOTAL Line
          pdfDoc
            .moveTo(545, pdfDoc.y + 5)
            .lineTo(45, pdfDoc.y + 5)
            .stroke(5);
          pdfDoc.moveDown();

          pdfDoc.text(poTotal.toFixed(2), pdfDoc.x, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('TOTAL', pdfDoc.x - 45, pdfDoc.y);

          if (po.status === 'RECEIVED') {
            // RECEIVED ALERT MESSAGE
            pdfDoc.moveDown();
            pdfDoc
              .font('Helvetica-Bold')
              .fillColor('red')
              .fontSize(40)
              .text('RECEIVED', 195, pdfDoc.y + 20);
          }

          pdfDoc.end();
        });
      });
    })

    .catch((err) => {
      console.log(err);
    });
};

exports.getPrintReceiver = (req, res, next) => {
  const receiverNum = req.params.receiverNum;

  Receiver.findOne({ receiverNum: receiverNum })
    .then((receiver) => {
      const vendorNum = receiver.vendorNum;
      const orderDate = `${
        receiver.orderDate.getMonth() + 1
      }/${receiver.orderDate.getDate()}/${receiver.orderDate.getFullYear()}`;
      const receivedDate = `${
        receiver.receivedDate.getMonth() + 1
      }/${receiver.receivedDate.getDate()}/${receiver.receivedDate.getFullYear()}`;
      const shippingMethod = receiver.shippingMethod;
      const terms = receiver.terms;
      const shipToLocation = receiver.shipToLocation;
      const buyerName = receiver.createdBy;
      const receiverTableData = receiver.receiverTableData;

      Vendor.findOne({ name: vendorNum }).then((vendor) => {
        const vendorName = vendor.name;
        const vendorAddress = vendor.address;
        const vendorCity = vendor.city;
        const vendorState = vendor.state;
        const vendorZip = vendor.zip;

        Warehouse.findOne({ name: shipToLocation }).then((warehouse) => {
          const pdfDoc = new PDFDocument();
          res.setHeader('Content-Type', 'application/pdf');
          // Not using the pipe below because we're not saving copies to the server.
          // res.setHeader('Content-Disposition', 'inline filename="' + invoiceName + '"');
          // pdfDoc.pipe(fs.createWriteStream(invoicePath));
          pdfDoc.pipe(res);

          //Company Info
          pdfDoc
            .font('Helvetica-Bold')
            .fontSize(16)
            .text('Inventory Management Solutions', 50, 80);
          pdfDoc.fontSize(12).font('Helvetica').text('10000 Derby Ln SE');
          pdfDoc.text('Smyrna, GA 30082');
          pdfDoc.text('Phone: 407-698-6113');
          pdfDoc.text('Fax: 407-698-6119');
          pdfDoc.text('Website: www.customwebware/ims.com');
          pdfDoc.moveDown();

          //Invoice Info
          pdfDoc.font('Helvetica-Bold').fontSize(25).text('Receiver', 410, 55);
          pdfDoc.moveDown();
          pdfDoc
            .font('Helvetica')
            .fontSize(12)
            .text(`Order Date: ${orderDate}`, pdfDoc.x - 10, pdfDoc.y);
          pdfDoc.text(`Received Date: ${receivedDate}`);
          pdfDoc.text(`RECEIVER # ${receiverNum}`);
          pdfDoc.moveDown();
          pdfDoc.moveDown();
          pdfDoc.moveDown();

          // Draw bouding rectangle
          pdfDoc.rect(pdfDoc.x - 7, 105, 150, 55).stroke();

          //Vendor Info
          pdfDoc.font('Helvetica-Bold').text('VENDOR:', 50, pdfDoc.y + 20);
          pdfDoc.font('Helvetica').text(vendorNum);
          pdfDoc.text(vendorAddress);
          pdfDoc.text(`${vendorCity}, ${vendorState} ${vendorZip}`);

          pdfDoc.moveUp();
          pdfDoc.moveUp();
          pdfDoc.moveUp();
          pdfDoc.moveUp();

          //Ship to Info
          pdfDoc.font('Helvetica-Bold').text('SHIP TO:', 300, pdfDoc.y);
          pdfDoc.font('Helvetica').text(warehouse.name);
          pdfDoc.text(warehouse.address);
          pdfDoc.text(`${warehouse.city}, ${warehouse.state} ${warehouse.zip}`);
          pdfDoc.moveDown();
          pdfDoc.moveDown();
          pdfDoc.moveDown();

          //Receiver specLabels
          pdfDoc.moveUp();
          pdfDoc.text('BUYER', 70, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('SHIP METHOD', 150, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('TERMS', 260, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('ORDER DATE', 325, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('EXPECTED DATE', 425, pdfDoc.y);

          // Draw bouding rectangle
          pdfDoc.moveUp();
          pdfDoc.rect(45, pdfDoc.y - 5, 500, 19).stroke();

          //Receiver specDetails
          pdfDoc.moveDown();
          pdfDoc.moveDown();
          pdfDoc.text('Brandon Kunkel', 48, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text(shippingMethod, 151, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text(terms, 260, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text(orderDate, 340, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text(receivedDate, 455, pdfDoc.y);

          //Receiver Details
          pdfDoc.moveDown();
          pdfDoc.moveDown();
          pdfDoc.text('Item ID', 50, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('Description', 100, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('Ordered', 280, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('Received', 332, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('UOM', 395, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('Price', 443, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('Extended', 485, pdfDoc.y);
          pdfDoc.moveUp();

          // Draw bouding rectangle
          pdfDoc.rect(45, pdfDoc.y - 5, 500, 20).stroke();

          pdfDoc.moveDown();
          pdfDoc.moveDown();

          let receiverTotal = 0;

          receiverTableData.forEach((line) => {
            pdfDoc.text(line.itemID, 52, pdfDoc.y);
            pdfDoc.moveUp();
            pdfDoc.text(line.itemDescription.substr(0, 20), 100, pdfDoc.y);
            pdfDoc.moveUp();
            pdfDoc.text(line.qtyOrdered, 295, pdfDoc.y);
            pdfDoc.moveUp();
            pdfDoc.text(line.qtyReceived, 350, pdfDoc.y);
            pdfDoc.moveUp();
            pdfDoc.text(line.uom, 395, pdfDoc.y);
            pdfDoc.moveUp();
            pdfDoc.text(line.cost, 445, pdfDoc.y);
            pdfDoc.moveUp();
            pdfDoc.text(
              (line.qtyReceived * line.cost).toFixed(2),
              490,
              pdfDoc.y
            );
            receiverTotal = receiverTotal + line.qtyReceived * line.cost;
          });

          // Draw receiverTotal Line
          pdfDoc
            .moveTo(545, pdfDoc.y + 5)
            .lineTo(45, pdfDoc.y + 5)
            .stroke(5);
          pdfDoc.moveDown();

          pdfDoc.text(receiverTotal.toFixed(2), pdfDoc.x, pdfDoc.y);
          pdfDoc.moveUp();
          pdfDoc.text('TOTAL', pdfDoc.x - 45, pdfDoc.y);

          if (receiver.status === 'POSTED') {
            // RECEIVED ALERT MESSAGE
            pdfDoc.moveDown();
            pdfDoc
              .font('Helvetica-Bold')
              .fillColor('red')
              .fontSize(40)
              .text('POSTED', 195, pdfDoc.y + 20);
          }

          pdfDoc.end();
        });
      });
    })

    .catch((err) => {
      console.log(err);
    });
};
