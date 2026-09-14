import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../lib/api';
import { SupportTicket, ChatMessage } from '../types';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Clock,
  CheckCircle2,
  X,
  MessageSquare,
  Image as ImageIcon,
} from 'lucide-react';

export const formatWhatsAppLink = (number: string) => {
  return "https://wa.me/" + number.replace(/[^0-9]/g, "");
};

export const formatTelegramLink = (username: string) => {
  return "https://t.me/" + username.replace('@', '');
};

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
  const [attachment, setAttachment] = useState<string | null>(null);
  const [selectedScreenshotUrl, setSelectedScreenshotUrl] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const interval = setInterval(loadTickets, 8000);
      return () => clearInterval(interval);
    }
  }, [isChatOpen]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [tickets, isChatOpen, attachment]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('শুধুমাত্র ছবি ফাইল নির্বাচন করুন', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('ফাইলের সাইজ সর্বোচ্চ 5MB হতে পারবে', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !attachment) return;

    try {
      setSubmitting(true);
      const textToSend = message;
      const attachToSend = attachment;

      setMessage('');
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      await fetchApi('/support/chat/send', {
        method: 'POST',
        body: JSON.stringify({
          text: textToSend,
          attachmentUrl: attachToSend || undefined,
        }),
      });

      await loadTickets();
    } catch (err: any) {
      showToast(err.message || 'মেসেজ পাঠাতে সমস্যা হয়েছে', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isChatOpen) {
    const allMessages: { msg: ChatMessage; ticketId: string }[] = [];
    
    const sortedTickets = [...tickets].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    sortedTickets.forEach((t) => {
      if (t.messages && t.messages.length > 0) {
        t.messages.forEach((m) => {
          allMessages.push({ msg: m, ticketId: t.id });
        });
      } else {
        allMessages.push({
          msg: {
            id: `init-${t.id}`,
            sender: 'user',
            text: t.message,
            timestamp: t.createdAt,
          },
          ticketId: t.id,
        });
        if (t.adminReply) {
          allMessages.push({
            msg: {
              id: `reply-${t.id}`,
              sender: 'agent',
              text: t.adminReply,
              timestamp: t.repliedAt || t.updatedAt,
            },
            ticketId: t.id,
          });
        }
      }
    });

    return (
      <div className="max-w-md mx-auto h-[calc(100vh-130px)] flex flex-col bg-[#efeae2] relative overflow-hidden font-sans shadow-xl">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

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
          <button onClick={loadTickets} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer" title="রিফ্রেশ">
             <Clock className="w-4 h-4" />
          </button>
        </div>

        {/* WhatsApp-style Info Bar */}
        <div className="bg-white/95 px-3 py-1.5 flex items-center justify-between text-[9px] font-bold shadow-sm shrink-0 z-10 backdrop-blur-sm border-b border-slate-100">
           <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">Live Ticket Support</span>
           <span className="text-[#008069] flex items-center gap-1">
             <div className="w-1.5 h-1.5 bg-[#008069] rounded-full animate-ping"></div>
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
           <div className="flex justify-center my-2">
             <span className="bg-white shadow-xs text-slate-500 text-[9px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider border border-slate-100">
               Today
             </span>
           </div>

           {/* Initial Welcome Message Box */}
           {allMessages.length === 0 && !loadingTickets && (
             <div className="flex justify-center mb-6">
               <div className="bg-white shadow-sm border border-slate-100 rounded-2xl p-5 text-center max-w-[260px]">
                 <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                   <MessageSquare className="w-5 h-5 text-[#008069]" />
                 </div>
                 <h3 className="text-[13px] font-bold text-slate-800 mb-1">Start Conversation</h3>
                 <p className="text-[10px] text-slate-500 font-medium">আমাদের সাপোর্ট টিম অনলাইনে আছে। আপনার প্রশ্ন বা সমস্যার স্ক্রিনশট সংযুক্ত করে পাঠান।</p>
               </div>
             </div>
           )}

           {loadingTickets ? (
             <div className="text-center text-[11px] font-bold text-slate-500 bg-white/80 py-1.5 px-4 rounded-full w-max mx-auto shadow-sm">মেসেজ লোড হচ্ছে...</div>
           ) : (
             allMessages.map(({ msg }) => {
                const isUser = msg.sender === 'user';
                return (
                  <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`px-3 py-2 rounded-xl shadow-xs max-w-[85%] relative ${
                        isUser 
                          ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-none' 
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                      }`}
                    >
                      {/* Text */}
                      {msg.text && (
                        <p className="text-xs leading-relaxed whitespace-pre-wrap pr-10">{msg.text}</p>
                      )}

                      {/* Attachment Image */}
                      {msg.attachmentUrl && (
                        <div className="mt-1">
                          <img
                            src={msg.attachmentUrl}
                            alt="Attachment"
                            onClick={() => setSelectedScreenshotUrl(msg.attachmentUrl || null)}
                            className="max-h-48 max-w-full rounded-lg object-contain bg-black/5 cursor-pointer hover:opacity-90 transition-opacity border border-slate-200/60"
                          />
                        </div>
                      )}

                      {/* Time & Double Check */}
                      <span className="text-[8px] text-slate-500 flex items-center gap-0.5 justify-end mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isUser && <CheckCircle2 className="w-3 h-3 text-[#53bdeb] inline" />}
                      </span>
                    </div>
                  </div>
                );
             })
           )}
        </div>

        {/* Attachment Preview Box */}
        {attachment && (
          <div className="bg-[#f0f2f5] px-3 pt-2 pb-1 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative w-12 h-12 bg-black/10 rounded-lg overflow-hidden border border-slate-300">
                <img src={attachment} alt="Selected attachment" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-700 block flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  ছবি সংযুক্ত করা হয়েছে
                </span>
                <span className="text-[9px] text-slate-500">মেসেজের সাথে সেন্ড হবে</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachment(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-full transition-colors cursor-pointer"
              title="বাদ দিন"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* WhatsApp-style Input Area */}
        <div className="bg-[#f0f2f5] p-2 shrink-0">
           <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
             <div className="flex-1 bg-white rounded-full flex items-center px-3 py-1.5 shadow-sm">
               <input 
                 type="text" 
                 value={message}
                 onChange={(e) => setMessage(e.target.value)}
                 placeholder={attachment ? "ছবির সাথে ক্যাপশন লিখুন..." : "মেসেজ লিখুন..."}
                 className="flex-1 bg-transparent border-none outline-none text-[13px] text-slate-800 placeholder-slate-400 py-1"
                 autoComplete="off"
               />
               <button 
                 type="button" 
                 onClick={() => fileInputRef.current?.click()}
                 className={`p-1.5 transition-colors ml-1 cursor-pointer rounded-full ${
                   attachment ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-slate-600'
                 }`}
                 title="ছবি সংযুক্ত করুন"
               >
                 <Paperclip className="w-4 h-4 transform -rotate-45" />
               </button>
             </div>
             <button 
               type="submit" 
               disabled={submitting || (!message.trim() && !attachment)}
               className="w-10 h-10 bg-[#00a884] rounded-full flex items-center justify-center text-white shrink-0 shadow-sm hover:bg-[#008f6f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
             >
               <Send className="w-4 h-4 ml-0.5" />
             </button>
           </form>
        </div>

        {/* Screenshot Modal preview if clicked */}
        {selectedScreenshotUrl && (
          <div
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={() => setSelectedScreenshotUrl(null)}
          >
            <div className="relative max-w-xl max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-2">
              <button
                type="button"
                onClick={() => setSelectedScreenshotUrl(null)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 z-10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={selectedScreenshotUrl}
                alt="Screenshot Preview"
                className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
              />
            </div>
          </div>
        )}
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
          টাস্ক জমা, ডিপোজিট, উইথড্র কিংবা অ্যাকাউন্ট সংক্রান্ত যেকোনো জটিলতায় সরাসরি আমাদের অফিসিয়াল সাপোর্ট এজেন্টের সাথে কথা বলুন। ছবি বা স্ক্রিনশট সংযুক্ত করার সুবিধা রয়েছে।
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
