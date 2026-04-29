import React, { useState, useEffect } from 'react';

interface ProgressBarLoaderProps {
  text?: string;
  subtext?: string;
}

export default function ProgressBarLoader({ text = 'กำลังโหลดข้อมูล...', subtext = 'กรุณารอสักครู่' }: ProgressBarLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start fast up to 85%, then slow down significantly to never quite reach 100% until unmounted
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 60) {
          return prev + Math.floor(Math.random() * 15) + 5; // Fast burst
        } else if (prev < 85) {
          return prev + Math.floor(Math.random() * 5) + 2; // Slower
        } else if (prev < 95) {
          return prev + 1; // Crawl
        } else {
          return prev + 0.1; // Very slow crawl
        }
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const displayProgress = Math.min(Math.floor(progress), 99);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 animate-in fade-in duration-500 w-full max-w-xs mx-auto">
      <div className="w-16 h-16 bg-primary/10 rounded-[2rem] flex items-center justify-center animate-pulse">
        <span className="material-symbols-outlined text-primary text-3xl font-variation-fill">hourglass_top</span>
      </div>
      
      <div className="text-center space-y-2 w-full">
        <h2 className="text-lg font-black text-slate-800 tracking-tight">{text}</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subtext}</p>
        
        <div className="relative pt-4">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-black inline-block py-1 px-2 uppercase rounded-full text-primary bg-primary/10">
                Progress
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-black inline-block text-primary">
                {displayProgress}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-slate-100 shadow-inner relative">
            <div 
              style={{ width: `${displayProgress}%` }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-300 ease-out"
            >
              <div className="absolute top-0 left-0 bottom-0 right-0 overflow-hidden rounded-full">
                <div className="w-full h-full bg-white/20 animate-[shimmer_2s_infinite]" style={{ transform: 'translateX(-100%)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}} />
    </div>
  );
}
