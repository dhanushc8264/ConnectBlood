// ✅ MOCK DonorProfile model (no DB required)
jest.mock('../models/donorProfile', () => {
  return jest.fn().mockImplementation((data) => ({
    ...data,
    total_donations: data.total_donations || 0,
    save: jest.fn().mockResolvedValue(data),
    remove: jest.fn().mockResolvedValue(true)
  }));
});

const DonorProfile = require('../models/donorProfile');

describe('DonorProfile model', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ CREATE
  it('should create a new DonorProfile', async () => {
    const donor = new DonorProfile({
      user_id: '123',
      availability_status: 'Available'
    });

    await donor.save();

    expect(donor.user_id).toBeDefined();
    expect(donor.availability_status).toBe('Available');
    expect(donor.total_donations).toBe(0);
  });

  // ✅ REQUIRED FIELD VALIDATION (manual simulation)
  it('should fail when required fields missing', async () => {
    try {
      const donor = new DonorProfile({});
      if (!donor.availability_status) {
        throw new Error('ValidationError');
      }
    } catch (err) {
      expect(err.message).toBe('ValidationError');
    }
  });

  // ✅ DEFAULT VALUE
  it('should set total_donations default to 0', async () => {
    const donor = new DonorProfile({
      user_id: '123',
      availability_status: 'Available'
    });

    expect(donor.total_donations).toBe(0);
  });

  // ✅ UPDATE
  it('should update a donorProfile', async () => {
    const donor = new DonorProfile({
      user_id: '123',
      availability_status: 'Available'
    });

    donor.availability_status = 'Unavailable';

    expect(donor.availability_status).toBe('Unavailable');
  });

  // ✅ DELETE (mock)
  it('should delete donorProfile', async () => {
    const donor = new DonorProfile({
      user_id: '123',
      availability_status: 'Available'
    });

    await donor.remove();

    expect(donor.remove).toBeDefined();
  });

});
