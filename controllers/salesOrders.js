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

// below are two helper functions to convert the uom converstion qty when updating item info
UOM.find().then((uomList) => {
  UOMLIST = uomList;
});

function UOMQty(uomName) {
  const match = UOMLIST.find((x) => x.name === uomName);
  return match.conversionQty;
}

exports.getSalesOrder = (req, res, next) => {
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

  SalesOrder.find()
    .then((soList) => {
      res.render('salesOrder/sales-order-blank', {
        pageTitle: 'Sales Orders',
        mainMenuPath: 'salesOrders',
        subMenuPath: '',
        soList: soList,
        errorMessage: error,
        message: message
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getNewSalesOrder = (req, res, next) => {
  res.render('salesOrder/sales-order-new', {
    pageTitle: 'Sales Orders',
    mainMenuPath: 'salesOrders',
    subMenuPath: '',
    soList: [],
    soDetails: [],
  });
};

exports.getNewSalesOrder = (req, res, next) => {
  Item.find()
    .then((itemList) => {
      Customer.find().then((customerList) => {
        Warehouse.find().then((warehouseList) => {
          PaymentTerm.find().then((paymentTermList) => {
            ShippingMethod.find().then((shippingMethodList) => {
              SalesOrder.find().then((soList) => {
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
  console.log(customerPoNum);
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
  // const poTableData = JSON.parse(req.body.poTableData);
  const soTableData = JSON.parse(req.body.soTableData);
  let UOMLIST;

  UOM.find().then((uomList) => {
    UOMLIST = uomList;
  });

  function UOMQty(uomName) {
    const match = UOMLIST.find((x) => x.name === uomName);
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
          item.qtyAllocated =
            +item.qtyAllocated + +line.qtyOrdered * UOMQty(line.uom);
          return item.save();
        });
      });
    })
    .then((result) => {
      console.log('Created Sales Order');
      req.flash('message', 'New Sales Order was created!');
      res.redirect(`/so/view/${soNum}`);
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/500');
    });
};

exports.getExistingSalesOrder = (req, res, next) => {
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

  const soNum = req.params.soNum;
  UOM.find()
    .then((uomList) => {
      Item.find().then((itemList) => {
        Customer.find().then((customerList) => {
          Warehouse.find().then((warehouseList) => {
            PaymentTerm.find().then((paymentTermList) => {
              ShippingMethod.find().then((shippingMethodList) => {
                SalesOrder.findOne({ soNum: soNum }).then((so) => {
                  SalesOrder.find().then((soList) => {
                    const formatOrderDate = new Date(so.orderDate);
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
                    const formatExpectedDate = new Date(so.expectedDate);
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

                    res.render('salesOrder/sales-order-view', {
                      pageTitle: 'View Sales Orders',
                      mainMenuPath: 'salesOrders',
                      subMenuPath: 'viewSO',
                      newSONumber: so.soNum,
                      createdBy: so.createdBy,
                      shippingMethodList: shippingMethodList,
                      paymentTermList: paymentTermList,
                      warehouseList: warehouseList,
                      customerList: customerList,
                      itemList: itemList,
                      soDetails: so,
                      soList: soList,
                      soOrderDate: orderDate,
                      soExpectedDate: expectedDate,
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

exports.postUpdateSO = (req, res, next) => {
  const id = req.body.id;
  const soNum = req.body.soNum;
  const soStatus = req.body.soStatus;
  const customer = req.body.customer;
  const customerPoNum = req.body.customerPoNum;
  const orderDate = req.body.orderDate;
  const expectedDate = req.body.expectedDate;
  const shippingMethod = req.body.shippingMethod;
  const terms = req.body.terms;
  const createdBy = req.body.createdBy;
  const shipToLocation = req.body.shipToLocation;
  const soTableData = JSON.parse(req.body.soTableData);
  const soTableDataOriginal = JSON.parse(req.body.soTableData);
  const itemOriginalQty = [];
  const itemNewQty = [];

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

  SalesOrder.findById(id)
    .then((so) => {
      so.soTableData.forEach((line) => {
        itemOriginalQty.push({
          itemID: line.itemID,
          qtyOriginallyOrdered: line.qtyOrdered * UOMQty(line.uom),
        });
      });
      console.log('itemOriginalQty', itemOriginalQty);

      so.customerNum = customer;
      so.customerPoNum = customerPoNum;
      so.orderDate = new Date(
        orderDate.split('-')[0],
        orderDate.split('-')[1] - 1,
        orderDate.split('-')[2]
      );
      so.expectedDate = new Date(
        expectedDate.split('-')[0],
        expectedDate.split('-')[1] - 1,
        expectedDate.split('-')[2]
      );
      so.shippingMethod = shippingMethod;
      so.terms = terms;
      so.createdBy = createdBy;
      so.shipToLocation = shipToLocation;
      console.log('oldPoTableData', so.soTableData);
      so.soTableData = soTableData;
      console.log('newSoTableData', soTableData);

      return so.save();
    })
    .then((result) => {
      soTableData.forEach((line) => {
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
            console.log('item', item.itemID, 'qtyAllocated', item.qtyAllocated);
            item.qtyAllocated = item.qtyAllocated + el.diffQty;
            console.log('item', item.itemID, 'qtyAllocated', item.qtyAllocated);
            return item.save();
          })
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .then((result) => {
      console.log('Updated Sales Order');
      req.flash('message', 'SO was updated!');
      res.redirect(`/so/view/${soNum}`);
    })
    .catch((err) => {
      console.log(err);
      res.redirect('/500');
    });
};

exports.getNextSalesOrder = (req, res, next) => {
  if (req.params.soNum === 'empty') {
    SalesOrder.find()
      .then((soList) => {
        if (soList[0].soNum) {
          res.redirect(`/so/view/${soList[0].soNum}`);
        } else {
          res.redirect('/so');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    let soList = [];
    SalesOrder.find()
      .then((SOs) => {
        for (so of SOs) {
          soList.push(so.soNum);
        }
        console.log(soList);
        soNum = req.params.soNum;
        const currentSOIndex = soList.indexOf(soNum);
        const nextSOIndex = currentSOIndex + 1;
        const lastSOIndex = soList.length - 1;
        if (currentSOIndex === lastSOIndex) {
          return soList[0];
        } else {
          return soList[nextSOIndex];
        }
      })
      .then((result) => {
        res.redirect(`/so/view/${result}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.getPreviousSalesOrder = (req, res, next) => {
  if (req.params.soNum === 'empty') {
    SalesOrder.find()
      .then((soList) => {
        const lastIndexSO = soList.length;
        if (soList[lastIndexSO - 1].soNum) {
          res.redirect(`/so/view/${soList[lastIndexSO - 1].soNum}`);
        } else {
          res.redirect(`/so`);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    let soList = [];
    SalesOrder.find()
      .then((SOs) => {
        for (so of SOs) {
          soList.push(so.soNum);
        }
        soNum = req.params.soNum;
        const currentSOIndex = soList.indexOf(soNum);
        const previousSOIndex = currentSOIndex - 1;
        const lastSOIndex = soList.length - 1;
        if (currentSOIndex === 0) {
          return soList[lastSOIndex];
        } else {
          return soList[previousSOIndex];
        }
      })
      .then((result) => {
        res.redirect(`/so/view/${result}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.postDeleteSalesOrder = (req, res, next) => {
  const soNum = req.body.soNum;
  const ID = req.body.id;

  UOM.find().then((uomList) => {
    UOMLIST = uomList;
  });

  function UOMQty(uomName) {
    const match = UOMLIST.find((x) => x.name === uomName);
    return match.conversionQty;
  }

  SalesOrder.findOne({ _id: ID })
    .then((so) => {
      console.log('so for deletion', so);
      so.soTableData.forEach((line) => {
        Item.findOne({ itemID: line.itemID })
          .then((item) => {
            item.qtyAllocated =
              +item.qtyAllocated - +line.qtyOrdered * UOMQty(line.uom);
            return item.save();
          })
          .then((result) => {})
          .catch((err) => {
            console.log(err);
          });
      });
    })
    .then((result) => {
      SalesOrder.deleteOne({ _id: ID })
        .then(() => {
          console.log('DESTROYED SO', soNum);
          req.flash('message', 'SO was deleted!');
          return res.redirect('/so');
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postSalesOrder = (req, res, next) => {
  const soNum = req.body.soNum;
  if (req.body.soStatus === 'POSTED') {
    console.log('Sales Order is already posted!');
    req.flash('message', 'Sales Order is already posted!');
    res.redirect(`/so/view/${soNum}`);
  } else {
    const id = req.body.id;
    const salesOrderStatus = 'POSTED';
    const customer = req.body.customer;
    const customerPoNum = req.body.customerPoNum;
    const date = `${req.body.orderDate}`;
    const orderDate = new Date(
      date.split('-')[0],
      date.split('-')[1] - 1,
      date.split('-')[2]
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
    const soTableData = JSON.parse(req.body.soTableData);

    UOM.find()
      .then((uoms) => {
        SalesOrder.findById(id)
          .then((so) => {
            so.soNum = soNum;
            so.status = salesOrderStatus;
            so.customerNum = customer;
            so.customerPoNum = customerPoNum;
            so.orderDate = orderDate;
            so.expectedDate = expectedDate;
            so.shippingMethod = shippingMethod;
            so.terms = terms;
            so.createdBy = createdBy;
            so.shipToLocation = shipToLocation;
            so.soTableData = soTableData;
            return so.save();
          })
          .then((result) => {
            const consolidatedLines = soTableData.map((item) => {
              const selectedUOM = uoms.find(({ name }) => name === item.uom);
              const line = {};
              line.itemID = item.itemID;
              line.qtyOrdered = item.qtyOrdered * selectedUOM.conversionQty;
              line.cost = item.cost * item.qtyOrdered;
              return line;
            });

            console.log(consolidatedLines);

            const consolLine2 = Object.values(
              consolidatedLines.reduce((acc, { itemID, qtyOrdered, cost }) => {
                acc[itemID] = acc[itemID] || {
                  itemID,
                  qtysReceived: [],
                  costs: [],
                };
                acc[itemID].qtysReceived.push(qtyOrdered);
                acc[itemID].costs.push(cost);
                return acc;
              }, {})
            );
            console.log(consolLine2);

            const finalLines = consolLine2.map((item) => {
              const line = {};
              line.itemID = item.itemID;
              line.qtyOrdered = item.qtysReceived
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
                console.log(line.qtyOrdered);
                // console.log('avg cost eq', '((', +item.totalQtyOnHand, '*', +item.avgCost,') + (',+line.totalCost,')) / (',+item.totalQtyOnHand, '+', +line.qtyOrdered,')')
                item.avgCost =
                  (+item.totalQtyOnHand * +item.avgCost + +line.totalCost) /
                  (+item.totalQtyOnHand + +line.qtyOrdered).toFixed(2);
                item.totalQtyOnHand = (
                  +item.totalQtyOnHand + +line.qtyOrdered
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
        console.log('POSTED Sales Order');
        req.flash('message', 'Sales Order was posted!');
        res.redirect(`/so/view/${soNum}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
