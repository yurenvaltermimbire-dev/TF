
import React from 'react';
import { SystemSettings } from '../types';

interface SettingsOverlayProps {
  settings: SystemSettings;
}

const SettingsOverlay: React.FC<SettingsOverlayProps> = ({ settings }) => {
  return (
    <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex gap-6 text-xs text-gray-300">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${settings.wifi ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span>Wi-Fi</span>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${settings.bluetooth ? 'bg-blue-500' : 'bg-red-500'}`}></div>
        <span>Bluetooth</span>
      </div>
      <div className="flex flex-col gap-1 min-w-[60px]">
        <div className="flex justify-between">
          <span>Vol</span>
          <span>{settings.volume}%</span>
        </div>
        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
          <div className="bg-white h-full transition-all duration-300" style={{ width: `${settings.volume}%` }}></div>
        </div>
      </div>
      <div className="flex flex-col gap-1 min-w-[60px]">
        <div className="flex justify-between">
          <span>Brilho</span>
          <span>{settings.brightness}%</span>
        </div>
        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
          <div className="bg-white h-full transition-all duration-300" style={{ width: `${settings.brightness}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default SettingsOverlay;
