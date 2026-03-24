import { Link } from 'react-router-dom';
import { Shield, Activity, Video } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-textPrimary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full point-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full point-events-none"></div>

      <div className="z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Welcome to <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">HealthSphere</span>
        </h1>
        <p className="text-xl md:text-2xl text-textSecondary mb-10 max-w-2xl">
          The autonomous, AI-powered healthcare platform for seamless patient monitoring and telemedicine.
        </p>

        <div className="flex gap-4 mb-16">
          <Link
            to="/login"
            className="px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primaryHover transition-colors shadow-lg shadow-primary/25"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-8 py-4 bg-surface text-textPrimary font-semibold rounded-xl hover:bg-surfaceHover transition-colors border border-white/10"
          >
            Create Account
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <GlassCard className="p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">Real-time Monitoring</h3>
            <p className="text-textSecondary text-sm">Track vitals continuously with AI-driven insights warning you of potential issues.</p>
          </GlassCard>
          <GlassCard className="p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-bold mb-2">Telemedicine</h3>
            <p className="text-textSecondary text-sm">Connect with your doctors instantly via high-quality video consultations.</p>
          </GlassCard>
          <GlassCard className="p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-success" />
            </div>
            <h3 className="text-lg font-bold mb-2">Secure Data</h3>
            <p className="text-textSecondary text-sm">Your health data is encrypted and securely stored, accessible only to authorized personnel.</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Landing;
