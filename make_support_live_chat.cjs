const fs = require('fs');
let code = fs.readFileSync('src/pages/SupportPage.tsx', 'utf8');

// replace my-tickets text to live-chat
code = code.replace(/<span>আমার টিকিটসমূহ<\/span>/g, "<span>লাইভ চ্যাট<\/span>");

// We already have a support chat poll API but it's not fully a live chat UI.
// So let's transform the my-tickets section into a live chat.
const ticketSectionRegex = /{\/\* TAB 3: MY SUBMITTED TICKETS \*\/}[\s\S]*?{\/\* Screenshot Modal preview if clicked \*\//;

const liveChatCode = `
      {/* TAB 3: LIVE CHAT (REPLACED MY SUBMITTED TICKETS) */}
      {activeTab === 'my-tickets' && (
        <div className="flex flex-col bg-slate-900 rounded-2xl border border-slate-800 shadow-md h-[60vh] relative animate-in fade-in duration-150">
          
          <div className="bg-slate-950 p-3 rounded-t-2xl border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                   <MessageSquare className="w-4 h-4" />
                </div>
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950"></div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">অ্যাডমিন সাপোর্ট (লাইভ)</h3>
                <p className="text-[10px] text-emerald-400">আমরা অনলাইনে আছি, আপনার সমস্যা বলুন</p>
              </div>
            </div>
            <button onClick={loadTickets} className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer" title="রিফ্রেশ">
               <Clock className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
             {loadingTickets ? (
               <div className="text-center text-xs text-slate-400 mt-4">লোড হচ্ছে...</div>
             ) : tickets.length === 0 ? (
               <div className="text-center mt-10">
                 <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                   <HelpCircle className="w-6 h-6 text-slate-500" />
                 </div>
                 <p className="text-slate-300 text-sm font-bold">কোনো মেসেজ নেই</p>
                 <p className="text-slate-500 text-xs mt-1">নিচে আপনার মেসেজ লিখে অ্যাডমিনকে সেন্ড করুন</p>
               </div>
             ) : (
                [...tickets].reverse().map(t => (
                  <div key={t.id} className="space-y-4">
                     {/* User Message */}
                     <div className="flex justify-end">
                       <div className="bg-amber-500/20 border border-amber-500/30 text-amber-50 px-3 py-2 rounded-2xl rounded-tr-none max-w-[85%]">
                         <p className="text-xs whitespace-pre-wrap">{t.message}</p>
                         <span className="text-[9px] text-amber-500/60 block mt-1 text-right">{new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                     </div>
                     {/* Admin Reply */}
                     {t.adminReply && (
                       <div className="flex justify-start">
                         <div className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 rounded-2xl rounded-tl-none max-w-[85%]">
                            <p className="text-xs whitespace-pre-wrap leading-relaxed">{t.adminReply}</p>
                            <span className="text-[9px] text-slate-400 block mt-1">{new Date(t.repliedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                       </div>
                     )}
                  </div>
                ))
             )}
          </div>

          <div className="p-3 bg-slate-950 border-t border-slate-800 rounded-b-2xl shrink-0">
             <form 
               onSubmit={async (e) => {
                 e.preventDefault();
                 const msg = (e.target.elements.chatMsg).value;
                 if(!msg) return;
                 (e.target.elements.chatMsg).value = '';
                 
                 // Simulating sending ticket logic 
                 try {
                   setSubmitting(true);
                   const res = await fetchApi('/support/tickets', {
                      method: 'POST',
                      body: JSON.stringify({ subject: 'লাইভ চ্যাট', message: msg, category: 'general' })
                   });
                   await loadTickets();
                 } catch(err) {
                   showToast(err.message, 'error');
                 } finally {
                   setSubmitting(false);
                 }
               }} 
               className="flex items-center gap-2"
             >
               <input 
                 name="chatMsg"
                 type="text"
                 placeholder="মেসেজ লিখুন..."
                 className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                 autoComplete="off"
               />
               <button type="submit" disabled={submitting} className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50 hover:bg-amber-400 transition-colors">
                  <Send className="w-4 h-4 ml-1" />
               </button>
             </form>
          </div>
        </div>
      )}

      {/* Screenshot Modal preview if clicked */
`;

code = code.replace(ticketSectionRegex, liveChatCode);
fs.writeFileSync('src/pages/SupportPage.tsx', code);
console.log("Replaced tickets with Live Chat");
