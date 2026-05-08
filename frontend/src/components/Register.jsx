import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, ChevronLeft, MapPin } from 'lucide-react';
import axios from 'axios';

const base_url = import.meta.env.VITE_BASE_URL

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    blood_group: '',
    location: {
      address: '',
      coordinates: {
        latitude: null,
        longitude: null
      }
    }
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const navigate = useNavigate();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    if (e.target.name === 'address') {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          address: e.target.value,
          coordinates: {
            latitude: null,
            longitude: null
          }
        }
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const geocodeAddress = async () => {
    const address = formData.location.address;
    if (!address) {
      setError('Please enter a location');
      return false;
    }

    setGeocoding(true);
    try {
      // Add more parameters to improve geocoding accuracy
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          addressdetails: 1,
          limit: 1,
          'accept-language': 'en' // Prefer English results - note the quotes around the hyphenated property
        },
        // Add a delay to respect Nominatim's usage policy (1 request per second)
        timeout: 10000 // 10 second timeout
      });

      console.log('Geocoding response:', response.data); // Debug response
      
      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        
        // Format display address from returned data if available
        const displayName = response.data[0].display_name || address;
        
        setFormData({
          ...formData,
          location: {
            address: displayName,
            coordinates: {
              latitude: parseFloat(lat),
              longitude: parseFloat(lon)
            }
          }
        });
        
        return true;
      } else {
        setError('Could not find coordinates for the entered location. Try adding more details (city, country).');
        return false;
      }
    } catch (err) {
      console.error('Geocoding error details:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('Geocoding request timed out. Please try again later.');
      } else if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Geocoding error (${err.response.status}): ${err.response.data.message || 'Server error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from geocoding service. Check your internet connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Error geocoding address. Please enter a valid location with city and country.');
      }
      
      return false;
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Geocode the address before submission if coordinates are not already set
    if (!formData.location.coordinates.latitude || !formData.location.coordinates.longitude) {
      const geocodeSuccess = await geocodeAddress();
      if (!geocodeSuccess) return;
    }

    setLoading(true);
    
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...dataToSend } = formData;
      
      const response = await axios.post(`${base_url}/api/auth/register`, dataToSend);
      
      if (response.data.success) {
        setSuccess('Registration successful! You can now log in.');
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-red-600 py-4">
          <div className="flex justify-center items-center">
            <HeartPulse className="text-white mr-2" size={32} />
            <h2 className="text-2xl font-bold text-white">LifeShare</h2>
          </div>
          <p className="text-center text-red-100 text-sm mt-1">Blood Donation Network</p>
        </div>
        
        <div className="p-6">
          <div className="mb-6 flex items-center">
            <Link to="/login" className="text-red-600 hover:text-red-800 flex items-center">
              <ChevronLeft size={16} />
              <span>Back to Login</span>
            </Link>
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Your Account</h2>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="blood_group">
                  Blood Group
                </label>
                <select
                  id="blood_group"
                  name="blood_group"
                  required
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select your blood group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Create a password"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="address">
                Location (City/Area)
              </label>
              <div className="flex">
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={formData.location.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter city, region, country (e.g., Toronto, Ontario, Canada)"
                />
                <button
                  type="button"
                  onClick={geocodeAddress}
                  disabled={geocoding || !formData.location.address}
                  className={`flex items-center justify-center px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 ${
                    geocoding || !formData.location.address ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <MapPin size={18} className="text-gray-600" />
                </button>
              </div>
              {geocoding && (
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Searching for location...</span>
                </p>
              )}
              {formData.location.coordinates.latitude && formData.location.coordinates.longitude && (
                <p className="mt-2 text-sm text-green-600">
                  <span className="font-medium">Location detected:</span> {formData.location.coordinates.latitude.toFixed(4)}, {formData.location.coordinates.longitude.toFixed(4)}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                For best results, include the city and country (e.g., "New York, USA" or "Mumbai, India")
              </p>
            </div>
            
            <button
              type="submit"
              disabled={loading || geocoding}
              className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md font-medium ${
                (loading || geocoding) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
              }`}
            >
              {loading ? 'Registering...' : (geocoding ? 'Getting location...' : 'Register')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-red-600 hover:text-red-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
