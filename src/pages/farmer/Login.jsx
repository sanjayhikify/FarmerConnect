import AuthLayout from '../../components/AuthLayout'
import { inputClass } from '../../components/FarmerShell'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import API from '../../api'

function Login() {
  const navigate = useNavigate()
  const { signInFarmer } = useApp()

  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setIsSubmitting(true)

    const normalizedPhone = phone.replace(/\D/g, '')
    const normalizedPin = pin.trim()

    try {
      const response = await API.post('/login', {
        phone: normalizedPhone,
        pin: normalizedPin,
      })

      const loggedInFarmer = response.data.farmer

      // Keep the PostgreSQL farmer in the app state
      signInFarmer({
        id: loggedInFarmer.id,
        name: loggedInFarmer.full_name,
        phone: loggedInFarmer.phone_number,
      })

      window.alert('Login successful!')

      navigate('/book-slot')
    } catch (error) {
      console.error(error)

      setError(
        error.response?.data?.detail ||
        'Invalid Phone Number or PIN. Please try again.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div>
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0da678]">
            Secure access
          </p>

          <h1 className="mt-2 text-2xl font-black text-[#142a24]">
            Welcome back
          </h1>

          <p className="mt-1 text-sm text-[#829490]">
            Sign in to manage your produce and bookings.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          aria-busy={isSubmitting}
          className="grid gap-4"
        >
          <label className="grid gap-2 text-xs font-bold text-[#405955]">
            Phone Number

            <input
              required
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength="10"
              className={`${inputClass} pointer-events-auto opacity-100`}
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value)
                setError('')
              }}
              placeholder="Enter your phone number"
            />
          </label>

          <label className="grid gap-2 text-xs font-bold text-[#405955]">
            4-Digit PIN

            <input
              required
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              pattern="[0-9]{4}"
              minLength="4"
              maxLength="4"
              className={`${inputClass} pointer-events-auto opacity-100`}
              value={pin}
              onChange={(event) => {
                setPin(event.target.value)
                setError('')
              }}
              placeholder="Enter your 4-digit PIN"
            />
          </label>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-[#fff0e8] px-3 py-2 text-xs font-semibold text-[#a55025]"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-[#08a979] px-4 py-3 text-sm font-bold text-white hover:bg-[#078e67] disabled:opacity-60"
          >
            {isSubmitting ? 'Signing in...' : 'Continue to portal'}
          </button>

          <p className="text-center text-xs text-[#71847f]">
            New Farmer?{' '}
            <Link
              to="/register"
              className="font-bold text-[#078e67] hover:underline"
            >
              Register Here
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default Login