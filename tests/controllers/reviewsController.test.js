const reviewsPath = '../../controllers/reviewsController';

describe('reviewsController', () => {
  afterEach(() => jest.resetModules());

  test('createReview - invalid rating returns 400', async () => {
    jest.doMock('../../models', () => ({ Review: { create: jest.fn() } }));
    const { createReview } = require(reviewsPath);
    const req = { body: { rating: 10, restaurant_id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await createReview(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('updateReview - not found returns 404', async () => {
    jest.doMock('../../models', () => ({
      Review: { update: jest.fn().mockResolvedValue([0, []]) },
    }));
    const { updateReview } = require(reviewsPath);
    const req = { params: { id: 1 }, body: { rating: 5 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    await updateReview(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
});
