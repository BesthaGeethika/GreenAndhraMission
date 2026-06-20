import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sprout } from 'lucide-react';

interface Msg {
  role: 'user' | 'bot';
  text: string;
}

// Lightweight rule-based assistant (mock AI) used to answer mission queries
function answer(q: string): string {
  const t = q.toLowerCase();
  if (t.includes('password') || t.includes('login')) {
    return 'Your password follows the pattern GreenAndhra@DDMMYYYY where DDMMYYYY is your date of birth. Example: GreenAndhra@15082001.';
  }
  if (t.includes('sign up') || t.includes('register') || t.includes('create account')) {
    return 'Click "New user? Sign up" on the login page. Provide your name, email, date of birth, and a password in the GreenAndhra@DDMMYYYY format where the DOB matches your date of birth.';
  }
  if (t.includes('plant') && (t.includes('how') || t.includes('where'))) {
    return 'Head to the Location Selection page, pick your District, Mandal and Village, then go to Tree Registration and click "I Agree to Plant Trees". The system will assign you a Plant ID and a location.';
  }
  if (t.includes('reward') || t.includes('payment') || t.includes('money') || t.includes('bank')) {
    return 'Citizens earn ₹100–₹300 monthly based on tree health. Submit your bank account, IFSC and holder name in the Rewards page for verification.';
  }
  if (t.includes('upload') || t.includes('progress') || t.includes('photo')) {
    return 'Upload monthly photos (Month 1–4) in Tree Progress Tracking. Our AI verifies plant identity, growth and survival status (Healthy / Moderate / Needs Attention).';
  }
  if (t.includes('suggestion')) {
    return 'Use the Suggestion Portal to submit ideas like electric buses, solar projects, rainwater harvesting or pollution control. Government officers review each one.';
  }
  if (t.includes('climate') || t.includes('rainfall') || t.includes('groundwater')) {
    return 'Government officers update tree counts, groundwater level, air quality, rainfall and pollution in the Climate Dashboard. AI calculates a Tree Deficit Score per mandal.';
  }
  if (t.includes('dob') || t.includes('date of birth')) {
    return 'The date of birth you used at login is reused to verify your identity on later steps (Citizen Verification). If the DOB does not match, the step is rejected.';
  }
  if (t.includes('hello') || t.includes('hi') || t.startsWith('hey')) {
    return 'Hello! I am your Green Andhra Mission assistant. Ask me about login, planting, rewards, suggestions or climate data.';
  }
  return 'I can help with: password format, sign up, tree planting, rewards, progress uploads, suggestions, and climate data. What would you like to know?';
}

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'bot', text: 'Namaste! I am your Green Andhra Mission AI assistant. How can I help you today?' },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setInput('');
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'bot', text: answer(userMsg) }]);
    }, 400);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        aria-label="AI Assistant"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-[480px] animate-[fadeIn_0.2s_ease]">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4 rounded-t-2xl flex items-center gap-2">
            <Sprout className="w-5 h-5" />
            <div>
              <div className="font-semibold text-sm">Green Andhra Assistant</div>
              <div className="text-xs text-primary-100">AI-powered helper</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm ${
                    m.role === 'user' ? 'bg-primary-600 text-white rounded-br-md' : 'bg-gray-100 text-gray-700 rounded-bl-md'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask a question…"
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
            />
            <button onClick={send} className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-xl flex items-center justify-center flex-shrink-0">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
