
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProgress, MasteryLevel, UserTitle } from '../types';
import { HEXAGRAMS } from '../constants';

interface DashboardProps {
  progress: UserProgress[];
}

const Dashboard: React.FC<DashboardProps> = ({ progress }) => {
  const navigate = useNavigate();
  const masteredCount = progress.filter(p => p.mastery === 'MASTERED').length;
  const unstableCount = progress.filter(p => p.mastery === 'UNSTABLE').length;
  const weakCount = progress.filter(p => p.mastery === 'WEAK').length;
  
  // 统计有错误的卦象数量
  const errorItemsCount = progress.filter(p => p.errorCount > 0 || p.mastery === 'WEAK').length;

  const titleConfigs = [
    { title: UserTitle.TONG_SHENG, threshold: 0 },
    { title: UserTitle.XIU_CAI, threshold: 4 },
    { title: UserTitle.JU_REN, threshold: 12 },
    { title: UserTitle.JIN_SHI, threshold: 24 },
    { title: UserTitle.HAN_LIN, threshold: 36 },
    { title: UserTitle.ZONG_SHI, threshold: 48 },
    { title: UserTitle.YI_SHENG, threshold: 64 },
  ];

  const { currentTitle, nextTitle, neededForNext } = useMemo(() => {
    let current = titleConfigs[0].title;
    let next = titleConfigs[1].title;
    let needed = titleConfigs[1].threshold - masteredCount;

    for (let i = 0; i < titleConfigs.length; i++) {
      if (masteredCount >= titleConfigs[i].threshold) {
        current = titleConfigs[i].title;
        if (i < titleConfigs.length - 1) {
          next = titleConfigs[i+1].title;
          needed = titleConfigs[i+1].threshold - masteredCount;
        } else {
          next = UserTitle.YI_SHENG;
          needed = 0;
        }
      }
    }
    return { currentTitle: current, nextTitle: next, neededForNext: Math.max(0, needed) };
  }, [masteredCount]);

  const dailyQuotes = [
    "天行健，君子以自强不息。",
    "地势坤，君子以厚德载物。",
    "穷则变，变则通，通则久。",
    "顺天应人，随时而动。",
    "积善之家，必有余庆。",
    "温故而知新，可以为师矣。"
  ];

  const randomQuote = useMemo(() => dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)], []);

  const getMasteryColor = (level: MasteryLevel) => {
    switch (level) {
      case 'MASTERED': return 'bg-[#2D5133]'; 
      case 'UNSTABLE': return 'bg-[#A6937C]'; 
      case 'WEAK': return 'bg-[#9A2B2B]';     
      default: return 'bg-[#D4C4A8]/40';      
    }
  };

  return (
    <div className="space-y-6 py-2 animate-in fade-in duration-700">
      {/* 每日一卦 入口 */}
      <section 
        onClick={() => navigate('/daily')}
        className="relative group cursor-pointer"
      >
        <div className="bg-[#323232] rounded-xl p-5 text-[#F4F1EA] shadow-xl overflow-hidden border border-white/5 flex items-center justify-between transition-all hover:shadow-2xl active:scale-[0.98]">
          <div className="z-10 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#9A2B2B] rounded-full animate-pulse" />
              <h3 className="text-lg font-black tracking-[0.3em]">今日卦象</h3>
            </div>
            <p className="text-[9px] text-[#A6937C] font-bold tracking-[0.1em] uppercase opacity-80">
              感悟今日之变 · 开启每日修行
            </p>
          </div>
          
          <div className="z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[#A6937C]/30 flex items-center justify-center bg-[#F4F1EA]/5 group-hover:bg-[#9A2B2B] transition-colors duration-500">
              <svg className="w-5 h-5 text-[#F4F1EA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* 背景装饰 */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-[#9A2B2B]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
        </div>
      </section>

      {/* 修为卡片 */}
      <section className="bg-white/70 backdrop-blur-md rounded-lg p-6 border border-[#A6937C]/20 shadow-sm relative overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-[#9A2B2B]/5 rounded-full blur-3xl" />
        
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="px-1.5 py-4 bg-[#9A2B2B] text-[#F4F1EA] seal-font text-xs font-bold rounded-sm shadow-md">
              修为境界
            </div>
            <div className="flex flex-col">
              <h2 className="text-3xl font-black text-[#323232] mt-1 tracking-widest">{currentTitle}</h2>
              <div className="mt-1 space-y-0.5">
                <p className="text-[10px] text-[#A6937C] font-bold tracking-wider">
                  {neededForNext > 0 ? `下一境界：${nextTitle}` : '已至巅峰之境'}
                </p>
                {neededForNext > 0 && (
                  <p className="text-[9px] text-[#A6937C]/60 italic">尚需圆满 {neededForNext} 卦</p>
                )}
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
             <div className="flex items-baseline">
               <span className="text-2xl font-black text-[#9A2B2B]">{masteredCount}</span>
               <span className="text-[10px] text-[#A6937C] font-bold ml-1">/ 64</span>
             </div>
             <span className="text-[8px] text-[#A6937C] uppercase tracking-tighter mt-0.5">卦象圆满度</span>
          </div>
        </div>
        
        <div className="mt-6 flex gap-1 h-1 rounded-full overflow-hidden bg-[#D4C4A8]/20">
          <div className="bg-[#2D5133] h-full transition-all duration-1000" style={{ width: `${(masteredCount/64)*100}%` }} />
          <div className="bg-[#A6937C] h-full transition-all duration-1000" style={{ width: `${(unstableCount/64)*100}%` }} />
          <div className="bg-[#9A2B2B] h-full transition-all duration-1000" style={{ width: `${(weakCount/64)*100}%` }} />
        </div>
      </section>

      {/* 极简记忆图谱 */}
      <section>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-[11px] font-black text-[#323232] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#9A2B2B] rotate-45" />
            易象记忆图谱
          </h3>
          <div className="flex gap-2 text-[8px] text-[#A6937C] font-bold">
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#D4C4A8]/40" />未悟</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 bg-[#2D5133]" />圆满</div>
          </div>
        </div>

        <div className="flex">
          <div className="flex-1 grid grid-cols-8 gap-1.5 p-2 bg-[#D4C4A8]/5 rounded-lg border border-[#D4C4A8]/20">
            {HEXAGRAMS.map(h => {
              const p = progress.find(item => item.hexagramId === h.id);
              return (
                <div 
                  key={h.id} 
                  onClick={() => navigate(`/library?id=${h.id}`)}
                  className={`aspect-square rounded-sm ${getMasteryColor(p?.mastery || 'UNTOUCHED')} transition-all active:scale-90 hover:brightness-110 hover:shadow-md hover:z-30 cursor-pointer relative group border border-white/5 shadow-sm flex items-center justify-center`}
                >
                  <span className="text-[7px] text-white/20 font-black pointer-events-none transition-all group-hover:text-white/90 group-hover:scale-125">
                    {h.name[0]}
                  </span>
                  
                  {/* 精致悬浮提示 (Tooltip) */}
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="bg-[#323232] text-[#F4F1EA] text-[10px] font-black px-2.5 py-1.5 rounded shadow-2xl border border-[#A6937C]/40 whitespace-nowrap flex flex-col items-center gap-0.5">
                      <span className="text-[8px] text-[#A6937C] tracking-tighter opacity-70">第 {h.sequence} 卦</span>
                      <span className="tracking-[0.2em]">{h.name}</span>
                    </div>
                    {/* 小三角箭头 */}
                    <div className="w-2 h-2 bg-[#323232] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-[#A6937C]/40" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 修行路径 - 温故知新入口 */}
      <section>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="text-[11px] font-black text-[#323232] flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#9A2B2B] rotate-45" />
            修行路径
          </h3>
        </div>
        
        <div 
          className="w-full bg-[#323232] rounded-lg p-5 text-[#F4F1EA] flex items-center justify-between shadow-2xl relative overflow-hidden group border border-white/5 cursor-pointer"
          onClick={() => navigate('/test?mode=review')}
        >
          {/* 朱红侧边装饰条 */}
          <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#9A2B2B] transition-all group-hover:w-[6px]" />
          
          <div className="space-y-1 pl-4 z-10">
            <h4 className="text-base font-black tracking-widest text-white">温故知新</h4>
            <div className="flex items-center gap-2">
              <p className="text-[9px] text-[#A6937C] font-bold tracking-[0.2em] uppercase">针对弱项 · 专项强化</p>
              {errorItemsCount > 0 && (
                <span className="px-1.5 py-0.5 bg-[#9A2B2B]/20 text-[#FF6B6B] border border-[#9A2B2B]/30 text-[7px] font-black rounded-sm animate-pulse">
                  需复习 {errorItemsCount} 卦
                </span>
              )}
            </div>
          </div>
          
          <button 
            className="px-6 py-2 bg-[#9A2B2B] text-white rounded-sm text-[11px] font-black shadow-lg active:scale-95 transition-all z-10 tracking-widest"
          >
            启程
          </button>
          
          {/* 背景装饰纹理 */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
        </div>
      </section>

      {/* 用户社区入口 */}
      <section>
        <div 
          className="w-full bg-[#FBF9F5] rounded-lg p-5 border border-[#D4C4A8] flex items-center justify-between shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
          onClick={() => navigate('/community')}
        >
          <div className="flex items-center gap-4 z-10">
            <div className="w-10 h-10 bg-[#9A2B2B]/5 rounded-full flex items-center justify-center shadow-inner border border-[#9A2B2B]/20">
              <svg className="w-6 h-6 text-[#9A2B2B]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8 S16.41,20,12,20z M11,7h2v2h-2V7z M11,11h2v6h-2V11z" className="opacity-20" />
                <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="font-black text-[14px]" style={{ fontFamily: 'serif' }}>友</text>
              </svg>
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-black text-[#323232] tracking-widest">易友社区</h4>
              <p className="text-[9px] text-[#A6937C] font-bold tracking-[0.1em] uppercase">分享心得 · 共悟易道</p>
            </div>
          </div>
          
          <div className="z-10 flex items-center gap-2 text-[10px] font-black text-[#9A2B2B] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            进入社区
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* 装饰性细节 */}
          <div className="absolute -right-2 -bottom-2 w-16 h-16 bg-[#323232]/5 rounded-full blur-xl" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#D4C4A8] opacity-40" />
        </div>
      </section>

      {/* 易道语录模块 */}
      <section className="relative px-4 py-4 border-t border-[#A6937C]/10 flex flex-col items-center justify-center overflow-hidden text-center opacity-80">
        <p className="text-[11px] font-bold text-[#323232]/60 tracking-[0.2em] leading-loose italic">
          「 {randomQuote} 」
        </p>
      </section>
    </div>
  );
};

export default Dashboard;
