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

module.exports = router;
