import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { toast } from 'react-hot-toast';

import { usePageTitle } from '../lib/usePageTitle'

export default function Signup() {
  usePageTitle('Sign Up')
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  document.title = 'Signup | Smart Garments';

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      const msg = 'Passwords do not match';
      setError(msg);
      toast.error(msg);
      return;
    }
    setIsLoading(true);
    setError('');
    try {
     const res =  await api.register({
        name,
        email,
        phone,
        username,
        password,
        password_confirmation: passwordConfirmation
      });
      if(res.success){
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full rounded-2xl bg-sand border border-hairline px-4 py-3 text-sm text-moss focus:border-caramel outline-none transition-colors";

  return (
    <div className="max-w-md mx-auto px-4 py-24 min-h-screen flex items-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-ivory border border-hairline rounded-[1.6rem] shadow-soft p-8"
      >
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl text-moss tracking-tight uppercase mb-2">
            Create <span className="text-caramel">Account</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-olive">Join Us for a curated experience.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-[12px] uppercase tracking-widest text-center">{error}</p>}

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-medium text-olive mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-medium text-olive mb-2">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-medium text-olive mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-medium text-olive mb-2">Email Address (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-medium text-olive mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest font-medium text-olive mb-2">Confirm Password</label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-moss text-ivory py-5 mt-4 text-xs font-medium uppercase tracking-[0.2em] hover:bg-caramel transition-all disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center uppercase tracking-widest">
          <p className="text-[10px] text-olive">
            Already have an account? <Link to="/login" className="text-caramel-deep font-medium underline underline-offset-4">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
