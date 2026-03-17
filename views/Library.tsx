
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HEXAGRAMS } from '../constants';
import HexagramIcon from '../components/HexagramIcon';
import { Hexagram } from '../types';
import { getMnemonic } from '../services/geminiService';

const Library: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // 初始化卦象：优先检查 URL 参数，否则默认展示第6卦（剥卦）或第一卦
  const initialId = parseInt(searchParams.get('id') || '');
  const initialHex = HEXAGRAMS.find(h => h.id === initialId) || HEXAGRAMS[5];

  const [baseHex, setBaseHex] = useState<Hexagram>(initialHex);
  const [activeTransform, setActiveTransform] = useState<'ZONG' | 'CUO' | null>(null);
  const [showIndex, setShowIndex] = useState(false);
  const [indexMode, setIndexMode] = useState<'PALACE' | 'SQUARE'>('PALACE');
  const [mnemonic, setMnemonic] = useState<string>('');
  const [isLoadingMnemonic, setIsLoadingMnemonic] = useState(false);
  const [isRandomMode, setIsRandomMode] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // 滑动手势引用
  const touchStart = useRef<number | null>(null);

  // 监听 URL 参数变化，实现跨页面跳转时的卦象更新
  useEffect(() => {
    const id = parseInt(searchParams.get('id') || '');
    if (id) {
      const hex = HEXAGRAMS.find(h => h.id === id);
      if (hex && hex.id !== baseHex.id) {
        changeHexWithAnimation(hex);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    setActiveTransform(null);
    const fetchMnemonic = async () => {
      setIsLoadingMnemonic(true);
      const m = await getMnemonic(baseHex.name, baseHex.guaci);
      setMnemonic(m);
      setIsLoadingMnemonic(false);
    };
    fetchMnemonic();
  }, [baseHex]);

  // 计算排序后的卦象列表，用于导航、索引和滑动顺序
  const sortedHexagrams = useMemo(() => {
    if (indexMode === 'PALACE') return HEXAGRAMS;
    const natureWeight: Record<string, number> = {
      '天': 7, '泽': 6, '火': 5, '雷': 4,
      '风': 3, '水': 2, '山': 1, '地': 0
    };
    return [...HEXAGRAMS].sort((a, b) => {
      const aUp = natureWeight[a.upperTrigram] ?? 0;
      const aLow = natureWeight[a.lowerTrigram] ?? 0;
      const bUp = natureWeight[b.upperTrigram] ?? 0;
      const bLow = natureWeight[b.lowerTrigram] ?? 0;
      if (aUp !== bUp) return bUp - aUp;
      return bLow - aLow;
    });
  }, [indexMode]);

  const changeHexWithAnimation = (newHex: Hexagram) => {
    setIsAnimating(true);
    setTimeout(() => {
      setBaseHex(newHex);
      setActiveTransform(null);
      setIsAnimating(false);
    }, 200);
  };

  const toggleHex = (id: number) => {
    const hex = HEXAGRAMS.find(h => h.id === id);
    if (hex) {
      setIsRandomMode(false);
      changeHexWithAnimation(hex);
      setShowIndex(false);
    }
  };

  // 学习模式快捷切换
  const switchStudyMode = (mode: 'PALACE' | 'SQUARE') => {
    setIndexMode(mode);
    setIsRandomMode(false);
    // 切换模式后，自动从该模式的第一卦开始
    const firstOfMode = mode === 'PALACE' ? HEXAGRAMS[0] : (
      [...HEXAGRAMS].sort((a, b) => {
        const natureWeight: Record<string, number> = { '天': 7, '泽': 6, '火': 5, '雷': 4, '风': 3, '水': 2, '山': 1, '地': 0 };
        const aUp = natureWeight[a.upperTrigram] ?? 0;
        const aLow = natureWeight[a.lowerTrigram] ?? 0;
        const bUp = natureWeight[b.upperTrigram] ?? 0;
        const bLow = natureWeight[b.lowerTrigram] ?? 0;
        if (aUp !== bUp) return bUp - aUp;
        return bLow - aLow;
      })[0]
    );
    changeHexWithAnimation(firstOfMode);
  };

  const pickRandomHex = () => {
    const randomIndex = Math.floor(Math.random() * HEXAGRAMS.length);
    setIsRandomMode(true);
    changeHexWithAnimation(HEXAGRAMS[randomIndex]);
  };

  const handleNext = () => {
    if (isRandomMode) {
      pickRandomHex();
    } else {
      const currentIndex = sortedHexagrams.findIndex(h => h.id === baseHex.id);
      const nextIndex = (currentIndex + 1) % sortedHexagrams.length;
      changeHexWithAnimation(sortedHexagrams[nextIndex]);
    }
  };

  const handlePrev = () => {
    if (isRandomMode) {
      pickRandomHex();
    } else {
      const currentIndex = sortedHexagrams.findIndex(h => h.id === baseHex.id);
      const prevIndex = (currentIndex - 1 + sortedHexagrams.length) % sortedHexagrams.length;
      changeHexWithAnimation(sortedHexagrams[prevIndex]);
    }
  };

  // 手势处理
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart.current - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        handleNext(); // 向左滑，看下一个
      } else {
        handlePrev(); // 向右滑，看上一个
      }
    }
    touchStart.current = null;
  };

  const getZongBinary = (bin: string) => bin.split('').reverse().join('');
  const getCuoBinary = (bin: string) => bin.split('').map(b => b === '1' ? '0' : '1').join('');

  const displayHex = useMemo(() => {
    if (!activeTransform) return baseHex;
    const targetBin = activeTransform === 'ZONG' 
      ? getZongBinary(baseHex.binary) 
      : getCuoBinary(baseHex.binary);
    return HEXAGRAMS.find(h => h.binary === targetBin) || baseHex;
  }, [baseHex, activeTransform]);

  return (
    <div className="flex flex-col items-center w-full max-h-full animate-in fade-in duration-700 select-none">
      {/* 顶部滚动导航 */}
      <div className="w-full flex items-center border-b border-[#A6937C]/10 bg-[#F4F1EA] sticky top-0 z-30 overflow-hidden">
        <div className="flex-1 overflow-x-auto scroll-hide overscroll-contain">
          <div className="flex gap-3 py-4 pl-6 pr-32 min-w-max items-center">
            {sortedHexagrams.map(h => (
              <button
                key={h.id}
                onClick={() => toggleHex(h.id)}
                className={`w-9 h-9 rounded-full border transition-all flex items-center justify-center text-[10px] font-black shrink-0 ${!isRandomMode && baseHex.id === h.id ? 'bg-[#9A2B2B] text-[#F4F1EA] border-[#9A2B2B] shadow-md scale-110 z-10' : 'bg-[#FBF9F5] text-[#A6937C] border-[#D4C4A8] opacity-70 hover:opacity-100'}`}
              >
                {h.name[0]}
              </button>
            ))}
          </div>
        </div>
        
        {/* 操作区 */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center z-20">
          <div className="h-full w-14 bg-gradient-to-l from-[#F4F1EA] via-[#F4F1EA]/80 to-transparent pointer-events-none" />
          <div className="h-full bg-[#F4F1EA] flex items-center pr-6 pl-1 pointer-events-auto">
            <div className="w-[1px] h-4 bg-[#D4C4A8]/60 mr-4" />
            <div className="flex items-center gap-2">
              <button onClick={pickRandomHex} className={`w-9 h-9 flex-shrink-0 border rounded shadow-sm transition-all flex items-center justify-center group ${isRandomMode ? 'bg-[#9A2B2B] border-[#9A2B2B]' : 'bg-white border-[#D4C4A8]'}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isRandomMode ? '#F4F1EA' : '#9A2B2B'} strokeWidth="2.5" className="group-hover:rotate-12 transition-transform">
                  <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
                </svg>
              </button>
              <button onClick={() => setShowIndex(true)} className="w-9 h-9 flex-shrink-0 bg-white border border-[#D4C4A8] rounded shadow-sm flex items-center justify-center group">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9A2B2B" strokeWidth="2.5" className="group-hover:scale-110 transition-transform">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 学习模式快捷选择栏 */}
      <div className="w-full px-6 pt-4 pb-2 flex justify-center items-center gap-2">
        <button 
          onClick={() => switchStudyMode('PALACE')}
          className={`px-6 py-2 rounded-full text-[11px] font-black tracking-widest transition-all border flex items-center gap-2 ${indexMode === 'PALACE' && !isRandomMode ? 'bg-[#323232] text-white border-[#323232] shadow-md' : 'bg-white/50 text-[#A6937C] border-[#D4C4A8]/40 hover:border-[#323232]'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${indexMode === 'PALACE' && !isRandomMode ? 'bg-[#9A2B2B]' : 'bg-[#D4C4A8]'}`} />
          分宫学习
        </button>
        <div className="w-[1px] h-3 bg-[#D4C4A8]/30 mx-1" />
        <button 
          onClick={() => switchStudyMode('SQUARE')}
          className={`px-6 py-2 rounded-full text-[11px] font-black tracking-widest transition-all border flex items-center gap-2 ${indexMode === 'SQUARE' && !isRandomMode ? 'bg-[#323232] text-white border-[#323232] shadow-md' : 'bg-white/50 text-[#A6937C] border-[#D4C4A8]/40 hover:border-[#323232]'}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${indexMode === 'SQUARE' && !isRandomMode ? 'bg-[#9A2B2B]' : 'bg-[#D4C4A8]'}`} />
          方图学习
        </button>
      </div>

      {/* 核心卡片展示区 */}
      <div 
        className="w-full px-6 mb-4 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className={`relative bg-[#FBF9F5] rounded-xl shadow-lg aspect-[4/5] flex flex-col items-center justify-center p-6 border border-[#D4C4A8]/40 overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
          {isRandomMode && (
            <div className="absolute top-4 left-4 z-20">
              <div className="px-2 py-0.5 border border-[#9A2B2B]/40 rounded-sm bg-[#9A2B2B]/5">
                <span className="text-[8px] font-black text-[#9A2B2B] tracking-widest">随缘修行</span>
              </div>
            </div>
          )}
          <div className="absolute top-5 left-5 w-3 h-3 border-t-2 border-l-2 border-[#9A2B2B]/30" />
          <div className="absolute bottom-5 right-5 w-3 h-3 border-b-2 border-r-2 border-[#9A2B2B]/30" />
          <div className="absolute top-6 right-8 text-4xl font-black text-[#323232] italic opacity-[0.04] select-none">
            {displayHex.id.toString().padStart(2, '0')}
          </div>
          <div className="flex-1 flex items-center justify-center scale-95 relative z-10">
            <HexagramIcon binary={displayHex.binary} size="lg" className="scale-125" />
          </div>
          <div className="mt-4 flex flex-col items-center gap-1.5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-6 h-[1px] bg-[#D4C4A8]/50" />
              <h2 className="text-3xl font-black text-[#323232] tracking-widest">{displayHex.name}</h2>
              <div className="w-6 h-[1px] bg-[#D4C4A8]/50" />
            </div>
            <p className="text-[10px] font-bold text-[#A6937C] tracking-[0.4em] uppercase">
              {displayHex.upperTrigram} {displayHex.lowerTrigram} {displayHex.name}
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-t from-[#D4C4A8]/10 to-transparent opacity-50" />
        </div>
        <div className="w-full text-center mt-2 opacity-30">
          <p className="text-[8px] font-bold text-[#A6937C] tracking-[0.5em] uppercase">左右滑动 拨云见日</p>
        </div>
      </div>

      {/* 变换按钮 */}
      <div className="w-full px-6 flex gap-3 mb-4">
        <button onClick={() => setActiveTransform(activeTransform === 'ZONG' ? null : 'ZONG')} className={`flex-1 py-3.5 rounded-lg font-black text-[11px] tracking-widest transition-all border shadow-sm ${activeTransform === 'ZONG' ? 'bg-[#323232] text-white border-[#323232]' : 'bg-[#FBF9F5] text-[#323232] border-[#D4C4A8]'}`}>综 卦 (颠倒)</button>
        <button onClick={() => setActiveTransform(activeTransform === 'CUO' ? null : 'CUO')} className={`flex-1 py-3.5 rounded-lg font-black text-[11px] tracking-widest transition-all border shadow-sm ${activeTransform === 'CUO' ? 'bg-[#323232] text-white border-[#323232]' : 'bg-[#FBF9F5] text-[#323232] border-[#D4C4A8]'}`}>错 卦 (对冲)</button>
      </div>

      {/* 底部描述 */}
      <div className="w-full px-6">
         <div className="bg-[#D4C4A8]/5 border-t border-[#A6937C]/10 py-5 text-center rounded-b-lg">
            <p className="text-[10px] font-bold text-[#A6937C] tracking-[0.1em] px-4 leading-relaxed opacity-80">
              {displayHex.guaci}
            </p>
         </div>
      </div>

      {/* 索引弹窗 */}
      {showIndex && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#323232]/50 backdrop-blur-sm" onClick={() => setShowIndex(false)} />
          <div className="relative bg-[#FBF9F5] w-full max-w-sm rounded-xl border border-[#D4C4A8] shadow-2xl p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xs font-black text-[#323232] tracking-widest uppercase">全卦图鉴</h3>
               <div className="flex p-0.5 bg-[#D4C4A8]/15 rounded-md border border-[#D4C4A8]/30">
                 <button onClick={() => setIndexMode('PALACE')} className={`px-3 py-1.5 rounded text-[10px] font-black transition-all ${indexMode === 'PALACE' ? 'bg-[#9A2B2B] text-white' : 'text-[#A6937C]'}`}>分宫</button>
                 <button onClick={() => setIndexMode('SQUARE')} className={`px-3 py-1.5 rounded text-[10px] font-black transition-all ${indexMode === 'SQUARE' ? 'bg-[#9A2B2B] text-white' : 'text-[#A6937C]'}`}>方图</button>
               </div>
            </div>
            <div className="grid grid-cols-8 gap-1.5 overflow-y-auto max-h-[60vh] scroll-hide">
              {sortedHexagrams.map(h => (
                <button key={h.id} onClick={() => toggleHex(h.id)} className={`aspect-square rounded border text-[10px] font-black flex items-center justify-center transition-all ${!isRandomMode && baseHex.id === h.id ? 'bg-[#9A2B2B] text-white border-[#9A2B2B]' : 'bg-white border-[#D4C4A8]/40 text-[#A6937C]'}`}>
                  {h.name[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
