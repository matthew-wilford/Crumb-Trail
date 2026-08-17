
describe('restaurantsController', () => {
  afterEach(() => jest.resetModules());

  test('getDashboard - success renders dashboard', async () => {
    const mockRestaurants = [{ get: () => ({ id: 1, name: 'A', Reviews: [] }) }];
    jest.doMock('../../models', () => ({
      Restaurant: { findAll: jest.fn().mockResolvedValue(mockRestaurants) },
      Review: {},
    }));

    const { getDashboard } = require('../../controllers/restaurantsController');
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), render: jest.fn(), json: jest.fn() };
    await getDashboard(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.render).toHaveBeenCalledWith('dashboard', { restaurants: [{ id: 1, name: 'A', Reviews: [] }] });
  });

  test('createRestaurant - missing fields returns 400', async () => {
    const req = { body: { cuisine: 'Italian' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const { createRestaurant } = require('../../controllers/restaurantsController');
    await createRestaurant(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
