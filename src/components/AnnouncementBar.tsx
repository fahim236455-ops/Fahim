import React from 'react';
import { useApp } from '../context/AppContext';
import { Megaphone } from 'lucide-react';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useApp();

  const notice =
    settings?.announcement ||
    '📢 স্বাগতম! Earnora-তে প্রতিটি টাস্ক সম্পূর্ণ করে এবং বন্ধুদের রেফার করে নিশ্চিত আয় করুন। উইথড্র রিকোয়েস্ট ১২-২৪ ঘণ্টার মধ্যে সফলভাবে বিকাশ, নগদ ও রকেটে পরিশোধ করা হয়।';

  return (
    <div className="bg-emerald-50 border-y border-emerald-200/80 px-3 py-2 text-emerald-900 text-xs font-medium flex items-center gap-2 overflow-hidden shadow-xs">
      <div className="flex items-center gap-1 text-emerald-700 font-bold shrink-0 bg-emerald-100/80 px-2 py-0.5 rounded-md">
        <Megaphone className="w-3.5 h-3.5 animate-bounce text-emerald-600" />
        <span>নোটিশ:</span>
      </div>
      <div className="overflow-hidden whitespace-nowrap flex-1">
        <div className="inline-block animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
          {notice}
        </div>
      </div>
    </div>
  );
};
