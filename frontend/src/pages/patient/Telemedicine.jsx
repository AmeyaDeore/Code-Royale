import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, UserSquare2, Maximize2, Settings } from 'lucide-react';

const Telemedicine = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('id');
  
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Mock vitals changing in real-time
  const [vitals, setVitals] = useState({ hr: 72, bp: '120/80', o2: 98 });

  useEffect(() => {
    if (!isConnected) return;
    
    const interval = setInterval(() => {
      setVitals(prev => ({
        ...prev,
        hr: prev.hr + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3),
        o2: prev.o2 === 100 ? 99 : prev.o2 + (Math.random() > 0.8 ? 1 : -1) * Math.floor(Math.random() * 2),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const handleEndCall = () => {
    setIsConnected(false);
    // In real app, redirect or show rating modal
  };

  if (!isConnected) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center bg-black/40 rounded-3xl border border-white/10">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">Call Ended</h2>
        <p className="text-textSecondary mb-8">Thank you for using HealthSphere Telemedicine.</p>
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primaryHover transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Main Video Area */}
      <div className="flex-1 relative bg-black/60 rounded-3xl border border-white/10 overflow-hidden flex flex-col items-center justify-center">
        
        {/* Placeholder for Remote Video */}
        {!isVideoMuted ? (
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 flex flex-col items-center justify-center">
             <UserSquare2 className="w-32 h-32 text-white/20 mb-4" />
             <p className="text-white/50 animate-pulse">Waiting for Dr. Sarah to join...</p>
           </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <UserSquare2 className="w-24 h-24 text-white/20" />
          </div>
        )}

        {/* Self Video PIP */}
        <div className="absolute top-6 right-6 w-48 h-32 bg-gray-900 rounded-xl border border-white/20 overflow-hidden shadow-2xl">
           <div className="w-full h-full flex flex-col items-center justify-center text-white/30 bg-gray-800">
             Self Camera View
           </div>
        </div>

        {/* Top Controls Overlay */}
        <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
          <span className="text-sm font-medium text-white tracking-wider">00:04:23</span>
        </div>

        {/* Bottom Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-6 shadow-2xl">
          <button 
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className={`p-4 rounded-full transition-colors ${isAudioMuted ? 'bg-danger text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <button 
            onClick={() => setIsVideoMuted(!isVideoMuted)}
            className={`p-4 rounded-full transition-colors ${isVideoMuted ? 'bg-danger text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
          </button>

          <button 
            onClick={handleEndCall}
            className="p-4 bg-danger rounded-full text-white hover:bg-red-600 transition-colors shadow-lg shadow-danger/30"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          <div className="w-px h-8 bg-white/20 mx-2"></div>

          <button className="p-3 bg-white/5 text-textSecondary rounded-full hover:bg-white/10 hover:text-white transition-colors">
            <Maximize2 className="w-5 h-5" />
          </button>
          <button className="p-3 bg-white/5 text-textSecondary rounded-full hover:bg-white/10 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Side Panel: Live Vitals */}
      <div className="w-80 flex flex-col gap-4">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex-1 max-h-[50%] flex flex-col">
          <h3 className="text-sm font-semibold text-textSecondary mb-4">Live Patient Vitals</h3>
          
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
              <span className="text-sm text-textSecondary">Heart Rate</span>
              <span className="text-xl font-bold text-danger flex items-center gap-2">
                {vitals.hr} <span className="text-xs text-danger/70 font-normal">bpm</span>
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
              <span className="text-sm text-textSecondary">Blood Pressure</span>
              <span className="text-xl font-bold text-primary">{vitals.bp}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
              <span className="text-sm text-textSecondary">Oxygen (SpO2)</span>
              <span className="text-xl font-bold text-success">{vitals.o2}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex-1 flex flex-col">
           <h3 className="text-sm font-semibold text-textSecondary mb-4">Session Notes</h3>
           <textarea 
             className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-textPrimary resize-none focus:outline-none focus:border-primary/50"
             placeholder="Jot down notes during the call..."
           ></textarea>
        </div>
      </div>
    </div>
  );
};

export default Telemedicine;
