// Import required modules
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Test suite for AuthController
describe('AuthController', () => {
  // Clear database before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // Test geocode function
  describe('geocode', () => {
    it('should return 400 if address is not provided', async () => {
      const response = await request(app).get('/geocode');
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Address is required');
    });

    it('should return location data if address is provided', async () => {
      const response = await request(app).get('/geocode?address=London');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('lat');
      expect(response.body).toHaveProperty('lon');
    });

    it('should return 404 if location is not found', async () => {
      const response = await request(app).get('/geocode?address=InvalidAddress');
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Location not found');
    });
  });

  // Test registerController function
  describe('registerController', () => {
    it('should return 400 if all fields are not provided', async () => {
      const response = await request(app).post('/register').send({
        name: 'John Doe',
        email: 'johndoe@example.com',
      });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('All fields are necessary');
    });

    it('should return 400 if location is not in correct format', async () => {
      const response = await request(app).post('/register').send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        phoneNumber: '1234567890',
        password: 'password123',
        blood_group: 'A+',
        location: 'Invalid location',
      });
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Location must include address and coordinates (latitude/longitude)');
    });

    it('should return 200 if user is already registered', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        name: 'John Doe',
        email: 'johndoe@example.com',
        phoneNumber: '1234567890',
        password: hashedPassword,
        blood_group: 'A+',
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
        },
      });
      await user.save();

      const response = await request(app).post('/register').send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        phoneNumber: '1234567890',
        password: 'password123',
        blood_group: 'A+',
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
        },
      });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Already registered please login');
    });

    it('should return 201 if user is registered successfully', async () => {
      const response = await request(app).post('/register').send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        phoneNumber: '1234567890',
        password: 'password123',
        blood_group: 'A+',
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
        },
      });
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
    });
  });

  // Test loginController function
  describe('loginController', () => {
    it('should return 404 if email or password is not provided', async () => {
      const response = await request(app).post('/login').send({
        email: 'johndoe@example.com',
      });
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('login credentials failed');
    });

    it('should return 404 if user is not registered', async () => {
      const response = await request(app).post('/login').send({
        email: 'johndoe@example.com',
        password: 'password123',
      });
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('user not registered');
    });

    it('should return 404 if password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        name: 'John Doe',
        email: 'johndoe@example.com',
        phoneNumber: '1234567890',
        password: hashedPassword,
        blood_group: 'A+',
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
        },
      });
      await user.save();

      const response = await request(app).post('/login').send({
        email: 'johndoe@example.com',
        password: 'wrongpassword',
      });
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('wrong login credentials');
    });

    it('should return 201 if user is logged in successfully', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        name: 'John Doe',
        email: 'johndoe@example.com',
        phoneNumber: '1234567890',
        password: hashedPassword,
        blood_group: 'A+',
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
        },
      });
      await user.save();

      const response = await request(app).post('/login').send({
        email: 'johndoe@example.com',
        password: 'password123',
      });
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('login success');
    });
  });

  // Test updateLocation function
  describe('updateLocation', () => {
    it('should return 400 if latitude or longitude is not provided', async () => {
      const response = await request(app).patch('/update-location').send({
        latitude: '37.7749',
      });
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Valid latitude and longitude values required');
    });

    it('should return 404 if user is not found', async () => {
      const response = await request(app).patch('/update-location').send({
        latitude: '37.7749',
        longitude: '-122.4194',
      });
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 200 if location is updated successfully', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = new User({
        name: 'John Doe',
        email: 'johndoe@example.com',
        phoneNumber: '1234567890',
        password: hashedPassword,
        blood_group: 'A+',
        location: {
          address: '123 Main St',
          coordinates: {
            latitude: 37.7749,
            longitude: -122.4194,
          },
        },
      });
      await user.save();

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      const response = await request(app)
        .patch('/update-location')
        .set("Cookie", `token=${token}`)
        .send({
          latitude: '37.7750',
          longitude: '-122.4195',
        });
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Location updated successfully');
    });
  });
});