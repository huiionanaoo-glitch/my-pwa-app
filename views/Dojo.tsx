
import React from 'react';
import { useNavigate } from 'react-router-dom';

const VisualIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const StructureIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 3H3v7h18V3ZM21 14H3v7h18v-7Z" />
    <path d="M12 3v18M7 3v18M17 3v18" opacity="0.2" />
  </svg>
);

const LogicIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 2.1l4 4-4 4" />
    <path d="M3 12.2v-2a4 4 0 0 1 4-4h14" />
    <path d="M7 21.9l-4-4 4-4" />
    <path d="M21 11.8v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const ComprehensiveIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

const Dojo: React.FC = () => {
  const navigate = useNavigate();

  const trainingModes = [
    { 
      id: 'visual', 
      title: '视觉辨识', 
      desc: '观象识卦，明察秋毫', 
      icon: <VisualIcon />, 
      color: 'bg-white border-[#D4C4A8] hover:border-[#323232] text-[#323232]',
      iconBg: 'bg-[#323232]/5 text-[#323232]'
    },
    { 
      id: 'structure', 
      title: '结构拆解', 
      desc: '上下相合，体悟乾坤', 
      icon: <StructureIcon />, 
      color: 'bg-white border-[#D4C4A8] hover:border-[#A6937C] text-[#A6937C]',
      iconBg: 'bg-[#A6937C]/10 text-[#A6937C]'
    },
    { 
      id: 'logic', 
      title: '逻辑变换', 
      desc: '变通趋时，错综复杂', 
      icon: <LogicIcon />, 
      color: 'bg-white border-[#D4C4A8] hover:border-[#9A2B2B] text-[#9A2B2B]',
      iconBg: 'bg-[#9A2B2B]/10 text-[#9A2B2B]'
    },
    { 
      id: 'comprehensive', 
      title: '综合考核', 
      desc: '万象归一，圆通广大', 
      icon: <ComprehensiveIcon />, 
      color: 'bg-[#323232] border-[#323232] text-[#F4F1EA]',
      iconBg: 'bg-white/10 text-white'
    }
  ];

  const startPractice = (id: string) => {
    navigate(`/test?mode=${id}`);
  };

  return (
    <div className="space-y-10 py-6">
      <header className="flex items-end gap-3 border-b border-[#A6937C]/20 pb-4">
         <h2 className="text-2xl font-black text-[#323232] tracking-widest">演武试炼</h2>
      </header>

      <div className="grid gap-6">
        {trainingModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => startPractice(mode.id)}
            className={`flex items-center p-6 rounded-lg border-2 transition-all hover:translate-x-2 active:scale-95 text-left group shadow-sm ${mode.color}`}
          >
            <div className={`w-14 h-14 flex items-center justify-center rounded-full mr-6 shadow-inner transition-colors ${mode.iconBg}`}>
              {mode.icon}
            </div>
            <div className="flex-1">
               <h3 className="font-black text-xl tracking-wider">{mode.title}</h3>
               <p className="text-[10px] font-bold opacity-70 mt-1 uppercase tracking-widest">{mode.desc}</p>
            </div>
            <div className="w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xl">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="m9 18 6-6-6-6"/>
               </svg>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-10 p-8 bg-[#FBF9F5] rounded-lg border border-[#D4C4A8] text-[#323232] relative overflow-hidden shadow-sm">
         <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#9A2B2B]/20" />
         <div className="absolute top-0 right-0 w-32 h-32 bg-[#9A2B2B]/5 rounded-full blur-2xl" />
         
         <h4 className="text-[10px] font-black text-[#9A2B2B] mb-4 uppercase tracking-[0.3em]">师尊箴言</h4>
         <p className="text-lg leading-relaxed font-bold italic tracking-wide">
           "熟读王弼，心领神会。卦象本天成，妙手偶得之。"
         </p>
         
         <div className="mt-6 flex gap-3">
            <span className="text-[9px] px-3 py-1 bg-[#323232] text-white rounded-full font-bold uppercase tracking-widest shadow-sm"># 错综逻辑</span>
            <span className="text-[9px] px-3 py-1 bg-[#A6937C] text-white rounded-full font-bold uppercase tracking-widest shadow-sm"># 八宫卦</span>
         </div>
      </div>
    </div>
  );
};

export default Dojo;
