const express = require('express');
const { check, body } = require('express-validator/check');

const salesAuth = require('../middleware/sales-auth');

const salesOrderController = require('../controllers/salesOrders');
const User = require('../models/user');

const router = express.Router();

router.get('/so', salesAuth,  salesOrderController.getSalesOrder);
router.get('/so/new', salesAuth, salesOrderController.getNewSalesOrder);
router.post('/so/createSalesOrder', salesAuth, salesOrderController.postCreateSalesOrder);

module.exports = router;
