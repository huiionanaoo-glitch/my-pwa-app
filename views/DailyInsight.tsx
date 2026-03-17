
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DailyHexagram from '../components/DailyHexagram';

const DailyInsight: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 py-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-2 mb-2">
        <button 
          onClick={() => navigate('/')}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[#323232]/5 text-[#323232] hover:bg-[#323232]/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-[10px] font-black text-[#A6937C] tracking-[0.2em] uppercase">返回主页</span>
      </div>
      
      <DailyHexagram />
      
      <div className="px-4 py-8 text-center">
        <p className="text-[10px] text-[#A6937C] font-medium leading-relaxed italic opacity-60">
          “易与天地准，故能弥纶天地之道。”
        </p>
      </div>
    </div>
  );
};

export default DailyInsight;
