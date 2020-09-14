const express = require('express');
const { check, body } = require('express-validator/check');

const purchasingAuth = require('../middleware/purchasing-auth');

const purchaseOrderController = require('../controllers/purchaseOrders');
const User = require('../models/user');

const router = express.Router();

router.get('/po', purchasingAuth, purchaseOrderController.getPurchaseOrder);

router.get('/po/new', purchasingAuth, purchaseOrderController.getNewPurchaseOrder);

router.post('/po/save', purchasingAuth, purchaseOrderController.postCreatePO);


router.get('/po/getUOMs/', purchasingAuth, purchaseOrderController.getUOMs);

router.get('/po/getShippingMethods/', purchasingAuth, purchaseOrderController.getShippingMethods);

router.post('/po/getItem/:itemId', purchasingAuth, purchaseOrderController.postFindItem);

// router.post('/po/itemSelectionFilter/:filterType/:filterOperator', purchasingAuth, purchaseOrderController.postFilterItemSelectionList); might do this front side

router.get('/po/options/', purchasingAuth, purchaseOrderController.getOptions);

    // po options CRUD routes //

//// shipping methods
router.post('/po/options/addShippingMethod', purchasingAuth, purchaseOrderController.postAddShippingMethod);
router.post('/po/options/editShippingMethod', purchasingAuth, purchaseOrderController.postEditShippingMethod);
router.post('/po/options/deleteShippingMethod', purchasingAuth, purchaseOrderController.postDeleteShippingMethod);

//// payment terms
router.post('/po/options/addPaymentTerm', purchasingAuth, purchaseOrderController.postAddPaymentTerm);
router.post('/po/options/editPaymentTerm', purchasingAuth, purchaseOrderController.postEditPaymentTerm);
router.post('/po/options/deletePaymentTerm', purchasingAuth, purchaseOrderController.postDeletePaymentTerm);



module.exports = router;
