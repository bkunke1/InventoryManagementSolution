const express = require('express');
const { check, body } = require('express-validator/check');

const purchaseOrderController = require('../controllers/purchaseOrders');
const User = require('../models/user');

const router = express.Router();

router.post('/po/create-new', purchaseOrderController.postCreatePO);

module.exports = router;
