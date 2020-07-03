const Item = require('../models/item');

exports.getIndex = (req, res, next) => {
  res.render('./dashboard/index', {
    pageTitle: 'IMS Dashboard',
  });
};

exports.getItems = (req, res, next) => {
  Item.fetchAll()
    .then((items) => {
      res.render('./dashboard/inventory/items', {
        items: items,
        pageTitle: 'Item List',
        path: '/items',
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
        item: item,
        pageTitle: 'Item Profile',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getItemByNewID = (req, res, next) => {
  const itemID = req.params.itemID;
  console.log(itemID);
  Item.findByIdSecondID(itemID)
    .then((item) => {
      res.render('./dashboard/inventory/item', {
        item: item,
        pageTitle: 'Item Profile',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getItemMaintenance = (req, res, next) => {
  res.render('dashboard/inventory/item-maintenance', {
    pageTitle: 'Item Maintenance',
    path: 'dashboard/inventory/item-maintenance',
    editing: false,
  });
};

exports.getAddItem = (req, res, next) => {
  res.render('dashboard/inventory/add-item', {
    pageTitle: 'Add Item',
    path: '/dashboard/add-item/',
    editing: false,
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
  } else if (Item.findDuplicateID(itemID)) {
    console.log('duplicate itemID!');
    res.redirect('/inventory/add-item');
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
      totalQtyOnHand
    );
    item
      .save()
      .then((result) => {
        // console.log(result);
        console.log('Created Item');
        res.redirect('/inventory/');
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

exports.getEditItem = (req, res, next) => {
  res.render('dashboard/inventory/edit-item', {
    pageTitle: 'Edit Item',
    path: '/dashboard/edit-item',
    editing: false,
  });
};

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
    totalQtyOnHand
  );
  item
    .save()
    .then((result) => {
      console.log(result);
      console.log('Updated Item');
      res.redirect(`/inventory/item/${item._id}`);
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getPreviousItem = (req, res, next) => {
  let itemId;
  itemId = req.params.itemId;
  // if (req.params.itemId == undefined) {
  //   itemId = Item.fetchAll().then((items) => {
  //     items[0]._id;
  //     console.log(itemId);
  //   });
  // } else {
  //   itemId = req.params.itemId;
  // }
  let idList = [];
  Item.fetchAll().then((items) => {
    for (itemId of items) {
      idList.push(itemId.itemID);      
    }
    itemId = req.params.itemId;
    const currentItemIndex = idList.indexOf(itemId);
    const previousItemIndex = currentItemIndex - 1;
    return items[previousItemIndex]._id;
  }).then(result => {
    console.log(result, "result");
    res.redirect(`/inventory/item/${result}`);
  }).catch(err => {
    console.log(err);
  })
};


exports.getNextItem = (req, res, next) => {
  let itemId;
  itemId = req.params.itemId;
  // if (req.params.itemId == undefined) {
  //   itemId = Item.fetchAll().then((items) => {
  //     items[0]._id;
  //     console.log(itemId);
  //   });
  // } else {
  //   itemId = req.params.itemId;
  // }
  let idList = [];
  Item.fetchAll().then((items) => {
    for (itemId of items) {
      idList.push(itemId.itemID);      
    }
    itemId = req.params.itemId;
    const currentItemIndex = idList.indexOf(itemId);
    const nextItemIndex = currentItemIndex + 1;
    return items[nextItemIndex]._id;
  }).then(result => {
    console.log(result, "result");
    res.redirect(`/inventory/item/${result}`);
  }).catch(err => {
    console.log(err);
  })
};

exports.getInventory = (req, res, next) => {
  res.render('dashboard/inventory', {
    pageTitle: 'Inventory',
    path: '/dashboard/inventory',
    editing: false,
  });
};

exports.getSalesOrder = (req, res, next) => {
  res.render('dashboard/sales-order', {
    pageTitle: 'Sales Orders',
    path: '/dashboard/sales-order',
    editing: false,
  });
};

exports.getPurchaseOrder = (req, res, next) => {
  res.render('dashboard/purchase-order', {
    pageTitle: 'Purchase Orders',
    path: 'dashboard/purchase-order',
    editing: false,
  });
};

exports.getReports = (req, res, next) => {
  res.render('dashboard/reports', {
    pageTitle: 'Reports',
    path: 'dashboard/reports',
    editing: false,
  });
};

exports.getSysconfig = (req, res, next) => {
  res.render('dashboard/sysconfig', {
    pageTitle: 'Sysconfig',
    path: 'dashboard/sysconfig',
    editing: false,
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
