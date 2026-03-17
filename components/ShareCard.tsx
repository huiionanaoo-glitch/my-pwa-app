
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import HexagramIcon from './HexagramIcon';
import { Hexagram } from '../types';

interface ShareCardProps {
  hex: Hexagram;
  date: string;
  mnemonic: string;
  scenario: string;
  cardRef: React.RefObject<HTMLDivElement>;
}

const ShareCard: React.FC<ShareCardProps> = ({ hex, date, mnemonic, scenario, cardRef }) => {
  return (
    <div className="fixed -left-[9999px] top-0">
      <div 
        ref={cardRef}
        className="w-[375px] bg-[#F4F1EA] p-8 relative overflow-hidden flex flex-col gap-6"
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#323232]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

        {/* Header */}
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-[#9A2B2B]" />
            <h3 className="text-xl font-black text-[#323232] tracking-[0.3em]">今日卦象</h3>
          </div>
          <div className="text-[10px] font-bold text-[#A6937C] tracking-widest uppercase opacity-60">
            {date}
          </div>
        </div>

        {/* Hexagram Info */}
        <div className="flex gap-6 items-center relative z-10">
          <div className="w-24 h-24 flex items-center justify-center">
            <HexagramIcon binary={hex.binary} size="lg" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-4xl font-black text-[#323232]">{hex.name}</span>
              <span className="text-sm font-bold text-[#9A2B2B] opacity-80 tracking-widest">第 {hex.sequence} 卦</span>
            </div>
            <p className="text-xs text-[#A6937C] font-medium tracking-wider">{hex.upperTrigram}上{hex.lowerTrigram}下 · {hex.meaning}</p>
          </div>
        </div>

        {/* Mnemonic & Scenario */}
        <div className="space-y-6 relative z-10 flex-1">
          <div className="bg-[#9A2B2B]/5 border-l-4 border-[#9A2B2B] p-5 rounded-r-lg">
            <span className="block text-[10px] font-black text-[#9A2B2B] uppercase tracking-[0.2em] mb-2">助记残影</span>
            <p className="text-xl font-black text-[#323232] leading-relaxed tracking-wide">
              {mnemonic}
            </p>
          </div>

          <div className="px-1">
            <span className="block text-[10px] font-black text-[#A6937C] uppercase tracking-[0.2em] mb-2">现代启示</span>
            <p className="text-sm text-[#323232]/80 leading-relaxed font-medium">
              {scenario}
            </p>
          </div>
        </div>

        {/* Footer with App Info and QR Code */}
        <div className="pt-8 border-t border-[#A6937C]/20 flex justify-between items-end relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border border-[#A6937C]/40 rounded-full flex items-center justify-center p-1">
               <div className="w-full h-full bg-[#323232] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#F4F1EA] rounded-full translate-x-1"></div>
               </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-[#323232] tracking-[0.4em]">知易</h1>
              <p className="text-[8px] text-[#A6937C] font-bold tracking-widest uppercase mt-0.5">感悟易道 · 开启智慧</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="p-1 rounded-lg border border-[#A6937C]/10">
              <QRCodeSVG value={window.location.origin} size={64} level="H" bgColor="transparent" />
            </div>
            <span className="text-[7px] text-[#A6937C] font-bold tracking-tighter uppercase">扫码开启修行</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareCard;
