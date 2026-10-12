import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import './App.css'
import { useApp } from './context/AppContext'
import AuthLayout from './components/AuthLayout'
import Register from './pages/farmer/Register'
import SlotBooking from './pages/farmer/SlotBooking'
import Queue from './pages/farmer/Queue'
import Status from './pages/farmer/Status'
import Login from './pages/farmer/Login'
import Dashboard from './pages/admin/Dashboard'
import ScanToken from './pages/admin/ScanToken'
import QualityEntry from './pages/admin/QualityEntry'
import Inventory from './pages/admin/Inventory'
import TestBackend from './pages/farmer/TestBackend'
import { MandiProvider } from './pages/admin/MandiContext'

function Home() {
  return (
    <AuthLayout>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0da678]">
          Farmer procurement
        </p>

        <h1 className="mt-2 text-2xl font-black text-[#142a24]">
          Welcome to AgriFlow
        </h1>

        <p className="mt-2 text-sm text-[#829490]">
          Sign in or register to manage your produce journey.
        </p>

        <div className="mt-6 grid gap-3">
          <a
            href="/login"
            className="rounded-lg bg-[#08a979] px-4 py-3 text-sm font-bold text-white"
          >
            Sign in
          </a>

          <a
            href="/register"
            className="rounded-lg border border-[#d6e2df] px-4 py-3 text-sm font-bold text-[#31524a]"
          >
            Register
          </a>

          <Link
            to="/admin/dashboard"
            className="text-sm font-bold text-[#31524a]"
          >
            Open admin dashboard
          </Link>
        </div>
      </div>
    </AuthLayout>
  )
}

function AdminHome() {
  return (
    <div className="app">
      <nav className="navbar">
        <h2>FarmerConnect</h2>

        <div className="nav-links">
          <Link to="/">Farmer home</Link>
          <Link to="/admin/dashboard">Admin Dashboard</Link>
          <Link to="/admin/scan">Scan Token</Link>
          <Link to="/admin/quality">Quality Entry</Link>
          <Link to="/admin/inventory">Inventory</Link>
        </div>
      </nav>
    </div>
  )
}

function StepRoute({ step, children }) {
  const { farmer, booking, paymentUnlocked } = useApp()

  const unlocked =
    step === 'register' ||
    (step === 'book' && farmer) ||
    (step === 'queue' && farmer && booking) ||
    (step === 'status' && farmer && booking && paymentUnlocked)

  if (!unlocked) {
    return (
      <Navigate
        to={
          step === 'book'
            ? '/login'
            : step === 'queue'
              ? '/book-slot'
              : '/queue'
        }
        replace
      />
    )
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <MandiProvider>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/home" element={<AdminHome />} />

          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />

          <Route
            path="/book-slot"
            element={
              <StepRoute step="book">
                <SlotBooking />
              </StepRoute>
            }
          />

          <Route
            path="/queue"
            element={
              <StepRoute step="queue">
                <Queue />
              </StepRoute>
            }
          />

          <Route
            path="/status"
            element={
              <StepRoute step="status">
                <Status />
              </StepRoute>
            }
          />

          <Route path="/admin/dashboard" element={<Dashboard />} />

          <Route path="/admin/scan" element={<ScanToken />} />

          <Route path="/admin/quality" element={<QualityEntry />} />

          <Route path="/admin/inventory" element={<Inventory />} />

          {/* Temporary PostgreSQL + FastAPI test */}
          <Route path="/test-backend" element={<TestBackend />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MandiProvider>
    </BrowserRouter>
  )
}

export default App