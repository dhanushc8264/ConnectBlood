// Import required modules
const mongoose = require('mongoose');
const DonorProfile = require('./donorProfile');

// Create a test suite for DonorProfile model
describe('DonorProfile model', () => {
    // Connect to the database before running tests
    beforeAll(async () => {
        await mongoose.connect(global.__MONGO_URI__, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    // Close the database connection after running tests
    afterAll(async () => {
        await mongoose.connection.close();
    });

    // Test the creation of a new DonorProfile document
    it('should create a new DonorProfile document', async () => {
        const donorProfile = new DonorProfile({
            user_id: mongoose.Types.ObjectId(),
            availability_status: 'Available',
            phoneNumber: '1234567890'
        });
        await donorProfile.save();
        expect(donorProfile.user_id).toBeDefined();
        expect(donorProfile.availability_status).toBe('Available');
        expect(donorProfile.phoneNumber).toBe('1234567890');
        expect(donorProfile.total_donations).toBe(0);
    });

    // Test the validation of required fields
    it('should throw an error if required fields are missing', async () => {
        try {
            const donorProfile = new DonorProfile({
                user_id: mongoose.Types.ObjectId()
            });
            await donorProfile.save();
        } catch (error) {
            expect(error.name).toBe('ValidationError');
        }
    });

    // Test the default value of total_donations
    it('should set the default value of total_donations to 0', async () => {
        const donorProfile = new DonorProfile({
            user_id: mongoose.Types.ObjectId(),
            availability_status: 'Available',
            phoneNumber: '1234567890'
        });
        await donorProfile.save();
        expect(donorProfile.total_donations).toBe(0);
    });

    // Test the update of a DonorProfile document
    it('should update a DonorProfile document', async () => {
        const donorProfile = new DonorProfile({
            user_id: mongoose.Types.ObjectId(),
            availability_status: 'Available',
            phoneNumber: '1234567890'
        });
        await donorProfile.save();
        donorProfile.availability_status = 'Unavailable';
        await donorProfile.save();
        expect(donorProfile.availability_status).toBe('Unavailable');
    });

    // Test the deletion of a DonorProfile document
    it('should delete a DonorProfile document', async () => {
        const donorProfile = new DonorProfile({
            user_id: mongoose.Types.ObjectId(),
            availability_status: 'Available',
            phoneNumber: '1234567890'
        });
        await donorProfile.save();
        await donorProfile.remove();
        const deletedDonorProfile = await DonorProfile.findById(donorProfile._id);
        expect(deletedDonorProfile).toBeNull();
    });
});