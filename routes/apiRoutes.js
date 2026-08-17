const express = require('express');
const router = express.Router();
const restaurantsCtrl = require('../controllers/restaurantsController');
const reviewsCtrl = require('../controllers/reviewsController');

router.get('/', restaurantsCtrl.getDashboard);

router.post('/api/restaurants', restaurantsCtrl.createRestaurant);
router.post('/api/reviews', reviewsCtrl.createReview);
router.put('/api/reviews/:id', reviewsCtrl.updateReview);
router.delete('/api/restaurants/:id', restaurantsCtrl.deleteRestaurant);

module.exports = router;
