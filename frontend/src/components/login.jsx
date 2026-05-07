import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'
import axios from 'axios'
import { toast, ToastContainer } from "react-toastify"


const base_url = import.meta.env.VITE_BASE_URL

const Login = ({setUser}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
  
    try {
      const response = await axios.post(
        `${base_url}/api/auth/login`,
        formData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        toast.success('Login successful!');

        // 2. Fetch user data immediately after login
        const userResponse = await axios.get(
          `${base_url}/api/auth/check`,
          { withCredentials: true }
        );

        console.log("Response from /check:", userResponse.data);

        
        if (userResponse.data.success && userResponse.data.user) {
          // 3. Update the user state in the parent component
          setUser(userResponse.data.user);

          // 4. Navigate to home page
          navigate('/');
      
        }
      } else {
        setError(response.data.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      console.error('Login error:', err)
      // Error handling code
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-red-600 py-4">
          <div className="flex justify-center items-center">
            <HeartPulse className="text-white mr-2" size={32} />
            <h2 className="text-2xl font-bold text-white">LifeShare</h2>
          </div>
          <p className="text-center text-red-100 text-sm mt-1">Blood Donation Network</p>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">Welcome Back</h2>
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
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
            
            <div className="mb-6">
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
                placeholder="Enter your password"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-green-600 text-white py-2 px-4 rounded-md font-medium ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'}`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '} 
              <Link to="/register" className="text-red-600 hover:text-red-800 font-medium">
                Register now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login