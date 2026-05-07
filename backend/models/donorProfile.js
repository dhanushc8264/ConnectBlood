import mongoose from 'mongoose';

const DonorProfileSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    availability_status: { 
        type: String, 
        required: true 
    },
    total_donations: { 
        type: Number, 
        default: 0 
    },
    eligibility_date: { 
        type: Date 
    },
    phoneNumber: {
        type: String,
        required: true
    },
    badges: [{ 
        type: String 
    }]
}, { timestamps: true });

export default mongoose.model('DonorProfile', DonorProfileSchema);