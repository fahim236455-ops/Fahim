import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { fetchApi } from '../lib/api';
import { Users2, Copy, Share2, Check, Sparkles, Gift, UserCheck, Trophy, Crown, Medal } from 'lucide-react';

export const TeamPage: React.FC = () => {
  const { user, settings, showToast } = useApp();
  const [teamData, setTeamData] = useState<{
    referralCode: string;
    referralLink: string;
    totalReferrals: number;
    rewardedReferralsCount: number;
    referralEarnings: number;
    rewardPerReferral: number;
    referredUsers: Array<{
      id: string;
      name: string;
      phone: string;
      registeredAt: string;
      status: 'registered' | 'rewarded';
      rewardAmount: number;
    }>;
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [leaderboard, setLeaderboard] = useState<Array<{
    id: string;
    name: string;
    successfulReferrals: number;
    avatar?: string;
    earnings: number;
  }>>([]);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchApi('/team'),
      fetchApi('/team/leaderboard')
    ])
      .then(([teamRes, leadRes]) => {
        setTeamData(teamRes);
        setLeaderboard(leadRes.leaderboard);
      })
      .catch((err) => showToast(err.message || 'টিম ডেটা লোড ব্যর্থ হয়েছে', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const referralCode = teamData?.referralCode || user?.referralCode || 'FPB101';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const referralLink = `${origin}/register?ref=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('রেফারেল লিংক কপি করা হয়েছে!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${settings?.brandName || 'FahimPay BD'} - ঘরে বসে আয় করুন`,
          text: `${settings?.brandName || 'FahimPay BD'}-এ জয়েন করুন এবং প্রতিদিন ২০০-৫০০ টাকা আয় করুন। আমার রেফারেল লিংক:`,
          url: referralLink,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4 pb-24 font-['Hind_Siliguri',sans-serif] text-slate-100">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
          <Users2 className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-black text-white tracking-tight">মাই টিম ও রেফারেল প্রোগ্রাম</h1>
          <p className="text-xs text-slate-400 font-medium">বন্ধুদের রেফার করে আনলিমিটেড আয় করুন</p>
        </div>
      </div>

      {/* Referral Hero Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 text-white p-5 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] text-amber-200/80 uppercase tracking-wider font-semibold">
                প্রতি সফল রেফারে
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                ৳{teamData?.rewardPerReferral ?? settings?.referralReward ?? 50} টাকা
              </div>
            </div>
          </div>
          <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/30">
            লাইফটাইম বোনাস
          </span>
        </div>

        {/* Link Box */}
        <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>আপনার রেফারেল কোড: <strong className="text-amber-400 font-mono text-sm">{referralCode}</strong></span>
            <span className="text-slate-500">লিংক শেয়ার করুন</span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 rounded-xl p-1.5 border border-slate-800">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="bg-transparent text-xs text-amber-200 font-mono flex-1 outline-none truncate px-2"
            />
            <button
              onClick={handleCopy}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black px-3 py-2 rounded-lg flex items-center gap-1 shrink-0 transition-transform active:scale-95 cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
            </button>
            <button
              onClick={handleShare}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold p-2 rounded-lg flex items-center shrink-0 transition-colors border border-slate-700 cursor-pointer"
              title="শেয়ার"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 font-medium block mb-1">মোট রেফারেল সদস্য</span>
          <div className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Users2 className="w-5 h-5 text-amber-400" />
            <span>{teamData?.totalReferrals ?? 0} জন</span>
          </div>
          <span className="text-xs text-emerald-400 font-semibold mt-1 block">
            {teamData?.rewardedReferralsCount ?? 0} জন সফল
          </span>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-md">
          <span className="text-xs text-slate-400 font-medium block mb-1">মোট রেফারেল আয়</span>
          <div className="text-xl sm:text-2xl font-black text-amber-400 flex items-center gap-1">
            <span>৳{(teamData?.referralEarnings ?? 0).toFixed(2)}</span>
          </div>
          <span className="text-xs text-slate-400 font-medium mt-1 block">
            সরাসরি ব্যালেন্সে যোগ
          </span>
        </div>
      </div>

      {/* Referral Policy Notice */}
      <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20 text-xs text-amber-200 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>রেফারেল বোনাসের নিয়মাবলী:</span>
        </div>
        <p className="text-amber-100/80 leading-relaxed">
          আপনার রেফারেল লিংকের মাধ্যমে কোনো বন্ধু যুক্ত হওয়ার পর তিনি যখন তাঁর <strong>প্রথম বৈধ টাস্কটি</strong> সফলভাবে সম্পন্ন করবেন, তখনই স্বয়ংক্রিয়ভাবে আপনার ব্যালেন্সে <strong>৳৫০ টাকা</strong> ক্রেডিট হবে।
        </p>
      </div>

      
      {/* Top 10 Leaderboard */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-md overflow-hidden mt-6">
        <div className="bg-gradient-to-r from-amber-500/10 to-transparent p-4 border-b border-amber-500/20 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-sm font-bold text-white">টপ ১০ রেফারার (লিডারবোর্ড)</h2>
        </div>
        
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-800 border border-slate-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs font-medium">
            এখনও কোনো লিডারবোর্ড ডেটা নেই। বেশি বেশি রেফার করুন!
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {leaderboard.map((user, idx) => (
              <div key={user.id} className="p-3 flex items-center justify-between hover:bg-slate-800/40 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center">
                    {idx === 0 ? <Crown className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" /> :
                     idx === 1 ? <Medal className="w-5 h-5 text-slate-300" /> :
                     idx === 2 ? <Medal className="w-5 h-5 text-amber-700" /> :
                     <span className="text-sm font-bold text-slate-500">#{idx + 1}</span>}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{user.name}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{user.successfulReferrals} টি সফল রেফার</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-amber-400 block tracking-wide">
                    ৳ {user.earnings.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Referred Users List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-white">আপনার আমন্ত্রিত সদস্যবৃন্দ</h2>
          <span className="text-xs text-slate-400 font-medium">
            {teamData?.referredUsers.length || 0} জন
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !teamData || teamData.referredUsers.length === 0 ? (
          <div className="bg-slate-900/60 rounded-2xl p-8 text-center border border-slate-800 text-slate-400 text-sm space-y-2 shadow-inner">
            <Users2 className="w-8 h-8 text-slate-500 mx-auto" />
            <p>আপনার রেফারেল লিংকে এখনও কেউ যুক্ত হয়নি।</p>
            <button
              onClick={handleShare}
              className="text-xs text-amber-400 font-bold hover:underline cursor-pointer"
            >
              এখনই বন্ধুদের সাথে লিংক শেয়ার করুন
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {teamData.referredUsers.map((ref) => (
              <div
                key={ref.id}
                className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 shadow-sm flex items-center justify-between hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-xs flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{ref.name}</h4>
                    <p className="text-[11px] text-slate-400">{ref.phone}</p>
                  </div>
                </div>

                <div className="text-right">
                  {ref.status === 'rewarded' ? (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      ৳{ref.rewardAmount} বোনাস প্রাপ্ত
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                      টাস্ক অপেক্ষমান
                    </span>
                  )}
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(ref.registeredAt).toLocaleDateString('bn-BD')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
