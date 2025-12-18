
import React from 'react';

interface AssistantOrbProps {
  isListening: boolean;
  isExecuting: boolean;
  onClick: () => void;
}

const AssistantOrb: React.FC<AssistantOrbProps> = ({ isListening, isExecuting, onClick }) => {
  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      
      {/* Outer Decorative Rings */}
      <div className={`orb-ring w-full h-full opacity-20 border-cyan-500/10 animate-rotate-slow`}></div>
      <div className={`orb-ring w-[90%] h-[90%] opacity-30 border-dashed border-cyan-500/20`}></div>
      <div className={`orb-ring w-[80%] h-[80%] opacity-40 border-cyan-500/30 ${isListening ? 'animate-pulse' : ''}`}></div>

      {/* Main Core Circle */}
      <div 
        onClick={onClick}
        className={`relative z-10 w-28 h-28 rounded-full cursor-pointer transition-all duration-700 flex items-center justify-center border-2
          ${isListening 
            ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_30px_rgba(0,255,255,0.4)] scale-110' 
            : 'bg-transparent border-cyan-900/50 scale-100'
          }
        `}
      >
        {/* Glow behind text */}
        <div className={`absolute inset-4 rounded-full bg-cyan-500/20 blur-xl transition-opacity duration-500 ${isListening ? 'opacity-100' : 'opacity-0'}`}></div>
        
        {/* "TF" Text */}
        <span className={`text-3xl font-orbitron font-bold tracking-widest transition-all duration-500
          ${isListening ? 'text-cyan-400 glow-text' : 'text-cyan-900'}
        `}>
          TF
        </span>
      </div>
      
      {/* Scanning effect when executing */}
      {isExecuting && (
        <div className="absolute inset-0 rounded-full border border-cyan-400 animate-ping opacity-20"></div>
      )}

      {/* Subtle status label */}
      <div className="absolute -bottom-12 text-center w-full">
        <p className={`text-[9px] font-mono tracking-[0.6em] uppercase transition-all duration-700 ${isListening ? 'text-cyan-400 opacity-80' : 'text-cyan-950 opacity-40'}`}>
          {isListening ? 'ESTABELECENDO LINK' : 'SISTEMA PRONTO'}
        </p>
      </div>
    </div>
  );
};

export default AssistantOrb;
