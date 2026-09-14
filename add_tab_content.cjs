const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminPanelPage.tsx', 'utf8');

const tabContent = `
        {/* ========================================================= */}
        {/* USER JOBS TAB */}
        {/* ========================================================= */}
        {activeTab === 'user_jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-700">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  ইউজার জব রিকোয়েস্ট
                </h2>
                <p className="text-xs text-slate-400 mt-1">ইউজারদের পোস্ট করা মাইক্রো জবগুলো রিভিউ করুন।</p>
              </div>
            </div>

            <div className="space-y-3">
              {pendingUserJobs.length === 0 ? (
                <div className="text-center py-10 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                  <p className="text-slate-400 text-sm">কোনো জব রিকোয়েস্ট নেই।</p>
                </div>
              ) : (
                pendingUserJobs.map((job) => (
                  <div key={job.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 space-y-3 shadow-sm">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-white">{job.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          পোস্ট করেছেন: {job.userFullName} ({job.userEmail})
                        </p>
                      </div>
                      <span className={\`text-[10px] font-bold px-2 py-0.5 rounded border \${
                        job.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : job.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }\`}>
                        {job.status === 'pending' ? 'পেন্ডিং' : job.status === 'active' ? 'অ্যাক্টিভ' : 'বাতিলকৃত'}
                      </span>
                    </div>

                    <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700/50 space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2 text-slate-300">
                        <p><span className="text-slate-500">ক্যাটাগরি:</span> {job.mainCategory} > {job.subCategory}</p>
                        <p><span className="text-slate-500">ওয়ার্কার:</span> {job.workersNeeded} জন</p>
                        <p><span className="text-slate-500">ওয়ার্কার প্রতি খরচ:</span> ৳{job.costPerWorker.toFixed(2)}</p>
                        <p><span className="text-slate-500">মোট চার্জ:</span> ৳{job.totalPayable.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">নির্দেশনা:</span>
                        <p className="text-slate-300 whitespace-pre-wrap">{job.instructions}</p>
                      </div>
                      {job.targetUrl && (
                        <div>
                          <span className="text-slate-500 block mb-1">টার্গেট লিংক:</span>
                          <a href={job.targetUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline break-all">
                            {job.targetUrl}
                          </a>
                        </div>
                      )}
                    </div>

                    {job.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetchApi(\`/admin/user-jobs/\${job.id}/review\`, {
                                method: 'POST',
                                body: JSON.stringify({ status: 'active' }),
                              });
                              showToast(res.message, 'success');
                              loadData();
                            } catch (e: any) {
                              showToast(e.message, 'error');
                            }
                          }}
                          className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs py-2 rounded-xl border border-emerald-500/20 transition-colors"
                        >
                          অ্যাপ্রুভ করুন
                        </button>
                        <button
                          onClick={() => {
                            requireConfirmation('আপনি কি নিশ্চিত যে এই জবটি বাতিল করবেন? ইউজার তার ব্যালেন্স রিফান্ড পেয়ে যাবে।', async () => {
                              try {
                                const res = await fetchApi(\`/admin/user-jobs/\${job.id}/review\`, {
                                  method: 'POST',
                                  body: JSON.stringify({ status: 'rejected' }),
                                });
                                showToast(res.message, 'success');
                                loadData();
                              } catch (e: any) {
                                showToast(e.message, 'error');
                              }
                            });
                          }}
                          className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs py-2 rounded-xl border border-rose-500/20 transition-colors"
                        >
                          বাতিল ও রিফান্ড
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
`;

const targetPoint = code.indexOf('{/* ========================================================= */}');
code = code.slice(0, targetPoint) + tabContent + code.slice(targetPoint);
fs.writeFileSync('src/pages/AdminPanelPage.tsx', code);
console.log("Added tab content");
