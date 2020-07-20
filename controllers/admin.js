const Item = require('../models/item');

exports.getIndex = (req, res, next) => {
  res.render('./dashboard/index', {
    loggedIn: req.session.loggedIn,
    userEmail: req.session.user.email,
    pageTitle: 'IMS Dashboard',
    mainMenuPath: 'dashboard',
  });
};

exports.getItems = (req, res, next) => {
  Item.fetchAll()
    .then((items) => {
      res.render('./dashboard/inventory/items', {
        loggedIn: req.session.loggedIn,
        userEmail: req.session.user.email,
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
  const itemId = req.params.itemId;
  Item.findById(itemId)
    .then((item) => {
      res.render('./dashboard/inventory/item', {
        loggedIn: req.session.loggedIn,
        userEmail: req.session.user.email,
        item: item,
        pageTitle: 'Item Profile',
        mainMenuPath: 'inventory',
        subMenuPath: 'item-maintenance',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.searchItemByNewID = (req, res, next) => {
  if (req.body.itemID === '') {
    res.redirect('../../item-maintenance');
  } else {
    Item.findByIdSecondID(req.body.itemID).then((result) => {
      if (result === null) {
        const string = encodeURIComponent(req.body.itemID);
        res.redirect('../../add-item/?newItemID=' + string);
      } else {
        Item.fetchAll().then((items) => {
          const itemID2 = req.body.itemID;
          const result = items.find(({ itemID }) => itemID === itemID2);
          res.redirect(`/inventory/item/${result._id}`);
        });
      }
    });
  }
};

exports.getItemMaintenance = (req, res, next) => {
  res.render('dashboard/inventory/item-maintenance', {
    loggedIn: req.session.loggedIn,
    userEmail: req.session.user.email,
    pageTitle: 'Item Maintenance',
    mainMenuPath: 'inventory',
    subMenuPath: 'item-maintenance',
  });
};

exports.getAddItem = (req, res, next) => {
  res.render('dashboard/inventory/add-item', {
    loggedIn: req.session.loggedIn,
    userEmail: req.session.user.email,
    pageTitle: 'Add Item',
    mainMenuPath: 'inventory',
    subMenuPath: 'add-item',
    newItemID: req.query.newItemID,
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
  // if (itemID && itemStatus && description && category && valuationMethod && type && defaultWarehouse && baseUOM && salesUOM && purchaseUOM && defaultPrice)
  if (!itemID) {
    console.log('Missing item info!');
    res.redirect('/inventory/add-item');
    // } else if (Item.findDuplicateID(itemID)) {
    //   console.log('duplicate itemID!');
    //   res.redirect('/inventory/add-item');
  } else {
    const item = new Item(
      itemID,
      itemStatus,
      description,
      category,
      valuationMethod,
      type,
      defaultWarehouse,
      baseUOM,
      salesUOM,
      purchaseUOM,
      defaultPrice,
      totalQtyOnHand,
      req.user._id
    );
    item
      .save()
      .then((result) => {
        // console.log(result);
        console.log('Created Item');
        res.redirect(`/inventory/item/${item._id}`);
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.getEditItem = (req, res, next) => {
  res.render('dashboard/inventory/edit-item', {
    loggedIn: req.session.loggedIn,
    userEmail: req.session.user.email,
    pageTitle: 'Edit Item',
    mainMenuPath: 'inventory',
    subMenuPath: 'item-maintenance',
  });
};

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

  const item = new Item(
    itemID,
    itemStatus,
    description,
    category,
    valuationMethod,
    type,
    defaultWarehouse,
    baseUOM,
    salesUOM,
    purchaseUOM,
    defaultPrice,
    totalQtyOnHand,
    userId,
    id
  );
  item
    .save()
    .then((result) => {
      res.redirect(`/inventory/item/${item._id}`);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getPreviousItem = (req, res, next) => {
  if (req.params.itemId === 'empty') {
    Item.fetchAll().then((items) => {
      const lastItemIndex = items.length - 1;
      res.redirect(`/inventory/item/${items[lastItemIndex]._id}`);
    });
  } else {
    let idList = [];
    Item.fetchAll()
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

exports.getNextItem = (req, res, next) => {
  if (req.params.itemId === 'empty') {
    Item.fetchAll().then((items) => {
      res.redirect(`/inventory/item/${items[0]._id}`);
    });
  } else {
    let idList = [];
    Item.fetchAll()
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
    loggedIn: req.session.loggedIn,
    userEmail: req.session.user.email,
    pageTitle: 'Inventory',
    mainMenuPath: 'inventory',
    subMenuPath: '',
  });
};

exports.getSalesOrder = (req, res, next) => {
  res.render('dashboard/sales-order', {
    loggedIn: req.session.loggedIn,
    userEmail: req.session.user.email,
    pageTitle: 'Sales Orders',
    mainMenuPath: 'salesOrders',
    subMenuPath: '',
  });
};

exports.getPurchaseOrder = (req, res, next) => {
  res.render('dashboard/purchase-order', {
    loggedIn: req.session.loggedIn,
    userEmail: req.session.user.email,
    pageTitle: 'Purchase Orders',
    mainMenuPath: 'purchaseOrders',
    subMenuPath: '',
  });
};

exports.getReports = (req, res, next) => {
  res.render('dashboard/reports', {
    loggedIn: req.session.loggedIn,
    userEmail: req.session.user.email,
    pageTitle: 'Reports',
    mainMenuPath: 'reports',
    subMenuPath: '',
  });
};

exports.getSysconfig = (req, res, next) => {
  res.render('dashboard/sysconfig', {
    loggedIn: req.session.loggedIn,
    userEmail: req.session.user.email,
    pageTitle: 'Sysconfig',
    mainMenuPath: 'sysConfig',
    subMenuPath: '',
  });
};

exports.getWarehouseSetup = (req, res, next) => {
  res.render('dashboard/inventory/warehouse-setup', {
    loggedIn: req.session.loggedIn,
    userEmail: req.session.user.email,
    pageTitle: 'Warehouse Setup',
    mainMenuPath: 'inventory',
    subMenuPath: 'warehouseSetup',
  });
};

// router.get('/', adminController.getIndex);

// router.get('/items', adminController.getItems);

// router.get('/item/:itemId', adminController.getItem);

// router.get('/add-item', adminController.getAddItem);

// router.post('/add-item', adminController.postAddItem);

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
