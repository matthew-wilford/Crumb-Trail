const { Restaurant, Review, sequelize } = require('../models');

async function getDashboard(req, res) {
  try {
    // "as: 'reviews'" must match the alias declared on the Restaurant.hasMany(Review) association.
    const restaurants = await Restaurant.findAll({ include: [{ model: Review, as: 'reviews' }] });
    return res.status(200).render('dashboard', { restaurants: restaurants.map(r => r.get({ plain: true })) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load dashboard', details: err.message });
  }
}

async function createRestaurant(req, res) {
  try {
    const { name, cuisine, latitude, longitude } = req.body;
    if (!name || !cuisine) return res.status(400).json({ error: 'Missing required fields: name, cuisine' });

    // Reject malformed coordinates here rather than silently storing a value
    // that Leaflet can't plot anywhere near the map (e.g. a stripped decimal point).
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      return res.status(400).json({ error: 'Latitude must be a number between -90 and 90' });
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      return res.status(400).json({ error: 'Longitude must be a number between -180 and 180' });
    }

    const restaurant = await Restaurant.create({ name, cuisine, latitude: lat, longitude: lng });
    return res.status(201).json(restaurant);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create restaurant', details: err.message });
  }
}

async function deleteRestaurant(req, res) {
  const id = req.params.id;
  try {
    await sequelize.transaction(async (t) => {
      await Review.destroy({ where: { restaurant_id: id }, transaction: t });
      const deleted = await Restaurant.destroy({ where: { id }, transaction: t });
      if (!deleted) throw new Error('Restaurant not found');
    });
    return res.sendStatus(204);
  } catch (err) {
    if (err.message === 'Restaurant not found') return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: 'Failed to delete restaurant', details: err.message });
  }
}

module.exports = { getDashboard, createRestaurant, deleteRestaurant };
