const express = require('express');
const { check, body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', adminController.getIndex);

// Inventory routes

router.get('/inventory', adminController.getInventory);
// router.get('/inventory', isAuth, adminController.getInventory); (temp removed to cancel isAuth access)

router.get('/inventory/item-maintenance', adminController.getItemMaintenance);

router.get('/inventory/add-item', isAuth, adminController.getAddItem);

router.post(
  '/inventory/add-item',
  [
    body('itemID')
      .isLength({ min: 1 })
      .isAlphanumeric()
      .trim()
      .withMessage('Please enter valid Item ID'),
    body('description')
    .isLength({ min: 1 })
      .isString()
      .trim()
      .withMessage('Please enter an alphanumeric description'),
    body('category')
    .isLength({ min: 1 })
      .isAlphanumeric()
      .trim()
      .withMessage('Please enter an alphanumeric category'),
    body('defaultWarehouse')
    .isLength({ min: 1 })
      .isAlphanumeric()
      .trim()
      .withMessage('Please enter an alphanumeric warehouse'),
    body('baseUOM')
    .isLength({ min: 1 })
      .isAlphanumeric()
      .trim()
      .withMessage('Please enter a valid base uom'),
    body('salesUOM')
    .isLength({ min: 1 })
      .isAlphanumeric()
      .trim()
      .withMessage('Please enter a valid sales uom'),
    body('purchaseUOM')
    .isLength({ min: 1 })
      .isAlphanumeric()
      .trim()
      .withMessage('Please enter a valid purchase uom'),
    body('defaultPrice').isLength({ min: 1 }).isFloat().trim(),
  ],
  adminController.postAddItem
);

router.get('/inventory/items', adminController.getItems);

// lets users enter an item ID into the field to find it or create that item if it doesnt already exist
router.post(
  '/inventory/item/byID/search',
  [
    body('itemID')
      .isLength({ min: 1 })
      .isAlphanumeric()
      .trim()
      .withMessage('Please enter valid Item ID')
  ],
  adminController.searchItemByNewID
);

router.get('/inventory/item/:itemId', adminController.getItem);



// router.get('/edit-item', adminController.getEditItem);

router.post('/inventory/update-item', adminController.postUpdateItem);

router.get('/inventory/previousItem/:itemId', adminController.getPreviousItem);

router.get('/inventory/nextItem/:itemId', adminController.getNextItem);

router.get('/inventory/warehouse-setup', adminController.getWarehouseSetup);

router.post(
  '/inventory/warehouse/addWarehouse',
  [
    body('warehouseID')
      .isLength({ min: 1 })
      .isAlphanumeric()
      .trim()
      .withMessage('Please enter valid warehouse ID')
  ],
  adminController.postAddWarehouse
);

router.post(
  '/inventory/warehouse/editWarehouse',
  [
    body('editWarehouseID')
      .isLength({ min: 1 })
      .isAlphanumeric()
      .trim()
      .withMessage('Please enter valid warehouse ID')
  ],
  adminController.postEditWarehouse
);

router.post('/inventory/warehouse-delete', adminController.postDeleteWarehouse);

router.get('/inventory/uom-setup', adminController.getUomSetup);

router.post(
  '/inventory/uom/addUOM',
  [
    body('uomID')
      .isLength({ min: 1 })
      .isAlphanumeric()
      .trim()
      .withMessage('Please enter valid UOM ID')
  ],
  adminController.postAddUOM
);

router.post(
  '/inventory/uom/editUOM',
  [
    body('editUOMID')
      .isLength({ min: 1 })
      .isAlphanumeric()
      .trim()
      .withMessage('Please enter valid uom ID')
  ],
  adminController.postEditUOM
);

router.post('/inventory/uom-delete', adminController.postDeleteUOM);

router.get('/inventory/category-setup', adminController.getCategorySetup);

router.post(
  '/inventory/category/addCategory',
  [
    body('categoryID')
      .isLength({ min: 1 })
      .isAlphanumeric()
      .trim()
      .withMessage('Please enter valid Category ID')
  ],
  adminController.postAddCategory
);

router.post(
  '/inventory/category/editCategory',
  [
    body('editCategoryID')
      .isLength({ min: 1 })
      .isAlphanumeric()
      .trim()
      .withMessage('Please enter valid Category ID')
  ],
  adminController.postEditCategory
);

router.post('/inventory/category-delete', adminController.postDeleteCategory);





// router.get('/so', adminController.getSalesOrder);

// router.get('/po', adminController.getPurchaseOrder);

// router.get('/reports', adminController.getReports);

// router.get('/sysconfig', adminController.getSysconfig);

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

module.exports = router;
