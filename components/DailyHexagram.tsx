
import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { HEXAGRAMS } from '../constants';
import { getDailyInsight } from '../services/geminiService';
import HexagramIcon from './HexagramIcon';
import ShareCard from './ShareCard';

interface DailyData {
  hexId: number;
  date: string;
  mnemonic: string;
  scenario: string;
  checkedIn: boolean;
}

const DailyHexagram: React.FC = () => {
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initDaily = async () => {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem('yilin_daily');
      let current: DailyData | null = saved ? JSON.parse(saved) : null;

      if (!current || current.date !== today) {
        // Pick a hexagram based on the date (simple deterministic hash)
        const dateHash = today.split('-').reduce((acc, part) => acc + parseInt(part), 0);
        const hexIndex = dateHash % HEXAGRAMS.length;
        const hex = HEXAGRAMS[hexIndex];

        setLoading(true);
        const insight = await getDailyInsight(hex.name, hex.meaning);
        
        current = {
          hexId: hex.id,
          date: today,
          mnemonic: insight.mnemonic,
          scenario: insight.scenario,
          checkedIn: false
        };
        localStorage.setItem('yilin_daily', JSON.stringify(current));
      }
      
      setDailyData(current);
      setLoading(false);
    };

    initDaily();
  }, []);

  const handleCheckIn = () => {
    if (dailyData) {
      const updated = { ...dailyData, checkedIn: true };
      setDailyData(updated);
      localStorage.setItem('yilin_daily', JSON.stringify(updated));
      
      // Optional: Add a small reward or sound effect here
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    
    try {
      setSharing(true);
      // Wait a bit for the card to be fully rendered in the hidden div
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#F4F1EA',
        logging: false,
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `zhiyi-daily-${dailyData?.date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate share image:', err);
    } finally {
      setSharing(false);
    }
  };

  if (loading || !dailyData) {
    return (
      <div className="w-full h-48 bg-white/50 rounded-xl animate-pulse flex items-center justify-center">
        <span className="text-[#A6937C] text-xs font-bold tracking-widest">正在感悟今日卦象...</span>
      </div>
    );
  }

  const hex = HEXAGRAMS.find(h => h.id === dailyData.hexId)!;

  return (
    <>
      <section className="relative group">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-[#A6937C]/30 shadow-xl overflow-hidden relative">
          {/* Background Texture/Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#9A2B2B]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-[#9A2B2B]" />
                <h3 className="text-xl font-black text-[#323232] tracking-[0.3em]">今日卦象</h3>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleShare}
                  disabled={sharing}
                  className="p-2 rounded-full bg-[#323232]/5 text-[#A6937C] hover:bg-[#9A2B2B]/10 hover:text-[#9A2B2B] transition-all active:scale-90"
                  title="分享卦象"
                >
                  {sharing ? (
                    <div className="w-4 h-4 border-2 border-[#9A2B2B] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 100-2.684 3 3 0 000 2.684zm0 9a3 3 0 100-2.684 3 3 0 000 2.684z" />
                    </svg>
                  )}
                </button>
                <div className="text-[10px] font-bold text-[#A6937C] tracking-widest uppercase opacity-60">
                  {dailyData.date}
                </div>
              </div>
            </div>

          <div className="flex gap-6 items-center mb-8">
            <div className="w-20 h-20 bg-[#F4F1EA] rounded-xl flex items-center justify-center shadow-inner border border-[#A6937C]/20">
              <HexagramIcon binary={hex.binary} size="md" />
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-black text-[#323232]">{hex.name}</span>
                <span className="text-sm font-bold text-[#9A2B2B] opacity-80 tracking-widest">第 {hex.sequence} 卦</span>
              </div>
              <p className="text-xs text-[#A6937C] font-medium tracking-wider">{hex.upperTrigram}上{hex.lowerTrigram}下 · {hex.meaning}</p>
            </div>
          </div>

          <div className="space-y-5 mb-8">
            <div className="bg-[#9A2B2B]/5 border-l-4 border-[#9A2B2B] p-4 rounded-r-lg">
              <span className="block text-[10px] font-black text-[#9A2B2B] uppercase tracking-[0.2em] mb-2">助记残影</span>
              <p className="text-lg font-black text-[#323232] leading-relaxed tracking-wide">
                {dailyData.mnemonic}
              </p>
            </div>

            <div className="px-1">
              <span className="block text-[10px] font-black text-[#A6937C] uppercase tracking-[0.2em] mb-2">现代启示</span>
              <p className="text-[13px] text-[#323232]/80 leading-relaxed font-medium">
                {dailyData.scenario}
              </p>
            </div>
          </div>

          <button
            onClick={handleCheckIn}
            disabled={dailyData.checkedIn}
            className={`w-full py-4 rounded-xl font-black tracking-[0.5em] transition-all duration-500 shadow-lg flex items-center justify-center gap-2
              ${dailyData.checkedIn 
                ? 'bg-[#2D5133] text-white cursor-default' 
                : 'bg-[#323232] text-[#F4F1EA] hover:bg-[#9A2B2B] active:scale-[0.98]'
              }`}
          >
            {dailyData.checkedIn ? (
              <>
                <span>已悟道</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </>
            ) : (
              '学习完成 · 打卡'
            )}
          </button>
        </div>
      </div>
    </section>
      
      <ShareCard 
        hex={hex}
        date={dailyData.date}
        mnemonic={dailyData.mnemonic}
        scenario={dailyData.scenario}
        cardRef={cardRef}
      />
    </>
  );
};

export default DailyHexagram;
