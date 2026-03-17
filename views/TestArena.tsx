
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { HEXAGRAMS } from '../constants';
import { QuizQuestion, UserProgress } from '../types';
import HexagramIcon from '../components/HexagramIcon';
import { getQuizHint } from '../services/geminiService';

interface TestArenaProps {
  progress: UserProgress[];
  onResult: (hexId: number, isCorrect: boolean, responseTime: number) => void;
}

const TestArena: React.FC<TestArenaProps> = ({ progress, onResult }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'visual';

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

  useEffect(() => {
    const generateQuestions = () => {
      const qSet: QuizQuestion[] = [];
      
      // 错题筛选逻辑
      let sourceHex = [...HEXAGRAMS];
      if (mode === 'review') {
        const errorIds = progress
          .filter(p => p.errorCount > 0 || p.mastery === 'WEAK')
          .map(p => p.hexagramId);
        
        if (errorIds.length > 0) {
          sourceHex = HEXAGRAMS.filter(h => errorIds.includes(h.id));
        }
        // 如果没有错题，默认使用全部，但在界面提示“全卦复习”
      }

      const shuffledHex = [...sourceHex].sort(() => Math.random() - 0.5).slice(0, 10);

      shuffledHex.forEach(h => {
        let question: QuizQuestion;
        const distractors = HEXAGRAMS.filter(x => x.id !== h.id).sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [h.name, ...distractors.map(d => d.name)].sort(() => Math.random() - 0.5);

        // 根据模式或随机分配题型
        let effectiveType = mode.toUpperCase();
        if (effectiveType === 'COMPREHENSIVE') {
          const types = ['VISUAL', 'STRUCTURE', 'LOGIC', 'TEXT'];
          effectiveType = types[Math.floor(Math.random() * types.length)];
        } else if (effectiveType === 'REVIEW') {
          effectiveType = Math.random() > 0.5 ? 'VISUAL' : 'STRUCTURE';
        }

        if (effectiveType === 'VISUAL') {
          question = {
            type: 'VISUAL',
            question: '观此卦象，其名为何？',
            options,
            answerIndex: options.indexOf(h.name),
            hexagramId: h.id,
            explanation: `此为【${h.name}】卦。${h.upperTrigram}在上，${h.lowerTrigram}在下，即“${h.meaning.substring(0,2)}”。${h.tuanzhuan}`
          };
        } 
        else if (effectiveType === 'STRUCTURE') {
          question = {
            type: 'STRUCTURE',
            question: `“${h.upperTrigram}在${h.lowerTrigram}上”，此自然意象对应哪一卦？`,
            options,
            answerIndex: options.indexOf(h.name),
            hexagramId: h.id,
            explanation: `意象：${h.upperTrigram}${h.lowerTrigram}${h.name}。记法：上${h.upperTrigram}下${h.lowerTrigram}。${h.tuanzhuan}`
          };
        } 
        else if (effectiveType === 'LOGIC') {
          const isZong = Math.random() > 0.5;
          const getZongBin = (bin: string) => bin.split('').reverse().join('');
          const getCuoBin = (bin: string) => bin.split('').map(b => b === '1' ? '0' : '1').join('');
          
          const targetBin = isZong ? getZongBin(h.binary) : getCuoBin(h.binary);
          const targetHex = HEXAGRAMS.find(x => x.binary === targetBin) || h;
          
          question = {
            type: 'LOGIC',
            question: `【${h.name}卦】的${isZong ? '综卦' : '错卦'}为何？`,
            options: [targetHex.name, ...distractors.map(d => d.name)].sort(() => Math.random() - 0.5),
            answerIndex: -1,
            hexagramId: h.id,
            explanation: `${isZong ? '综卦是将原卦倒置' : '错卦是每一爻阴阳相反'}。${h.name}的${isZong ? '综' : '错'}卦即是【${targetHex.name}】。${targetHex.tuanzhuan}`
          };
          question.answerIndex = question.options.indexOf(targetHex.name);
        }
        else {
          // TEXT 模式：如果卦辞是默认的，则使用象传
          const isDefaultGuaci = h.guaci === "卦理深藏，待君悟之。";
          const quizText = isDefaultGuaci ? h.tuanzhuan : h.guaci;
          
          question = {
            type: 'TEXT',
            question: `其辞曰：“${quizText.substring(0, 20)}...”，此为何卦？`,
            options,
            answerIndex: options.indexOf(h.name),
            hexagramId: h.id,
            explanation: `此卦辞/象传出自【${h.name}】卦。${h.guaci} ${h.tuanzhuan}`
          };
        }
        qSet.push(question);
      });
      setQuestions(qSet);
    };

    generateQuestions();
    const timer = setTimeout(() => setShowIntro(false), 1500);
    return () => clearTimeout(timer);
  }, [mode]);

  useEffect(() => {
    if (!showIntro) setStartTime(Date.now());
  }, [showIntro, currentIndex]);

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    const timeTaken = Date.now() - startTime;
    setSelectedAnswer(idx);
    setIsAnswered(true);
    
    const newUserAnswers = [...userAnswers];
    newUserAnswers[currentIndex] = idx;
    setUserAnswers(newUserAnswers);

    const isCorrect = idx === questions[currentIndex].answerIndex;
    onResult(questions[currentIndex].hexagramId, isCorrect, timeTaken);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setHint(null);
    } else {
      setShowSummary(true);
    }
  };

  const fetchHint = async () => {
    const q = questions[currentIndex];
    const hex = HEXAGRAMS.find(h => h.id === q.hexagramId);
    if (hex) setHint(await getQuizHint(hex.name, hex.upperTrigram, hex.lowerTrigram));
  };

  if (showIntro) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 border-2 border-[#9A2B2B]/40 rounded-full flex items-center justify-center animate-taiji">
          <div className="w-12 h-12 bg-[#323232] rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-[#F4F1EA] rounded-full translate-x-1"></div>
          </div>
        </div>
        <h2 className="mt-8 text-2xl font-black tracking-[0.8em] text-[#323232] translate-x-[0.4em]">
          {mode === 'review' ? '温·故' : '入·演'}
        </h2>
      </div>
    );
  }

  if (showSummary) {
    const correctCount = userAnswers.filter((ans, idx) => ans === questions[idx].answerIndex).length;
    const score = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="py-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="text-center space-y-2">
          <div className="inline-block px-4 py-1 bg-[#9A2B2B] text-white text-[10px] font-black rounded-full tracking-[0.3em] uppercase mb-2">
            试炼总结
          </div>
          <h2 className="text-3xl font-black text-[#323232] tracking-widest">
            {score >= 80 ? '圆满达成' : score >= 60 ? '略有所得' : '仍需磨砺'}
          </h2>
          <div className="flex justify-center gap-8 pt-4">
            <div className="text-center">
              <span className="block text-2xl font-black text-[#323232]">{score}</span>
              <span className="text-[9px] font-bold text-[#A6937C] uppercase tracking-widest">修行分数</span>
            </div>
            <div className="text-center border-x border-[#D4C4A8]/30 px-8">
              <span className="block text-2xl font-black text-[#2D5133]">{correctCount}</span>
              <span className="text-[9px] font-bold text-[#A6937C] uppercase tracking-widest">答对题数</span>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-black text-[#9A2B2B]">{questions.length - correctCount}</span>
              <span className="text-[9px] font-bold text-[#A6937C] uppercase tracking-widest">错题数</span>
            </div>
          </div>
        </header>

        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-[#A6937C] tracking-widest uppercase px-1">详细回顾</h4>
          {questions.map((q, idx) => {
            const isCorrect = userAnswers[idx] === q.answerIndex;
            const hex = HEXAGRAMS.find(h => h.id === q.hexagramId);
            return (
              <div key={idx} className={`p-4 rounded-lg border ${isCorrect ? 'bg-white border-[#D4C4A8]/30' : 'bg-[#9A2B2B]/5 border-[#9A2B2B]/20'} transition-all`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${isCorrect ? 'bg-[#2D5133] text-white' : 'bg-[#9A2B2B] text-white'}`}>
                      {isCorrect ? '✓' : '✕'}
                    </span>
                    <span className="text-xs font-black text-[#323232]">第 {idx + 1} 题</span>
                  </div>
                  <span className="text-[9px] font-bold text-[#A6937C] uppercase tracking-widest">{q.type}</span>
                </div>
                <p className="text-xs text-[#323232]/80 mb-3 font-medium">{q.question}</p>
                <div className="flex items-center justify-between text-[10px]">
                  <div className="space-x-4">
                    <span className="text-[#A6937C]">你的回答: <span className={`font-black ${isCorrect ? 'text-[#2D5133]' : 'text-[#9A2B2B]'}`}>{q.options[userAnswers[idx] ?? 0] || '未答'}</span></span>
                    {!isCorrect && <span className="text-[#A6937C]">正确答案: <span className="font-black text-[#2D5133]">{q.options[q.answerIndex]}</span></span>}
                  </div>
                  {hex && <span className="font-black text-[#323232]">【{hex.name}】</span>}
                </div>
              </div>
            );
          })}
        </div>

        <button 
          onClick={() => navigate('/')}
          className="w-full py-4 bg-[#323232] text-white rounded-lg font-black text-xs uppercase tracking-[0.5em] shadow-xl active:scale-[0.98] transition-all"
        >
          返回修行大厅
        </button>
      </div>
    );
  }

  if (questions.length === 0) return null;
  const currentQ = questions[currentIndex];
  const hex = HEXAGRAMS.find(h => h.id === currentQ.hexagramId);

  return (
    <div className="py-1 space-y-4 animate-in fade-in duration-500">
      {/* 顶部进度 */}
      <div className="flex justify-between items-center px-1">
         <span className="text-[9px] font-black text-[#A6937C] tracking-widest uppercase">
           {mode === 'review' ? '温故知新' : '修行试炼'} {currentIndex + 1} / {questions.length}
         </span>
         <span className="text-[9px] font-black text-[#9A2B2B] tracking-widest flex items-center gap-1 uppercase">
           <span className="w-1.5 h-1.5 bg-[#9A2B2B] rounded-full" />
           {currentQ.type}
         </span>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-black text-[#323232] text-center px-4 leading-tight">{currentQ.question}</h3>
        <div className="bg-[#FBF9F5]/80 rounded-lg p-4 border border-[#D4C4A8]/40 shadow-sm flex justify-center min-h-[140px] items-center">
           {hex && (
             currentQ.type === 'VISUAL' || currentQ.type === 'LOGIC' ? 
             <HexagramIcon binary={hex.binary} size="lg" /> : 
             <div className="w-24 h-24 bg-white border border-[#D4C4A8] rounded shadow-sm flex items-center justify-center relative overflow-hidden">
                {isAnswered ? (
                  <span className="text-4xl font-black text-[#323232] animate-in zoom-in duration-300">{hex.name}</span>
                ) : (
                  <div className="flex flex-col items-center opacity-20">
                    <span className="text-4xl font-black text-[#A6937C]">卦</span>
                    <span className="text-[8px] font-bold tracking-tighter mt-1 uppercase">Mystery</span>
                  </div>
                )}
                {/* 装饰性底纹 */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {currentQ.options.map((opt, idx) => {
          let stateClass = "bg-white/80 border-[#D4C4A8] text-[#323232]";
          if (isAnswered) {
            if (idx === currentQ.answerIndex) stateClass = "bg-[#2D5133] border-[#2D5133] text-white shadow-md scale-105 z-10";
            else if (idx === selectedAnswer) stateClass = "bg-[#9A2B2B]/10 border-[#9A2B2B] text-[#9A2B2B] opacity-60";
            else stateClass = "opacity-20 border-transparent";
          }
          return (
            <button key={idx} disabled={isAnswered} onClick={() => handleAnswer(idx)} className={`py-3 rounded border-2 font-black text-lg transition-all active:scale-95 ${stateClass}`}>
              {opt}
            </button>
          );
        })}
      </div>

      <div className="min-h-[120px]">
        {!isAnswered ? (
          <div className="flex flex-col items-center pt-2">
             <button onClick={fetchHint} className="flex items-center gap-2 text-[#A6937C] hover:text-[#9A2B2B] transition-colors mb-2">
               <span className="text-lg">🏮</span>
               <span className="text-[10px] font-black tracking-widest">求签启示</span>
             </button>
             {hint && (
               <div className="p-3 bg-[#FBF9F5] border border-[#D4C4A8] rounded text-[11px] text-[#323232]/80 italic text-center animate-in zoom-in-95">
                  {hint}
               </div>
             )}
          </div>
        ) : (
          <div className="space-y-3 animate-in slide-in-from-top-2">
             <button onClick={nextQuestion} className="w-full py-3 bg-[#9A2B2B] text-white rounded font-black text-xs uppercase tracking-[0.4em] shadow-lg active:scale-[0.98] transition-all">
                {currentIndex === questions.length - 1 ? '试炼完成' : '下一卦试炼'}
             </button>
             <div className="p-3 bg-[#323232] rounded border-l-4 border-[#9A2B2B] shadow-lg">
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-1.5 h-1.5 bg-[#FF6B6B] rotate-45" />
                   <p className="text-[10px] text-[#FF6B6B] font-black tracking-widest uppercase">师尊解析</p>
                </div>
                <p className="text-[11px] font-bold leading-normal text-white/90">{currentQ.explanation}</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestArena;
