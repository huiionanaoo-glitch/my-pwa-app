
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Post {
  id: number;
  author: string;
  title: string;
  content: string;
  likes: number;
  time: string;
  tags: string[];
}

const Community: React.FC = () => {
  const navigate = useNavigate();
  const [posts] = useState<Post[]>([
    {
      id: 1,
      author: "易学小生",
      title: "关于‘乾卦’的感悟",
      content: "今天读到‘天行健，君子以自强不息’，深感作为当代青年，应当保持进取之心，不断磨砺自己。",
      likes: 24,
      time: "2小时前",
      tags: ["乾卦", "励志"]
    },
    {
      id: 2,
      author: "林间隐者",
      title: "坤卦：厚德载物之美",
      content: "坤卦教导我们要像大地一样宽厚，包容万物。在职场中，这种心态能让我们走得更远。",
      likes: 18,
      time: "5小时前",
      tags: ["坤卦", "职场"]
    },
    {
      id: 3,
      author: "悟道人",
      title: "如何快速记住64卦？",
      content: "我发现通过联想记忆法，把卦象和生活场景结合起来，记忆效果非常好。大家可以试试。",
      likes: 42,
      time: "昨天",
      tags: ["心得", "技巧"]
    }
  ]);

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

      <header className="flex justify-between items-end mb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#9A2B2B]/5 rounded-full flex items-center justify-center shadow-inner border border-[#9A2B2B]/20">
            <svg className="w-8 h-8 text-[#9A2B2B]" viewBox="0 0 24 24" fill="currentColor">
              <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="font-black text-[16px]" style={{ fontFamily: 'serif' }}>友</text>
            </svg>
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-[#323232] tracking-widest">易友社区</h2>
            <p className="text-[10px] text-[#A6937C] font-bold uppercase tracking-widest">分享心得 · 共悟易道</p>
          </div>
        </div>
        <button 
          onClick={() => alert('发表心得功能开发中...')}
          className="px-4 py-2 bg-[#9A2B2B] text-white text-[10px] font-black rounded-lg shadow-lg active:scale-95 transition-all tracking-widest uppercase"
        >
          发表心得
        </button>
      </header>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-xl p-5 border border-[#D4C4A8]/30 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#323232] rounded-full flex items-center justify-center text-[10px] text-white font-black">
                  {post.author[0]}
                </div>
                <div>
                  <span className="block text-xs font-black text-[#323232]">{post.author}</span>
                  <span className="block text-[9px] text-[#A6937C]">{post.time}</span>
                </div>
              </div>
              <div className="flex gap-1">
                {post.tags.map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 bg-[#F4F1EA] text-[#A6937C] text-[8px] font-bold rounded border border-[#D4C4A8]/20">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            
            <h3 className="text-sm font-black text-[#323232] mb-2">{post.title}</h3>
            <p className="text-xs text-[#323232]/70 leading-relaxed mb-4">
              {post.content}
            </p>
            
            <div className="flex items-center gap-4 border-t border-[#F4F1EA] pt-3">
              <button className="flex items-center gap-1.5 text-[10px] text-[#A6937C] hover:text-[#9A2B2B] transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{post.likes}</span>
              </button>
              <button 
                onClick={() => alert('评论功能开发中...')}
                className="flex items-center gap-1.5 text-[10px] text-[#A6937C] hover:text-[#323232] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>发表评论</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="fixed bottom-32 right-8 w-14 h-14 bg-[#9A2B2B] text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default Community;
