import { useState, useRef, useEffect } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { Send, Bot, User } from 'lucide-react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I'm your HealthSphere AI Assistant. I can help triage symptoms or answer health questions. How are you feeling today?",
      triageLevel: 'low'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI Response latency
    setTimeout(() => {
      // Simple mock logic based on keywords
      let response = {
        triageLevel: 'low',
        message: 'I recommend resting and drinking plenty of fluids.',
        recommendedAction: 'Rest'
      };

      const lowerInput = userMsg.text.toLowerCase();
      if (lowerInput.includes('chest pain') || lowerInput.includes('breathing')) {
        response = {
          triageLevel: 'high',
          message: 'CRITICAL: Your symptoms indicate a potentially serious condition. Please seek emergency medical attention immediately or call your local emergency number.',
          recommendedAction: 'Call Emergency Services'
        };
      } else if (lowerInput.includes('fever') || lowerInput.includes('cough')) {
        response = {
          triageLevel: 'medium',
          message: 'You may have an infection. Monitor your temperature. If it exceeds 103°F or lasts more than 3 days, consult a doctor.',
          recommendedAction: 'Schedule Telemedicine Consult'
        };
      } else {
        response = {
          triageLevel: 'low',
          message: 'Based on your input, this appears to be a minor issue. Ensure you stay hydrated and get adequate rest.',
          recommendedAction: 'Monitor Symptoms'
        };
      }

      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now() + 1, 
          sender: 'ai', 
          ...response 
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  // Map triage levels to colors
  const triageColors = {
    low: 'border-primary/20 bg-primary/5',
    medium: 'border-warning/50 bg-warning/10',
    high: 'border-danger border bg-danger/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]',
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-textPrimary">AI Health Assistant</h1>
        <p className="text-textSecondary">Initial symptom triage and health guidance.</p>
      </div>

      <GlassCard className="flex-1 flex flex-col p-0 overflow-hidden relative">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === 'user' ? 'bg-purple-500/20 text-purple-400' : 'bg-primary/20 text-primary'
                }`}
              >
                {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div 
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.sender === 'user' 
                    ? 'bg-purple-500/10 border border-purple-500/20 text-textPrimary' 
                    : `${triageColors[msg.triageLevel]} text-textPrimary`
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text || msg.message}</p>
                {msg.recommendedAction && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <span className="text-xs font-semibold uppercase tracking-wider text-textSecondary mr-2">Recommended:</span>
                    <span className="text-sm font-medium">{msg.recommendedAction}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                 <Bot size={16} />
               </div>
               <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-1 items-center">
                 <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                 <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                 <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-textPrimary focus:outline-none focus:border-primary transition-colors"
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="bg-primary hover:bg-primaryHover text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center w-12 h-12"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
};

export default AIAssistant;
