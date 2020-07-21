const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', adminController.getIndex);

router.get('/inventory/items', isAuth, adminController.getItems);

router.post('/inventory/item/byID/search', adminController.searchItemByNewID);
router.get('/inventory/item/:itemId', adminController.getItem);
// router.get('/item', adminController.getItemByNewID);

router.get('/inventory/add-item', adminController.getAddItem);

router.post('/inventory/add-item', adminController.postAddItem);

router.get('/inventory/item-maintenance', adminController.getItemMaintenance);

router.get('/inventory/warehouse-setup', adminController.getWarehouseSetup);

router.get('/edit-item', adminController.getEditItem);

router.post('/inventory/update-item', adminController.postUpdateItem);

router.get('/inventory', isAuth, adminController.getInventory);

router.get('/inventory/previousItem/:itemId', adminController.getPreviousItem);

router.get('/inventory/nextItem/:itemId', adminController.getNextItem);

router.get('/so', adminController.getSalesOrder);

router.get('/po', adminController.getPurchaseOrder);

router.get('/reports', adminController.getReports);

router.get('/sysconfig', adminController.getSysconfig);

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
