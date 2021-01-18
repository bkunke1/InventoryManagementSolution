const express = require('express');
const { check, body } = require('express-validator/check');

const salesAuth = require('../middleware/sales-auth');

const salesOrderController = require('../controllers/salesOrders');
const User = require('../models/user');

const router = express.Router();

router.get('/so', salesAuth,  salesOrderController.getSalesOrder);
router.get('/so/new', salesAuth, salesOrderController.getNewSalesOrder);
router.post('/so/createSalesOrder', salesAuth, salesOrderController.postCreateSalesOrder);
router.get('/so/view/:soNum', salesAuth, salesOrderController.getExistingSalesOrder);
router.post('/so/update', salesAuth, salesOrderController.postUpdateSO);

router.get('/so/next/:soNum', salesAuth, salesOrderController.getNextSalesOrder);
router.get('/so/previous/:soNum', salesAuth, salesOrderController.getPreviousSalesOrder);

router.post('/so/delete', salesAuth, salesOrderController.postDeleteSalesOrder);

module.exports = router;
