const express = require('express');
const request = require('supertest');

jest.mock('../../controllers/restaurantsController', () => ({
  getDashboard: (req, res) => res.status(200).send('ok'),
  createRestaurant: (req, res) => res.status(201).json({}),
  deleteRestaurant: (req, res) => res.sendStatus(204),
}));

jest.mock('../../controllers/reviewsController', () => ({
  createReview: (req, res) => res.status(201).json({}),
  updateReview: (req, res) => res.status(200).json({}),
}));

const apiRoutes = require('../../routes/apiRoutes');

describe('apiRoutes wiring', () => {
  let app;
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/', apiRoutes);
  });

  test('GET / responds 200', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
  });

  test('POST /api/restaurants responds 201', async () => {
    const res = await request(app).post('/api/restaurants').send({ name: 'X', cuisine: 'Y' });
    expect(res.status).toBe(201);
  });
});
