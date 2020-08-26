// node library used to help validate fields
const { validationResult } = require('express-validator/check');

const Item = require('../models/item');
const Warehouse = require('../models/warehouse');
const UOM = require('../models/uom');
const Category = require('../models/category');

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
  Warehouse.find()
    .then((warehouseList) => {
      Item.findById(itemId)
        .then((item) => {
          const itemLotList = item.lotCost;
          console.log(itemLotList);
          UOM.find()
            .then((uomList) => {
              Category.find()
                .then((categoryList) => {
                  //testing lotcost displays
                    // itemLotList.forEach(function(lot) {
                    //   console.log(lot.lotNum);
                    // });
                  res.render('./dashboard/inventory/item', {
                    item: item,
                    pageTitle: 'Item Profile',
                    mainMenuPath: 'inventory',
                    subMenuPath: 'item-maintenance',
                    message: message,
                    warehouseList: warehouseList,
                    uomList: uomList,
                    categoryList: categoryList,
                    itemLotList: itemLotList
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

exports.getItemLotCost = (req, res, next) => {
  console.log('button pressed');
};

exports.getItemMaintenance = (req, res, next) => {
  Item.find()
    .then((item) => {
      Warehouse.find()
        .then((warehouseList) => {
          UOM.find()
            .then((uomList) => {
              Category.find()
                .then((categoryList) => {
                  res.render('dashboard/inventory/item-maintenance', {
                    pageTitle: 'Item Maintenance',
                    mainMenuPath: 'inventory',
                    subMenuPath: 'item-maintenance',
                    errorMessage: null,
                    item: item,
                    warehouseList: warehouseList,
                    uomList: uomList,
                    categoryList: categoryList,
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

exports.getAddItem = (req, res, next) => {
  Warehouse.find()
    .then((warehouseList) => {
      UOM.find()
        .then((uomList) => {
          Category.find()
            .then((categoryList) => {
              res.render('dashboard/inventory/add-item', {
                pageTitle: 'Add Item',
                mainMenuPath: 'inventory',
                subMenuPath: 'add-item',
                newItemID: req.query.newItemID,
                errorMessage: null,
                oldInput: { itemID: '' },
                validationErrors: [],
                warehouseList: warehouseList,
                uomList: uomList,
                categoryList: categoryList,
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
  const qtyOnOrder = 0;
  const qtyAllocated = 0;
  const avgCost = 0;
  const lotCost = {};

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
        itemStatus: itemStatus.toUpperCase(),
        description: description.toUpperCase(),
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
      itemStatus: itemStatus.toUpperCase(),
      description: description.toUpperCase(),
      category: category,
      valuationMethod: valuationMethod,
      type: type,
      defaultWarehouse: defaultWarehouse,
      baseUOM: baseUOM,
      salesUOM: salesUOM,
      purchaseUOM: purchaseUOM,
      defaultPrice: defaultPrice,
      totalQtyOnHand: totalQtyOnHand,
      qtyOnOrder: qtyOnOrder,
      qtyAllocated: qtyAllocated,
      userId: req.session.user.email,
      avgCost: avgCost,
      lotCost: lotCost,
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
        res.redirect('/500');
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
  const qtyOnOrder = req.body.qtyOnOrder;
  const qtyAllocated = req.body.qtyAllocated;
  const userId = req.body.userId;
  const id = req.body._id;
  const avgCost = req.body.avgCost;
  const lotCost = req.body.lotCost;

  Item.findById(id)
    .then((item) => {
      item.itemID = itemID;
      item.itemStatus = itemStatus.toUpperCase();
      item.description = description.toUpperCase();
      item.category = category;
      item.valuationMethod = valuationMethod;
      item.type = type;
      item.defaultWarehouse = defaultWarehouse;
      item.baseUOM = baseUOM;
      item.salesUOM = salesUOM;
      item.purchaseUOM = purchaseUOM;
      item.defaultPrice = defaultPrice;
      item.totalQtyOnHand = totalQtyOnHand;
      item.qtyOnOrder = qtyOnOrder;
      item.qtyAllocated = qtyAllocated;
      item.userId = userId;
      item.avgCost = avgCost;
      item.lotCost = lotCost;
      return item.save();
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
  Warehouse.find()
    .then((warehouseList) => {
      res.render('dashboard/inventory/warehouse-setup', {
        pageTitle: 'Warehouse Setup',
        mainMenuPath: 'inventory',
        subMenuPath: 'warehouseSetup',
        warehouseList: warehouseList,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddWarehouse = (req, res, next) => {
  const ID = req.body.warehouseID;
  const name = req.body.warehouseName;
  const address = req.body.address;

  const errors = validationResult(req);
  console.log('postAddWarehouse Errors', errors);
  Warehouse.find()
    .then((warehouseList) => {
      if (!errors.isEmpty()) {
        return res.render('dashboard/inventory/warehouse-setup', {
          pageTitle: 'Warehouse Setup',
          mainMenuPath: 'inventory',
          subMenuPath: 'warehouseSetup',
          warehouseList: warehouseList,
        });
      } else if (!ID) {
        console.log('Missing warehouse ID!');
        return res.redirect('/inventory/warehouse-setup');
      } else {
        const warehouse = new Warehouse({
          ID: ID,
          name: name.toUpperCase(),
          address: address.toUpperCase(),
        });
        warehouse
          .save()
          .then((result) => {
            console.log('Warehouse Item was created!');
            req.flash('createdMessage', 'Warehouse was created!');
            return res.redirect('/inventory/warehouse-setup');
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

exports.postEditWarehouse = (req, res, next) => {
  const ID = req.body.editWarehouseID;
  const name = req.body.editWarehouseName;
  const address = req.body.editAddress;

  const errors = validationResult(req);
  console.log('postEditWarehouse Errors', errors);
  Warehouse.find()
    .then((warehouseList) => {
      if (!errors.isEmpty()) {
        return res.render('dashboard/inventory/warehouse-setup', {
          pageTitle: 'Warehouse Setup',
          mainMenuPath: 'inventory',
          subMenuPath: 'warehouseSetup',
          warehouseList: warehouseList,
        });
      } else if (!ID) {
        console.log('Missing warehouse ID!');
        return res.redirect('/inventory/warehouse-setup');
      } else {
        Warehouse.findOne({ ID: ID })
          .then((warehouse) => {
            warehouse.ID = ID;
            warehouse.name = name.toUpperCase();
            warehouse.address = address.toUpperCase();
            console.log(warehouse);
            return warehouse.save().then((result) => {
              console.log('Warehouse Item was Updated!');
              req.flash('createdMessage', 'Warehouse was created!');
              return res.redirect('/inventory/warehouse-setup');
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

exports.postDeleteWarehouse = (req, res, next) => {
  const ID = req.body.warehouseID;
  console.log(ID);
  Warehouse.deleteOne({ ID: ID })
    .then(() => {
      console.log('DESTROYED Warehouse');
      return res.redirect('/inventory/warehouse-setup');
    })
    .catch((err) => console.log(err));
};

exports.getUomSetup = (req, res, next) => {
  UOM.find()
    .then((UOMList) => {
      res.render('dashboard/inventory/uom-setup', {
        pageTitle: 'Unit of Measure Setup',
        mainMenuPath: 'inventory',
        subMenuPath: 'uomSetup',
        UOMList: UOMList,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddUOM = (req, res, next) => {
  const ID = req.body.uomID;
  const name = req.body.uomName;
  const conversionQty = req.body.conversionQty;

  const errors = validationResult(req);
  console.log('postAddUOM Errors', errors);
  UOM.find()
    .then((UOMList) => {
      if (!errors.isEmpty()) {
        return res.render('dashboard/inventory/uom-setup', {
          pageTitle: 'Unit of Measure Setup',
          mainMenuPath: 'inventory',
          subMenuPath: 'uomSetup',
          UOMList: UOMList,
        });
      } else if (!ID) {
        console.log('Missing uom ID!');
        return res.redirect('/inventory/uom-setup');
      } else {
        const uom = new UOM({
          ID: ID,
          name: name.toUpperCase(),
          conversionQty: conversionQty,
        });
        uom
          .save()
          .then((result) => {
            console.log('Warehouse Item was created!');
            req.flash('createdMessage', 'Warehouse was created!');
            return res.redirect('/inventory/uom-setup');
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

exports.postEditUOM = (req, res, next) => {
  const ID = req.body.editUOMID;
  const name = req.body.editUOMName;
  const conversionQty = req.body.editConversionQty;

  const errors = validationResult(req);
  console.log('postEditUOM Errors', errors);
  UOM.find()
    .then((UOMList) => {
      if (!errors.isEmpty()) {
        return res.render('dashboard/inventory/uom-setup', {
          pageTitle: 'Unit of Measure Setup',
          mainMenuPath: 'inventory',
          subMenuPath: 'uomSetup',
          UOMList: UOMList,
        });
      } else if (!ID) {
        console.log('Missing uom ID!');
        return res.redirect('/inventory/uom-setup');
      } else {
        UOM.findOne({ ID: ID })
          .then((uom) => {
            uom.ID = ID;
            uom.name = name.toUpperCase();
            uom.conversionQty = conversionQty;
            console.log(uom);
            return uom.save().then((result) => {
              console.log('UOM Item was Updated!');
              req.flash('createdMessage', 'UOM was created!');
              return res.redirect('/inventory/uom-setup');
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

exports.postDeleteUOM = (req, res, next) => {
  const ID = req.body.uomID;
  console.log(ID);
  UOM.deleteOne({ ID: ID })
    .then(() => {
      console.log('DESTROYED UOM');
      return res.redirect('/inventory/uom-setup');
    })
    .catch((err) => console.log(err));
};

exports.getCategorySetup = (req, res, next) => {
  Category.find()
    .then((categoryList) => {
      res.render('dashboard/inventory/category-setup', {
        pageTitle: 'Category Setup',
        mainMenuPath: 'inventory',
        subMenuPath: 'categorySetup',
        categoryList: categoryList,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postAddCategory = (req, res, next) => {
  const ID = req.body.categoryID;
  const name = req.body.categoryName;

  const errors = validationResult(req);
  console.log('postAddCategory Errors', errors);
  Category.find()
    .then((categoryList) => {
      if (!errors.isEmpty()) {
        return res.render('dashboard/inventory/category-setup', {
          pageTitle: 'Category Setup',
          mainMenuPath: 'inventory',
          subMenuPath: 'categorySetup',
          categoryList: categoryList,
        });
      } else if (!ID) {
        console.log('Missing Category ID!');
        return res.redirect('/inventory/category-setup');
      } else {
        const category = new Category({
          ID: ID,
          name: name.toUpperCase(),
        });
        category
          .save()
          .then((result) => {
            console.log('Category Item was created!');
            req.flash('createdMessage', 'Category was created!');
            return res.redirect('/inventory/category-setup');
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

exports.postEditCategory = (req, res, next) => {
  const ID = req.body.editCategoryID;
  const name = req.body.editCategoryName;

  const errors = validationResult(req);
  console.log('postEditCategory Errors', errors);
  Category.find()
    .then((categoryList) => {
      if (!errors.isEmpty()) {
        return res.render('dashboard/inventory/category-setup', {
          pageTitle: 'Category Setup',
          mainMenuPath: 'inventory',
          subMenuPath: 'categorySetup',
          categoryList: categoryList,
        });
      } else if (!ID) {
        console.log('Missing Category ID!');
        return res.redirect('/inventory/category-setup');
      } else {
        Category.findOne({ ID: ID })
          .then((category) => {
            category.ID = ID;
            category.name = name.toUpperCase();
            return category.save().then((result) => {
              console.log('Category was Updated!');
              req.flash('createdMessage', 'Category was created!');
              return res.redirect('/inventory/category-setup');
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

exports.postDeleteCategory = (req, res, next) => {
  const ID = req.body.categoryID;
  console.log(ID);
  Category.deleteOne({ ID: ID })
    .then(() => {
      console.log('DESTROYED Category');
      return res.redirect('/inventory/category-setup');
    })
    .catch((err) => console.log(err));
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
