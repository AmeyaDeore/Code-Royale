import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import GlassCard from '../../components/ui/GlassCard';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await register(formData);

    setIsLoading(false);

    if (result.success) {
      navigate(`/${result.role}`);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-purple-500/10 blur-[100px] rounded-full point-events-none"></div>

      <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent mb-8 z-10">
        HealthSphere
      </Link>

      <GlassCard className="w-full max-w-md p-8 z-10">
        <h2 className="text-2xl font-bold text-textPrimary text-center mb-6">Create Account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-primary text-textPrimary"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-primary text-textPrimary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-lg focus:outline-none focus:border-primary text-textPrimary"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-textSecondary mb-1">I am a...</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="patient"
                  checked={formData.role === 'patient'}
                  onChange={handleChange}
                  className="accent-primary"
                />
                <span className="text-textPrimary">Patient</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="doctor"
                  checked={formData.role === 'doctor'}
                  onChange={handleChange}
                  className="accent-primary"
                />
                <span className="text-textPrimary">Doctor</span>
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 bg-primary text-white font-semibold rounded-lg hover:bg-primaryHover transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-textSecondary">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
        </p>
      </GlassCard>
    </div>
  );
};

export default Register;
