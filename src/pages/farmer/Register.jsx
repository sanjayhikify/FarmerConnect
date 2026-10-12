import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/AuthLayout';
import { Field, inputClass } from '../../components/FarmerShell';
import API from '../../api';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    village: '',
    district: '',
    landSize: '',
    pin: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post('/farmers', {
        name: formData.name,
        phone: formData.phone,
        pin: formData.pin,
      });

      console.log(response.data);

      window.alert('Account created successfully! Please sign in.');
      navigate('/login');
    } catch (error) {
      console.error(error);

      window.alert(
        error.response?.data?.message || 'Could not create account.'
      );
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit}>
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0da678]">
            Farmer sign-up
          </p>

          <h1 className="mt-2 text-2xl font-black text-[#142a24]">
            Create your farmer profile
          </h1>

          <p className="mt-1 text-sm text-[#829490]">
            Save your permanent identity details and access PIN.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name">
            <input
              className={inputClass}
              type="text"
              autoComplete="name"
              placeholder="e.g. Harish Kumar"
              value={formData.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  name: e.target.value,
                })
              }
              required
            />
          </Field>

          <Field label="Phone">
            <input
              className={inputClass}
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              pattern="[0-9]{10}"
              placeholder="10-digit mobile number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  phone: e.target.value,
                })
              }
              required
            />
          </Field>

          <Field label="Village / town">
            <input
              className={inputClass}
              type="text"
              placeholder="e.g. Sanganer"
              value={formData.village}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  village: e.target.value,
                })
              }
              required
            />
          </Field>

          <Field label="District">
            <input
              className={inputClass}
              type="text"
              placeholder="e.g. Jaipur"
              value={formData.district}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  district: e.target.value,
                })
              }
              required
            />
          </Field>

          <Field label="Land Holding (acres)">
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.1"
              placeholder="e.g. 12"
              value={formData.landSize}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  landSize: e.target.value,
                })
              }
              required
            />
          </Field>

          <Field label="4-Digit PIN">
            <input
              className={inputClass}
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              pattern="[0-9]{4}"
              minLength="4"
              maxLength="4"
              placeholder="Create a 4-digit PIN"
              value={formData.pin}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pin: e.target.value,
                })
              }
              required
            />
          </Field>
        </div>

        <button
          type="submit"
          className="mt-7 w-full rounded-lg bg-[#08a979] px-4 py-3.5 text-sm font-bold text-white shadow-[0_7px_18px_rgba(8,169,121,0.18)] transition hover:bg-[#078e67] sm:w-auto"
        >
          Create Account & Continue →
        </button>
      </form>
    </AuthLayout>
  );
}