
import { GoogleGenAI, Modality, Type, FunctionDeclaration } from '@google/genai';
import { SYSTEM_PROMPT } from '../constants';

const controlFunctions: FunctionDeclaration[] = [
  {
    name: 'open_app',
    description: 'Abre um aplicativo específico pelo nome.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        appName: { type: Type.STRING, description: 'Nome do aplicativo para abrir.' }
      },
      required: ['appName']
    }
  },
  {
    name: 'send_message',
    description: 'Envia uma mensagem de texto.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        contact: { type: Type.STRING, description: 'Nome do contato.' },
        content: { type: Type.STRING, description: 'Conteúdo da mensagem.' }
      },
      required: ['contact', 'content']
    }
  },
  {
    name: 'toggle_setting',
    description: 'Altera uma configuração de sistema.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        setting: { type: Type.STRING, enum: ['wifi', 'bluetooth'], description: 'Configuração para alterar.' },
        state: { type: Type.BOOLEAN, description: 'Novo estado (ligado/desligado).' }
      },
      required: ['setting', 'state']
    }
  },
  {
    name: 'set_volume_brightness',
    description: 'Ajusta volume ou brilho.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ['volume', 'brightness'], description: 'O que ajustar.' },
        level: { type: Type.NUMBER, description: 'Nível de 0 a 100.' }
      },
      required: ['type', 'level']
    }
  }
];

export const initGeminiLive = async (
  callbacks: {
    onAudio: (base64: string) => void;
    onInterrupted: () => void;
    onToolCall: (calls: any[]) => void;
    onClose: () => void;
  }
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        // 'Kore' is a natural, warm, and balanced feminine voice.
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
      },
      tools: [{ functionDeclarations: controlFunctions }]
    },
    callbacks: {
      onopen: () => console.log('Gemini Live session opened'),
      onmessage: async (message) => {
        if (message.serverContent?.modelTurn?.parts[0]?.inlineData?.data) {
          callbacks.onAudio(message.serverContent.modelTurn.parts[0].inlineData.data);
        }
        if (message.serverContent?.interrupted) {
          callbacks.onInterrupted();
        }
        if (message.toolCall?.functionCalls) {
          callbacks.onToolCall(message.toolCall.functionCalls);
          const session = await sessionPromise;
          message.toolCall.functionCalls.forEach(fc => {
            session.sendToolResponse({
              functionResponses: {
                id: fc.id,
                name: fc.name,
                response: { result: "Entendido, já fiz isso por você." }
              }
            });
          });
        }
      },
      onerror: (e) => console.error('Gemini Live Error:', e),
      onclose: () => callbacks.onClose(),
    }
  });

  return sessionPromise;
};
