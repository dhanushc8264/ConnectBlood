// ✅ FIX 1: Proper USER mock WITH constructor
jest.mock('../models/userModel', () => {
  const mockUser = function (data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data),
    };
  };

  mockUser.findOne = jest.fn();
  mockUser.findById = jest.fn();
  mockUser.findByIdAndUpdate = jest.fn();
  mockUser.deleteMany = jest.fn();

  return mockUser;
});

// ✅ FIX 2: Add JWT secret
process.env.JWT_SECRET = "testsecret";

// ✅ MOCK AXIOS
jest.mock('axios');
const axios = require('axios');

// ✅ MOCK AUTH
jest.mock('../middlewares/AuthMiddleware', () => (req, res, next) => {
  req.user = { _id: '123', id: '123' };
  next();
});

// ✅ IMPORTS
const request = require('supertest');
const app = require('../server');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('AuthController', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // ✅ GEOCODE
  // =========================
  describe('geocode', () => {

    it('should return 400 if no address', async () => {
      const res = await request(app).get('/api/auth/geocode');

      expect(res.status).toBe(400);
    });

    it('should return 200 if address provided', async () => {
      axios.get.mockResolvedValue({
        data: [{ lat: "10", lon: "20" }]
      });

      const res = await request(app).get('/api/auth/geocode?address=London');

      expect(res.status).toBe(200);
    });

  });

  // =========================
  // ✅ REGISTER
  // =========================
  describe('registerController', () => {

    it('should fail if missing fields', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'test@example.com'
      });

      expect(res.status).toBe(400);
    });

    it('should register user', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/register').send({
        name: 'John',
        email: 'john@test.com',
        phone: '1234567890',
        password: 'pass123',
        blood_group: 'A+',
        location: {
          address: 'test',
          coordinates: { latitude: 1, longitude: 2 }
        }
      });

      expect(res.status).toBe(201);
    });

  });

  // =========================
  // ✅ LOGIN
  // =========================
  describe('loginController', () => {

    it('should fail if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).post('/api/auth/login').send({
        email: 'fake@test.com',
        password: '123'
      });

      expect(res.status).toBe(404);
    });

    it('should login successfully', async () => {
      const hashed = await bcrypt.hash('123', 10);

      User.findOne.mockResolvedValue({
        _id: '123',
        password: hashed
      });

      const res = await request(app).post('/api/auth/login').send({
        email: 'test@test.com',
        password: '123'
      });

      expect(res.status).toBe(201);
    });

  });

  // =========================
  // ✅ UPDATE LOCATION
  // =========================
  describe('updateLocation', () => {

    it('should fail if invalid coords', async () => {
      const res = await request(app)
        .patch('/api/auth/update-location')
        .send({ latitude: 'abc' });

      expect(res.status).toBe(400);
    });

    it('should succeed update', async () => {
      User.findByIdAndUpdate.mockResolvedValue({
        _id: '123',
        location: { latitude: 10, longitude: 20 }
      });

      const token = jwt.sign({ userId: '123' }, "testsecret");

      const res = await request(app)
        .patch('/api/auth/update-location')
        .set('Cookie', `token=${token}`)
        .send({
          latitude: '10',
          longitude: '20'
        });

      expect(res.status).toBe(200);
    });

  });

});
