import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import axios from 'axios'
import { ToastContainer } from 'react-toastify'
import Login from './login'

jest.mock('axios')

describe('Login component', () => {
  const setUser = jest.fn()
  const navigate = jest.fn()
  const base_url = 'https://example.com'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the login form', () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter>
        <Login setUser={setUser} />
        <ToastContainer />
      </MemoryRouter>
    )

    expect(getByText('Welcome Back')).toBeInTheDocument()
    expect(getByPlaceholderText('Enter your email')).toBeInTheDocument()
    expect(getByPlaceholderText('Enter your password')).toBeInTheDocument()
  })

  it('submits the form with valid credentials', async () => {
    axios.post.mockResolvedValue({ data: { success: true } })
    axios.get.mockResolvedValue({ data: { success: true, user: { id: 1, name: 'John Doe' } } })

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter>
        <Login setUser={setUser} />
        <ToastContainer />
      </MemoryRouter>
    )

    const emailInput = getByPlaceholderText('Enter your email')
    const passwordInput = getByPlaceholderText('Enter your password')
    const submitButton = getByText('Sign In')

    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(setUser).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1))
  })

  it('displays an error message with invalid credentials', async () => {
    axios.post.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } })

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter>
        <Login setUser={setUser} />
        <ToastContainer />
      </MemoryRouter>
    )

    const emailInput = getByPlaceholderText('Enter your email')
    const passwordInput = getByPlaceholderText('Enter your password')
    const submitButton = getByText('Sign In')

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.change(passwordInput, { target: { value: 'invalid-password' } })
    fireEvent.click(submitButton)

    await waitFor(() => expect(getByText('Invalid credentials')).toBeInTheDocument())
  })

  it('renders the primary action button with a green background color', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Login setUser={setUser} />
        <ToastContainer />
      </MemoryRouter>
    )

    const submitButton = getByText('Sign In')

    expect(submitButton).toHaveClass('bg-green-600')
  })

  it('disables the submit button while loading', () => {
    const { getByText } = render(
      <MemoryRouter>
        <Login setUser={setUser} />
        <ToastContainer />
      </MemoryRouter>
    )

    const submitButton = getByText('Sign In')

    expect(submitButton).not.toBeDisabled()

    axios.post.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ data: { success: true } }), 1000)))

    fireEvent.click(submitButton)

    expect(submitButton).toBeDisabled()
  })
})
