
import React, { useState, useEffect, useRef } from 'react';
import { SystemSettings, AssistantState } from './types';
import AssistantOrb from './components/AssistantOrb';
import { initGeminiLive } from './services/geminiService';
import { createBlob, decode, decodeAudioData } from './services/audioUtils';
import { FUNCTIONAL_APPS } from './constants';

const MatrixRain: React.FC = () => {
    const columns = 25;
    const chars = "0101010101";
    return (
        <div className="matrix-rain opacity-20">
            {Array.from({ length: columns }).map((_, i) => (
                <div 
                    key={i} 
                    className="matrix-column" 
                    style={{ 
                        animationDuration: `${Math.random() * 8 + 4}s`,
                        opacity: Math.random() * 0.3 + 0.1
                    }}
                >
                    {Array.from({ length: 40 }).map((_, j) => (
                        <span key={j}>{chars[Math.floor(Math.random() * chars.length)]}</span>
                    ))}
                </div>
            ))}
        </div>
    );
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    wifi: true,
    bluetooth: true,
    brightness: 100,
    volume: 80,
    isLocked: false
  });
  const [assistantState, setAssistantState] = useState<AssistantState>('IDLE');
  const [lastAction, setLastAction] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    greet();
    initWakeWordDetection();
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (liveSessionRef.current) liveSessionRef.current.close();
    };
  }, []);

  // Real Volume Control
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = settings.volume / 100;
    }
  }, [settings.volume]);

  const greet = () => {
    const hours = new Date().getHours();
    let msg = hours < 12 ? 'Bom dia' : hours < 18 ? 'Boa tarde' : 'Boa noite';
    speakSimple(`${msg}. Sistema Terça-feira ativo. Diga meu nome para começar.`);
  };

  const speakSimple = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.pitch = 1.0;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const initWakeWordDetection = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const text = event.results[event.results.length - 1][0].transcript.toLowerCase();
      if (text.includes('terça feira') || text.includes('terça-feira')) {
        startAssistantSession();
      } else if (text.includes('desligar') && assistantState === 'LISTENING') {
        stopAssistantSession();
      }
    };

    recognition.onend = () => {
      if (assistantState === 'IDLE') try { recognition.start(); } catch(e) {}
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch(e) {}
  };

  const startAssistantSession = async () => {
    if (assistantState === 'LISTENING') return;
    if (recognitionRef.current) recognitionRef.current.stop();

    setAssistantState('LISTENING');
    speakSimple("Pode falar, estou ouvindo.");

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }

    try {
      const session = await initGeminiLive({
        onAudio: async (base64) => {
          const ctx = audioContextRef.current!;
          const bytes = decode(base64);
          nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
          const buffer = await decodeAudioData(bytes, ctx, 24000, 1);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(gainNodeRef.current!);
          source.addEventListener('ended', () => sourcesRef.current.delete(source));
          source.start(nextStartTimeRef.current);
          nextStartTimeRef.current += buffer.duration;
          sourcesRef.current.add(source);
        },
        onInterrupted: () => {
          sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
          sourcesRef.current.clear();
          nextStartTimeRef.current = 0;
        },
        onToolCall: (calls) => handleToolCalls(calls),
        onClose: () => {
          setAssistantState('IDLE');
          initWakeWordDetection();
        }
      });

      liveSessionRef.current = session;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        const blob = createBlob(input);
        session.sendRealtimeInput({ media: blob });
      };

      source.connect(processor);
      processor.connect(inputCtx.destination);
    } catch (error) {
      setAssistantState('IDLE');
      initWakeWordDetection();
    }
  };

  const stopAssistantSession = () => {
    if (liveSessionRef.current) {
      liveSessionRef.current.close();
      liveSessionRef.current = null;
    }
    setAssistantState('IDLE');
    speakSimple("Tudo bem. Fico aqui aguardando.");
  };

  const handleToolCalls = (calls: any[]) => {
    calls.forEach(call => {
      const { name, args } = call;
      switch(name) {
        case 'open_app':
          const app = FUNCTIONAL_APPS.find(a => a.name.toLowerCase().includes(args.appName.toLowerCase()));
          if (app) {
            window.open(app.url, '_blank');
            setLastAction(`ABRINDO: ${app.name.toUpperCase()}`);
          } else {
            setLastAction(`APP NÃO ENCONTRADO: ${args.appName}`);
          }
          break;
        case 'toggle_setting':
          setSettings(prev => ({ ...prev, [args.setting]: args.state }));
          setLastAction(`${args.setting.toUpperCase()}: ${args.state ? 'ATIVO' : 'DESATIVADO'}`);
          break;
        case 'set_volume_brightness':
          setSettings(prev => ({ ...prev, [args.type]: args.level }));
          setLastAction(`${args.type.toUpperCase()}: ${args.level}%`);
          break;
        default: setLastAction(`SISTEMA: ${name.toUpperCase()}`);
      }
    });
    setTimeout(() => setLastAction(null), 3000);
  };

  // Brightness Filter Style
  const brightnessStyle = {
    filter: `brightness(${settings.brightness}%)`,
    transition: 'filter 0.5s ease-in-out'
  };

  return (
    <div 
      className="relative h-screen w-screen bg-[#010409] overflow-hidden flex flex-col items-center select-none"
      style={brightnessStyle}
    >
      <MatrixRain />

      {/* Real-time Status Bar */}
      <div className="w-full px-6 py-4 flex justify-between items-center z-30 opacity-40 font-mono text-[10px] tracking-widest text-cyan-500">
        <div className="flex gap-4">
          <span className={settings.wifi ? "text-cyan-400" : "text-red-900"}>WIFI_{settings.wifi ? 'CONNECTED' : 'OFF'}</span>
          <span className={settings.bluetooth ? "text-cyan-400" : "text-red-900"}>BT_{settings.bluetooth ? 'READY' : 'OFF'}</span>
        </div>
        <div className="flex gap-4">
          <span>VOL_{settings.volume}%</span>
          <span>BRI_{settings.brightness}%</span>
          <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Main Launcher Content - Centered Assistant */}
      <div className="flex-1 w-full flex flex-col items-center justify-center z-20">
        
        {/* Central Assistant Control */}
        <div className="relative">
          <AssistantOrb 
            isListening={assistantState === 'LISTENING'} 
            isExecuting={!!lastAction}
            onClick={() => assistantState === 'IDLE' ? startAssistantSession() : stopAssistantSession()}
          />
          
          {lastAction && (
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-24 w-max text-center">
              <p className="text-cyan-400 text-[10px] font-mono tracking-widest animate-pulse border-b border-cyan-500/20 pb-1">
                {lastAction}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* OS Label Footer */}
      <div className="absolute bottom-6 text-[9px] font-mono text-cyan-900 opacity-20 tracking-[0.5em] uppercase z-30">
        Terça-Feira // Minimal Core Interface
      </div>

      {/* Screen Glare effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/0 via-transparent to-white/5 pointer-events-none z-10"></div>
    </div>
  );
};

export default App;
