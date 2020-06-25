const Item = require('../models/item');

exports.getIndex = (req, res, next) => {
  res.render('./dashboard/index', {
    pageTitle: 'IMS Dashboard',
  });
};

exports.getItems = (req, res, next) => {
  Item.fetchAll()
    .then((items) => {
      res.render('./dashboard/items', {
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
      res.render('./dashboard/item', {
        item: item,
        pageTitle: 'Item Profile',
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAddItem = (req, res, next) => {
  res.render('dashboard/add-item', {
    pageTitle: 'Add Item',
    path: '/dashboard/add-item',
    editing: false,
  });
};

exports.postAddItem = (req, res, next) => {
  const description = req.body.description;
  const category = req.body.category;
  const totalQtyOnHand = req.body.totalQtyOnHand;
  const uom = req.body.uom;
  const avgCost = req.body.avgCost;
  const retailPrice = req.body.retailPrice;
  const item = new Item(
    description,
    category,
    totalQtyOnHand,
    uom,
    avgCost,
    retailPrice
  );
  item
    .save()
    .then((result) => {
      // console.log(result);
      console.log('Created Item');
      res.redirect('/items');
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditItem = (req, res, next) => {
  res.render('dashboard/edit-item', {
    pageTitle: 'Edit Item',
    path: '/dashboard/edit-item',
    editing: false,
  });
};

exports.postEditItem = (req, res, next) => {};

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
