
import { AppInfo } from './types';

export const FUNCTIONAL_APPS: AppInfo[] = [
  { id: 'whatsapp', name: 'WhatsApp', icon: 'https://cdn-icons-png.flaticon.com/512/3670/3670051.png', url: 'https://web.whatsapp.com', category: 'comm' },
  { id: 'spotify', name: 'Spotify', icon: 'https://cdn-icons-png.flaticon.com/512/174/174872.png', url: 'https://open.spotify.com', category: 'media' },
  { id: 'maps', name: 'Maps', icon: 'https://cdn-icons-png.flaticon.com/512/355/355980.png', url: 'https://maps.google.com', category: 'tools' },
  { id: 'youtube', name: 'YouTube', icon: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png', url: 'https://youtube.com', category: 'media' },
  { id: 'gmail', name: 'Gmail', icon: 'https://cdn-icons-png.flaticon.com/512/732/732200.png', url: 'https://mail.google.com', category: 'comm' },
  { id: 'calendar', name: 'Agenda', icon: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png', url: 'https://calendar.google.com', category: 'tools' },
];

export const SYSTEM_PROMPT = `
Você é a "Terça-feira", a interface de voz de um Launcher Android avançado.
Seu tom é feminino, humano e eficiente.

REGRAS DE EXECUÇÃO:
1. Se o usuário pedir para abrir um app, use 'open_app'.
2. Se pedir para ligar/desligar Wi-Fi ou Bluetooth, use 'toggle_setting'.
3. Se pedir para mudar volume ou brilho, use 'set_volume_brightness'.
4. Seja direta. Confirme a ação de forma natural: "Com certeza, abrindo o WhatsApp agora" ou "Brilho ajustado para o máximo".

Você tem controle real sobre a interface que o usuário está vendo.
`;
