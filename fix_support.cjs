const fs = require('fs');
let code = fs.readFileSync('src/pages/SupportPage.tsx', 'utf8');

// It looks like the regex missed matching the end of the file properly, appending to the bottom instead of replacing the old component.
// Let's rewrite the file completely since we only need the SupportPage component and imports.

const completeSupportPage = `
import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../lib/api';
import { SupportTicket } from '../types';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Clock,
  CheckCircle2,
  X,
  Phone,
  MessageSquare,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

interface SupportPageProps {
  onNavigate: (route: string) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
  const { user, showToast } = useApp();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const loadTickets = async () => {
    try {
      const data = await fetchApi<SupportTicket[]>('/support/tickets');
      setTickets(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (isChatOpen) {
      loadTickets();
      const interval = setInterval(loadTickets, 10000);
      return () => clearInterval(interval);
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [tickets, isChatOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    try {
      setSubmitting(true);
      const text = message;
      setMessage('');
      await fetchApi('/support/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject: 'লাইভ চ্যাট', message: text, category: 'general' })
      });
      await loadTickets();
    } catch (err: any) {
      showToast(err.message, 'error');
      setMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isChatOpen) {
    return (
      <div className="max-w-md mx-auto h-[calc(100vh-130px)] flex flex-col bg-[#efeae2] relative overflow-hidden font-sans shadow-xl">
        {/* WhatsApp-style Header */}
        <div className="bg-[#008069] text-white px-3 py-2.5 flex items-center justify-between shrink-0 shadow-md z-10">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsChatOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-0.5 shadow-sm">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=SupportTeam&backgroundColor=008069" alt="Support" className="w-full h-full rounded-full" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#008069] rounded-full"></div>
            </div>
            <div>
              <h2 className="font-bold text-sm flex items-center gap-1">
                Support Team <CheckCircle2 className="w-3 h-3 text-white bg-[#008069] rounded-full" />
              </h2>
              <p className="text-[10px] text-white/90">online</p>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
             <div className="w-1 h-4 flex flex-col justify-between items-center py-0.5">
               <div className="w-1 h-1 bg-white rounded-full"></div>
               <div className="w-1 h-1 bg-white rounded-full"></div>
               <div className="w-1 h-1 bg-white rounded-full"></div>
             </div>
          </button>
        </div>

        {/* WhatsApp-style Info Bar */}
        <div className="bg-white/95 px-3 py-1.5 flex items-center justify-between text-[9px] font-bold shadow-sm shrink-0 z-10 backdrop-blur-sm border-b border-slate-100">
           <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">Ticket #3746</span>
           <span className="text-[#008069] flex items-center gap-1">
             <div className="w-1.5 h-1.5 bg-[#008069] rounded-full"></div>
             Typically replies instantly
           </span>
        </div>

        {/* Chat Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-3 space-y-3 relative"
          style={{ 
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }}
        >
           {/* Date Badge */}
           <div className="flex justify-center my-3">
             <span className="bg-white shadow-sm text-slate-500 text-[9px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider">
               Today
             </span>
           </div>

           {/* Initial Welcome Message Box */}
           {tickets.length === 0 && !loadingTickets && (
             <div className="flex justify-center mb-6">
               <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-5 text-center max-w-[260px]">
                 <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                   <MessageSquare className="w-5 h-5 text-[#008069]" />
                 </div>
                 <h3 className="text-[13px] font-bold text-slate-800 mb-1">Start Conversation</h3>
                 <p className="text-[10px] text-slate-500 font-medium">আমাদের সাপোর্ট টিম অনলাইনে আছে। আপনার প্রশ্ন বা সমস্যা এখানে লিখুন।</p>
               </div>
             </div>
           )}

           {loadingTickets ? (
             <div className="text-center text-[11px] font-bold text-slate-500 bg-white/80 py-1.5 px-4 rounded-full w-max mx-auto shadow-sm">Loading chats...</div>
           ) : (
             [...tickets].reverse().map((t, idx) => (
                <div key={t.id || idx} className="space-y-2">
                  {/* User Message (Right Side) */}
                  <div className="flex justify-end">
                    <div className="bg-[#d9fdd3] text-slate-800 px-2.5 py-1.5 rounded-xl rounded-tr-none shadow-sm max-w-[85%] relative group">
                      <p className="text-xs leading-relaxed whitespace-pre-wrap pr-12">{t.message}</p>
                      <span className="text-[8px] text-slate-500 absolute bottom-1 right-2 flex items-center gap-0.5">
                        {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        <CheckCircle2 className="w-3 h-3 text-[#53bdeb]" />
                      </span>
                    </div>
                  </div>

                  {/* Admin Message (Left Side) */}
                  {t.adminReply && (
                    <div className="flex justify-start">
                      <div className="bg-white text-slate-800 px-2.5 py-1.5 rounded-xl rounded-tl-none shadow-sm max-w-[85%] relative border border-slate-50">
                        <p className="text-xs leading-relaxed whitespace-pre-wrap pr-12">{t.adminReply}</p>
                        <span className="text-[8px] text-slate-500 absolute bottom-1 right-2">
                          {new Date(t.repliedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
             ))
           )}
        </div>

        {/* WhatsApp-style Input Area */}
        <div className="bg-[#f0f2f5] p-2 shrink-0">
           <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
             <div className="flex-1 bg-white rounded-full flex items-center px-3 py-1.5 shadow-sm">
               <input 
                 type="text" 
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 placeholder="Message"
                 className="flex-1 bg-transparent border-none outline-none text-[13px] text-slate-800 placeholder-slate-400 py-1"
                 autoComplete="off"
               />
               <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors ml-1 cursor-pointer">
                 <Paperclip className="w-4 h-4 transform -rotate-45" />
               </button>
             </div>
             <button 
               type="submit" 
               disabled={submitting || !message.trim()}
               className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center text-white shrink-0 shadow-sm hover:bg-[#008f6f] transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
             >
               <Send className="w-4 h-4 ml-0.5" />
             </button>
           </form>
        </div>
      </div>
    );
  }

  // Initial Entry Page (Like image 2)
  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-4 pb-24 font-sans h-full flex flex-col items-center justify-center">
      <div className="w-full bg-white rounded-[24px] p-6 text-center shadow-xl border border-slate-100 relative overflow-hidden">
        {/* Top gradient border accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        
        {/* Logo/Icon */}
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 relative shadow-sm border border-indigo-100">
           <MessageSquare className="w-8 h-8 text-indigo-500" />
           <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white"></div>
        </div>

        <h1 className="text-xl font-black text-slate-800 mb-1">Live Support Team</h1>
        <p className="text-[11px] text-slate-500 font-bold mb-5">২৪/৭ হেল্পডেস্ক ও কাস্টমার কেয়ার সার্ভিস</p>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
           <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             সাপোর্ট টিম সক্রিয় আছে
           </span>
           <span className="bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
             <Clock className="w-3 h-3" />
             গড় উত্তর ১-২ মিনিট
           </span>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 mb-6 bg-slate-50 py-1.5 px-3 rounded-full w-max mx-auto border border-slate-200">
          <Clock className="w-3 h-3" />
          সকাল ৯টা - রাত ১২টা
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-[11px] text-slate-600 leading-relaxed mb-6 shadow-inner text-left font-medium">
          টাস্ক জমা, ডিপোজিট, উইথড্র কিংবা অ্যাকাউন্ট সংক্রান্ত যেকোনো জটিলতায় সরাসরি আমাদের অফিসিয়াল সাপোর্ট এজেন্টের সাথে কথা বলুন।
        </div>

        <button 
          onClick={() => setIsChatOpen(true)}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          সরাসরি চ্যাট শুরু করুন
        </button>

        <p className="text-[9px] font-bold text-slate-400 mt-4 flex items-center justify-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          আপনার তথ্য সম্পূর্ণ নিরাপদ ও গোপনীয়
        </p>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/pages/SupportPage.tsx', completeSupportPage);
console.log("Rewrote SupportPage completely");
