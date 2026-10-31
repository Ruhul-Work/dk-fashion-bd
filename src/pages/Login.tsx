import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { toast } from 'react-hot-toast';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  document.title = 'Login | Smart Garments';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await (login as any)(phone, password);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Invalid phone or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24 min-h-screen flex items-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-ivory border border-hairline rounded-[1.6rem] shadow-soft p-8"
      >
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl tracking-tight text-moss uppercase mb-2">
            Welcome <span className="text-caramel">Back</span>
          </h1>
          <p className="text-[10px] uppercase tracking-widest text-olive">Sign in to access your orders and profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-[12px] uppercase tracking-widest text-center">{error}</p>}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-medium text-olive mb-2">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full rounded-2xl bg-sand border border-hairline px-4 py-4 text-sm text-moss focus:border-caramel outline-none transition-colors"
              placeholder="0123456789"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-medium text-olive mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl bg-sand border border-hairline px-4 py-4 text-sm text-moss focus:border-caramel outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-moss text-ivory py-5 text-xs font-medium uppercase tracking-[0.2em] hover:bg-caramel transition-all disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center uppercase tracking-widest">
          <p className="text-[10px] text-olive">
            New to Smart Garments? <Link to="/signup" className="text-caramel-deep font-medium underline underline-offset-4">Create an account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
