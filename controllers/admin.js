// node library used to help validate fields
const { validationResult } = require('express-validator/check');

const Item = require('../models/item');

exports.getIndex = (req, res, next) => {
  res.render('./dashboard/index', {
    pageTitle: 'IMS Dashboard',
    mainMenuPath: 'dashboard',
  });
};

exports.getItems = (req, res, next) => {
  Item.find()
    .then((items) => {
      res.render('./dashboard/inventory/items', {
        items: items,
        pageTitle: 'Item List',
        mainMenuPath: 'inventory',
        subMenuPath: 'item-maintenance',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getItem = (req, res, next) => {
  let message = req.flash('createdMessage');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  const itemId = req.params.itemId;
  Item.findById(itemId)
    .then((item) => {
      res.render('./dashboard/inventory/item', {
        item: item,
        pageTitle: 'Item Profile',
        mainMenuPath: 'inventory',
        subMenuPath: 'item-maintenance',
        message: message,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.searchItemByNewID = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(422).render('dashboard/inventory/item-maintenance', {
      pageTitle: 'Item Maintenance',
      mainMenuPath: 'inventory',
      subMenuPath: 'item-maintenance',
      errorMessage: errors.array()[0].msg,
      oldInput: { itemID: req.body.itemID },
      validationErrors: errors.array(),
    });
  }

  if (req.body.itemID === '') {
    res.redirect('../../item-maintenance');
  } else {
    Item.findOne({ itemID: req.body.itemID }).then((item) => {
      if (item === null) {
        const string = encodeURIComponent(req.body.itemID);
        res.redirect('../../add-item/?newItemID=' + string);
      } else {
        res.redirect(`/inventory/item/${item._id}`);
      }
    });
  }
};

exports.getItemMaintenance = (req, res, next) => {
  res.render('dashboard/inventory/item-maintenance', {
    pageTitle: 'Item Maintenance',
    mainMenuPath: 'inventory',
    subMenuPath: 'item-maintenance',
    errorMessage: null,
  });
};

exports.getAddItem = (req, res, next) => {
  res.render('dashboard/inventory/add-item', {
    pageTitle: 'Add Item',
    mainMenuPath: 'inventory',
    subMenuPath: 'add-item',
    newItemID: req.query.newItemID,
    errorMessage: null,
    oldInput: { itemID: '' },
    validationErrors: [],
  });
};

exports.postAddItem = (req, res, next) => {
  const itemID = req.body.itemID;
  const itemStatus = req.body.itemStatus;
  const description = req.body.description;
  const category = req.body.category;
  const valuationMethod = req.body.valuationMethod;
  const type = req.body.type;
  const defaultWarehouse = req.body.defaultWarehouse;
  const baseUOM = req.body.baseUOM;
  const salesUOM = req.body.salesUOM;
  const purchaseUOM = req.body.purchaseUOM;
  const defaultPrice = req.body.defaultPrice;
  const totalQtyOnHand = 0;

  const errors = validationResult(req);
  console.log(errors);
  if (!errors.isEmpty()) {
    return res.status(422).render('dashboard/inventory/add-item', {
      pageTitle: 'Add Item',
      mainMenuPath: 'inventory',
      subMenuPath: 'add-item',
      newItemID: itemID,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        itemID: itemID,
        itemStatus: itemStatus,
        description: description,
        category: category,
        valuationMethod: valuationMethod,
        type: type,
        defaultWarehouse: defaultWarehouse,
        baseUOM: baseUOM,
        salesUOM: salesUOM,
        purchaseUOM: purchaseUOM,
        defaultPrice: defaultPrice,
      },
      validationErrors: errors.array(),
    });
    console.log(oldInput)
  }
  
  // if (itemID && itemStatus && description && category && valuationMethod && type && defaultWarehouse && baseUOM && salesUOM && purchaseUOM && defaultPrice)
  if (!itemID) {
    console.log('Missing item info!');
    res.redirect('/inventory/add-item');
    // } else if (Item.findDuplicateID(itemID)) {
    //   console.log('duplicate itemID!');
    //   res.redirect('/inventory/add-item');
  } else {
    const item = new Item({
      itemID: itemID,
      itemStatus: itemStatus,
      description: description,
      category: category,
      valuationMethod: valuationMethod,
      type: type,
      defaultWarehouse: defaultWarehouse,
      baseUOM: baseUOM,
      salesUOM: salesUOM,
      purchaseUOM: purchaseUOM,
      defaultPrice: defaultPrice,
      totalQtyOnHand: totalQtyOnHand,
      userId: req.session.user.email,
    });
    item
      .save()
      .then((result) => {
        console.log('Created Item');
        req.flash('createdMessage', 'Item was created!');
        res.redirect(`/inventory/item/${item._id}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

// dont this we need to add this since we update directly on item page.
// exports.getEditItem = (req, res, next) => {
//   res.render('dashboard/inventory/edit-item', {
//     pageTitle: 'Edit Item',
//     mainMenuPath: 'inventory',
//     subMenuPath: 'item-maintenance',
//   });
// };

// saves changes made to existing item on item page
exports.postUpdateItem = (req, res, next) => {
  const itemID = req.body.itemID;
  const itemStatus = req.body.itemStatus;
  const description = req.body.description;
  const category = req.body.category;
  const valuationMethod = req.body.valuationMethod;
  const type = req.body.type;
  const defaultWarehouse = req.body.defaultWarehouse;
  const baseUOM = req.body.baseUOM;
  const salesUOM = req.body.salesUOM;
  const purchaseUOM = req.body.purchaseUOM;
  const defaultPrice = req.body.defaultPrice;
  const totalQtyOnHand = req.body.totalQtyOnHand;
  const userId = req.body.userId;
  const id = req.body._id;

  Item.findById(id)
    .then((item) => {
      item.itemID = itemID;
      item.itemStatus = itemStatus;
      item.description = description;
      item.category = category;
      item.valuationMethod = valuationMethod;
      item.type = type;
      item.defaultWarehouse = defaultWarehouse;
      item.baseUOM = baseUOM;
      item.salesUOM = salesUOM;
      item.purchaseUOM = purchaseUOM;
      item.defaultPrice = defaultPrice;
      item.totalQtyOnHand = totalQtyOnHand;
      item.userId = userId;
      return item.save();
      console.log('item');
    })
    .then((result) => {
      console.log('item updated');
      res.redirect(`/inventory/item/${id}`);
    })
    .catch((err) => {
      console.log(err);
    });
};

// displays previous item in the item list via arrow buttons on item profile page
exports.getPreviousItem = (req, res, next) => {
  if (req.params.itemId === 'empty') {
    Item.find().then((items) => {
      const lastItemIndex = items.length - 1;
      res.redirect(`/inventory/item/${items[lastItemIndex]._id}`);
    });
  } else {
    let idList = [];
    Item.find()
      .then((items) => {
        for (itemId of items) {
          idList.push(itemId.itemID);
        }
        itemId = req.params.itemId;
        const currentItemIndex = idList.indexOf(itemId);
        const previousItemIndex = currentItemIndex - 1;
        const lastItemIndex = items.length - 1;
        if (currentItemIndex === 0) {
          return items[lastItemIndex]._id;
        } else {
          return items[previousItemIndex]._id;
        }
      })
      .then((result) => {
        res.redirect(`/inventory/item/${result}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

// displays next item in the item list via arrow buttons on item profile page
exports.getNextItem = (req, res, next) => {
  if (req.params.itemId === 'empty') {
    Item.find().then((items) => {
      res.redirect(`/inventory/item/${items[0]._id}`);
    });
  } else {
    let idList = [];
    Item.find()
      .then((items) => {
        for (itemId of items) {
          idList.push(itemId.itemID);
        }
        itemId = req.params.itemId;
        const currentItemIndex = idList.indexOf(itemId);
        const nextItemIndex = currentItemIndex + 1;
        const lastItemIndex = items.length - 1;
        if (currentItemIndex === lastItemIndex) {
          return items[0]._id;
        } else {
          return items[nextItemIndex]._id;
        }
      })
      .then((result) => {
        res.redirect(`/inventory/item/${result}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.getInventory = (req, res, next) => {
  res.render('dashboard/inventory', {
    pageTitle: 'Inventory',
    mainMenuPath: 'inventory',
    subMenuPath: '',
  });
};

exports.getSalesOrder = (req, res, next) => {
  res.render('dashboard/sales-order', {
    pageTitle: 'Sales Orders',
    mainMenuPath: 'salesOrders',
    subMenuPath: '',
  });
};

exports.getPurchaseOrder = (req, res, next) => {
  res.render('dashboard/purchase-order', {
    pageTitle: 'Purchase Orders',
    mainMenuPath: 'purchaseOrders',
    subMenuPath: '',
  });
};

exports.getReports = (req, res, next) => {
  res.render('dashboard/reports', {
    pageTitle: 'Reports',
    mainMenuPath: 'reports',
    subMenuPath: '',
  });
};

exports.getSysconfig = (req, res, next) => {
  res.render('dashboard/sysconfig', {
    pageTitle: 'Sysconfig',
    mainMenuPath: 'sysConfig',
    subMenuPath: '',
  });
};

exports.getWarehouseSetup = (req, res, next) => {
  res.render('dashboard/inventory/warehouse-setup', {
    pageTitle: 'Warehouse Setup',
    mainMenuPath: 'inventory',
    subMenuPath: 'warehouseSetup',
  });
};

// router.get('/transfer-item', adminController.getTransferItem);

// router.post('/transfer-item', adminController.postTransferItem);

// router.get('/adjust-item', adminController.getAdjustItem);

// router.post('/adjust-item', adminController.postAdjustItem);

// router.get('/purchase-item', adminController.getPurchaseItem);

// router.post('/purchase-item', adminController.postPurchaseItem);

// router.get('/invoice-item', adminController.getInvoiceItem);

// router.post('/invoice-item', adminController.postInvoiceItem);

// router.get('/bill-of-materials', adminController.getBOM);

// router.post('/bill-of-materials', adminController.postBOM);
