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
                const lastPoNum = poList[poList.length - 1].poNum;
                console.log(poList[poList.length - 1].poNum);
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
  const orderDate = req.body.orderDate;
  const expectedDate = req.body.expectedDate;
  const shippingMethod = req.body.shippingMethod;
  const terms = req.body.terms;
  const createdBy = req.body.createdBy;
  const shipToLocation = req.body.shipToLocation;
  const poTableData = JSON.parse(req.body.poTableData);

  console.log('poTableData', poTableData);

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
      console.log('item', item);
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

  PurchaseOrder.findById(id)
    .then((po) => {
      po.vendorNum = vendor;
      po.orderDate = orderDate;
      po.expectedDate = expectedDate;
      po.shippingMethod = shippingMethod;
      po.terms = terms;
      po.createdBy = createdBy;
      po.shipToLocation = shipToLocation;
      po.poTableData = poTableData;
      console.log(poTableData);
      return po.save();
    })
    .then((result) => {
      console.log('Updated Purchase Order');
      req.flash('updatedMessage', 'PO was updated!');
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
        res.redirect(`/po/view/${poList[0].poNum}`);
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
        res.redirect(`/po/view/${poList[lastIndexPO - 1].poNum}`);
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

  Receiver.find()
    .then((receiverList) => {
      const receiverNums = receiverList.map((receiver) => receiver.receiverNum);
      if (receiverNums.includes(poNum)) {
        console.log('receiver exists');
        res.redirect(`/po/view/${poNum}`);
      } else {
        PurchaseOrder.deleteOne({ _id: ID })
          .then(() => {
            console.log('DESTROYED PO', poNum);
            return res.redirect('/po');
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

// loads blank receiver
exports.getBlankReciever = (req, res, next) => {
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
                          poOrderDate: orderDate,
                          poExpectedDate: expectedDate,
                          receiverStatus: 'new',
                          uomList: uomList,
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
  console.log('created receiver');
  const receiverNum = req.body.poNum;
  const vendor = req.body.vendor;
  const vendorInvoiceNum = req.body.vendorInvoiceNum;
  const orderDate = req.body.orderDate;
  console.log('saved orderdate', orderDate);
  const receivedDate = req.body.receivedDate;
  console.log('saved received date', receivedDate);
  const shippingMethod = req.body.shippingMethod;
  const terms = req.body.terms;
  const createdBy = req.body.createdBy;
  const shipToLocation = req.body.shipToLocation;
  const receiverTableData = JSON.parse(req.body.receiverTableData);

  console.log('receiverTableData', receiverTableData);

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
  });
  receiver
    .save()
    .then((result) => {
      console.log('Created Receiver');
      req.flash('createdMessage', 'Receiver was created!');
      res.redirect(`/po/receiver/view/${receiverNum}`);
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/500');
    });
};

exports.getExistingReceiver = (req, res, next) => {
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
  console.log(req.body);
  const id = req.body.id;
  const receiverNum = req.body.receiverNum;
  const receiverStatus = req.body.receiverStatus;
  const vendor = req.body.vendor;
  const vendorInvoiceNum = req.body.vendorInvoiceNum;
  const orderDate = req.body.orderDate;
  const receivedDate = req.body.receivedDate;
  console.log(receivedDate);
  const shippingMethod = req.body.shippingMethod;
  const terms = req.body.terms;
  const createdBy = req.body.createdBy;
  const shipToLocation = req.body.shipToLocation;
  const receiverTableData = JSON.parse(req.body.receiverTableData);

  Receiver.findById(id)
    .then((receiver) => {
      console.log('receiver', receiver);
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
      req.flash('updatedMessage', 'Receiver was updated!');
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
    console.log('cannot delete posted purchase order!');
    res.redirect(`/po/receiver/view/${receiverNum}`);
  } else {
    Receiver.deleteOne({ _id: ID })
      .then(() => {
        console.log('DESTROYED RECEIVER', receiverNum);
        return res.redirect('/po/receiver/view/');
      })
      .catch((err) => console.log(err));
  }
};

exports.getNextReceiver = (req, res, next) => {
  if (req.params.receiverNum === 'empty') {
    Receiver.find()
      .then((receiverList) => {
        res.redirect(`/po/receiver/view/${receiverList[0].receiverNum}`);
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
        res.redirect(
          `/po/receiver/view/${receiverList[lastIndexReceiver - 1].receiverNum}`
        );
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
  if (req.body.receiverStatus !== 'POSTED') {
    console.log('Receiver is already posted!');
    req.flash('updatedMessage', 'Receiver is already posted!');
    res.redirect(`/po/receiver/view/${receiverNum}`);
  } else {
    const id = req.body.id;
    const receiverStatus = 'POSTED';
    const vendor = req.body.vendor;
    const vendorInvoiceNum = req.body.vendorInvoiceNum;
    const orderDate = req.body.orderDate;
    const receivedDate = req.body.receivedDate;
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
              const selectedUOM = uoms.find(
                ({ name }) => name === item.uom
                );
              const line = {};
              line.itemID = item.itemID;
              line.qtyReceived = item.qtyReceived * selectedUOM.conversionQty;
              line.cost = item.cost * item.qtyReceived;
              return line;
            });

            console.log(consolidatedLines);

            const consolLine2 = Object.values(
              consolidatedLines.reduce((acc, { itemID, qtyReceived, cost }) => {
                acc[itemID] = acc[itemID] || { itemID, qtysReceived: [], costs: [] };
                acc[itemID].qtysReceived.push(qtyReceived);
                acc[itemID].costs.push(cost);
                return acc;
              }, {})
            );
            console.log(consolLine2);

              const finalLines = consolLine2.map(item => {
                const line = {};
                line.itemID = item.itemID;
                line.qtyReceived = item.qtysReceived.reduce((total, num) => {return +total + +num;}).toString();
                line.totalCost = item.costs.reduce((total, num) => {return +total + +num;}).toString();
                return line;
              });
              console.log(finalLines);
              finalLines.forEach((line) => {
                Item.findOne({ itemID: line.itemID }).then(item => {
                  console.log('itemID', item.itemID, 'qty on hand', item.totalQtyOnHand);
                  console.log(line.qtyReceived)
                  // console.log('avg cost eq', '((', +item.totalQtyOnHand, '*', +item.avgCost,') + (',+line.totalCost,')) / (',+item.totalQtyOnHand, '+', +line.qtyReceived,')')
                  item.avgCost = ((+item.totalQtyOnHand * +item.avgCost) + (+line.totalCost)) / (+item.totalQtyOnHand + +line.qtyReceived).toFixed(2);
                  item.totalQtyOnHand = (+item.totalQtyOnHand + +line.qtyReceived).toString();
                  item.qtyOnOrder = (+item.qtyOnOrder - +line.qtyReceived).toString();
                  return item.save();
                })
              })
          });
      })
      .then((result) => {
        console.log('POSTED Receiver');
        req.flash('updatedMessage', 'Receiver was posted!');
        res.redirect(`/po/receiver/view/${receiverNum}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
