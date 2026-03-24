import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, UserSquare2, Maximize2, Settings, FileText, Pill } from 'lucide-react';

const Consultation = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('id');
  
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Mock patient vitals
  const [vitals, setVitals] = useState({ hr: 85, bp: '135/88', o2: 97 });

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      setVitals(prev => ({
        ...prev,
        hr: prev.hr + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const handleEndCall = () => {
    setIsConnected(false);
  };

  if (!isConnected) {
    return (
      <div className="h-[calc(100vh-8rem)] flex flex-col items-center justify-center bg-black/40 rounded-3xl border border-white/10">
        <h2 className="text-2xl font-bold text-textPrimary mb-4">Consultation Ended</h2>
        <div className="flex gap-4 mt-6">
          <button 
            className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
          >
            Review Session Notes
          </button>
          <button 
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primaryHover transition-colors"
          >
            Return to Schedule
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Main Video Area */}
      <div className="flex-1 relative bg-black/60 rounded-3xl border border-white/10 overflow-hidden flex flex-col items-center justify-center">
        {!isVideoMuted ? (
           <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-500/10 flex flex-col items-center justify-center">
             <UserSquare2 className="w-32 h-32 text-white/20 mb-4" />
             <p className="text-white/50 animate-pulse">Patient John Doe is waiting...</p>
           </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <UserSquare2 className="w-24 h-24 text-white/20" />
          </div>
        )}

        {/* Self Video PIP */}
        <div className="absolute top-6 right-6 w-48 h-32 bg-gray-900 rounded-xl border border-white/20 overflow-hidden shadow-2xl">
           <div className="w-full h-full flex flex-col items-center justify-center text-white/30 bg-gray-800">
             Self view
           </div>
        </div>

        {/* Top Overlay */}
        <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
          <span className="text-sm font-medium text-white tracking-wider">00:00:00</span>
        </div>

        {/* Bottom Controls */}
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

      {/* Side Panel: Patient Info & Tools */}
      <div className="w-80 flex flex-col gap-4">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shrink-0">
          <h3 className="text-sm font-semibold text-textSecondary mb-4">Patient Telemetry</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-textSecondary">Heart Rate</span>
              <span className={`text-lg font-bold ${vitals.hr > 100 ? 'text-warning' : 'text-primary'}`}>{vitals.hr} bpm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-textSecondary">Blood Pressure</span>
              <span className="text-lg font-bold text-primary">{vitals.bp}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-textSecondary">SpO2</span>
              <span className="text-lg font-bold text-success">{vitals.o2}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex-1 flex flex-col overflow-hidden">
           <div className="flex border-b border-white/10">
             <button className="flex-1 py-3 text-sm font-medium text-primary border-b-2 border-primary bg-primary/5 cursor-pointer">
                Clinical Notes
             </button>
             <button className="flex-1 py-3 text-sm font-medium text-textSecondary hover:bg-white/5 cursor-pointer">
                Prescribe
             </button>
           </div>
           <div className="p-4 flex-1 flex flex-col">
             <textarea 
               className="flex-1 bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-textPrimary resize-none focus:outline-none focus:border-primary/50"
               placeholder="Enter subjective, objective, assessment, and plan (SOAP) notes..."
             ></textarea>
             <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium">
               Save Notes
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Consultation;
