const { Review } = require('../models');

async function createReview(req, res) {
  try {
    const { rating, review_text, visit_date, restaurant_id } = req.body;
    if (!restaurant_id || !rating) return res.status(400).json({ error: 'Missing required fields: restaurant_id, rating' });
    const parsedRating = parseInt(rating, 10);
    if (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
    }

    const review = await Review.create({ rating: parsedRating, review_text, visit_date, restaurant_id });
    return res.status(201).json(review);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create review', details: err.message });
  }
}

async function updateReview(req, res) {
  try {
    const id = req.params.id;
    const { rating, review_text } = req.body;
    const update = {};
    if (rating !== undefined) {
      const parsed = parseInt(rating, 10);
      if (Number.isNaN(parsed) || parsed < 1 || parsed > 5) {
        return res.status(400).json({ error: 'Rating must be an integer between 1 and 5' });
      }
      update.rating = parsed;
    }
    if (review_text !== undefined) update.review_text = review_text;

    const [updatedCount, [updatedReview]] = await Review.update(update, { where: { id }, returning: true });
    if (!updatedCount) return res.status(404).json({ error: 'Review not found' });
    return res.status(200).json(updatedReview);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update review', details: err.message });
  }
}

module.exports = { createReview, updateReview };
