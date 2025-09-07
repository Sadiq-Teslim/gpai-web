import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// IMPORTANT: This password should be stored securely, but for an MVP,
// a hardcoded value is okay. Ask your backend team to provide a strong password.
const ADMIN_PASSWORD = 'admin123'; // <-- CHANGE THIS

const AdminLoginPage = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      // On success, set a flag in session storage and redirect
      sessionStorage.setItem('gpai-admin-auth', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold font-poppins text-dark-text mb-2">
          GPA<span className="text-primary">i</span> Admin Access
        </h1>
        <p className="text-light-text mb-8">Please enter the password to continue.</p>
        
        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary mb-4"
          />
          <button
            type="submit"
            className="w-full bg-primary text-white font-poppins font-medium text-lg px-8 py-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            Login
          </button>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;