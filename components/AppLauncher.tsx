
import React from 'react';
import { FUNCTIONAL_APPS } from '../constants';

const AppLauncher: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-8 p-8 animate-fade-in">
      {FUNCTIONAL_APPS.map((app) => (
        <a
          key={app.id}
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-2 group transition-transform active:scale-90"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center p-3 group-hover:bg-white/10 transition-colors shadow-lg">
            <img src={app.icon} alt={app.name} className="w-full h-full object-contain filter drop-shadow-md" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-cyan-500/80 uppercase">{app.name}</span>
        </a>
      ))}
    </div>
  );
};

export default AppLauncher;
