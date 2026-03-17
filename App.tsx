
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { HEXAGRAMS } from './constants';
import { UserProgress, MasteryLevel } from './types';
import Library from './views/Library';
import Dojo from './views/Dojo';
import TestArena from './views/TestArena';
import Dashboard from './views/Dashboard';
import Profile from './views/Profile';
import DailyInsight from './views/DailyInsight';
import Community from './views/Community';

const App: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const saved = localStorage.getItem('yilin_progress');
    if (saved) {
      setProgress(JSON.parse(saved));
    } else {
      const initial: UserProgress[] = HEXAGRAMS.map(h => ({
        hexagramId: h.id,
        mastery: 'UNTOUCHED' as MasteryLevel,
        lastCorrectTime: 0,
        errorCount: 0,
        responseTimeMs: 0
      }));
      setProgress(initial);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('yilin_progress', JSON.stringify(progress));
  }, [progress]);

  const updateProgress = (hexId: number, isCorrect: boolean, responseTime: number) => {
    setProgress(prev => prev.map(p => {
      if (p.hexagramId === hexId) {
        let newMastery = p.mastery;
        const newErrorCount = isCorrect ? p.errorCount : p.errorCount + 1;
        
        if (!isCorrect) {
          newMastery = 'WEAK';
        } else {
          if (responseTime < 2000) newMastery = 'MASTERED';
          else if (responseTime < 5000) newMastery = 'UNSTABLE';
          else newMastery = 'WEAK';
        }

        return {
          ...p,
          mastery: newMastery,
          errorCount: newErrorCount,
          lastCorrectTime: isCorrect ? Date.now() : p.lastCorrectTime,
          responseTimeMs: responseTime
        };
      }
      return p;
    }));
  };

  return (
    <HashRouter>
      <div className="max-w-md mx-auto min-h-screen bg-[#F4F1EA] flex flex-col relative overflow-hidden shadow-2xl border-x border-[#D4C4A8]/30">
        {/* Decorative Ink Brush Stroke */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#323232]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
        
        {/* Header */}
        <header className="px-8 pt-10 pb-6 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <div className="w-0.5 h-10 bg-[#9A2B2B]" />
            <div>
              <h1 className="text-3xl font-black text-[#323232] tracking-[0.4em]">知易</h1>
            </div>
          </div>
          <div className="w-12 h-12 border border-[#A6937C]/40 rounded-full flex items-center justify-center p-1">
             <div className="w-full h-full bg-[#323232] rounded-full flex items-center justify-center animate-taiji">
                <div className="w-2 h-2 bg-[#F4F1EA] rounded-full translate-x-1"></div>
             </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 overflow-y-auto scroll-hide pb-32">
          <Routes>
            <Route path="/" element={<Dashboard progress={progress} />} />
            <Route path="/daily" element={<DailyInsight />} />
            <Route path="/community" element={<Community />} />
            <Route path="/library" element={<Library />} />
            <Route path="/dojo" element={<Dojo />} />
            <Route path="/profile" element={<Profile progress={progress} />} />
            <Route path="/test" element={<TestArena progress={progress} onResult={updateProgress} />} />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[85%] bg-[#323232] text-[#F4F1EA] rounded-xl py-4 px-6 flex justify-between items-center shadow-2xl z-50 border-t-2 border-[#A6937C]/50">
          <NavLink to="/" icon="卦" label="进度" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavLink to="/library" icon="藏" label="经书" active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
          <NavLink to="/dojo" icon="演" label="演武" active={activeTab === 'dojo'} onClick={() => setActiveTab('dojo')} />
          <NavLink to="/profile" icon="吾" label="吾道" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
      </div>
    </HashRouter>
  );
};

const NavLink: React.FC<{ to: string, icon: string, label: string, active: boolean, onClick: () => void }> = ({ to, icon, label, active, onClick }) => (
  <Link to={to} onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-500 ${active ? 'scale-110' : 'opacity-40 hover:opacity-70'}`}>
    <span className={`text-xl leading-none font-black ${active ? 'text-[#9A2B2B]' : ''}`}>{icon}</span>
    <span className="text-[9px] font-bold tracking-tighter">{label}</span>
    {active && <div className="w-4 h-0.5 bg-[#9A2B2B] mt-1" />}
  </Link>
);

export default App;
