'use client';

import { useState } from 'react';
import { Send, Users, History, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function Announcements() {
  const [target, setTarget] = useState('Todos os Líderes');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([
    { id: 1, date: '20/06 às 14:00', text: 'Lembrete da nossa reunião de liderança amanhã às 19h...', target: 'Todos os Líderes' },
    { id: 2, date: '18/06 às 09:30', text: 'Bom dia líderes! Não esqueçam de atualizar os relatórios de visitantes.', target: 'Líderes de Ministério' }
  ]);

  const handleSend = async () => {
    if (!message.trim()) {
      alert('Por favor, escreva uma mensagem.');
      return;
    }

    try {
      setSending(true);
      await api.sendAnnouncement({ target, message });
      
      // Add to history (local mock update)
      const newEntry = {
        id: Date.now(),
        date: new Date().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
        text: message,
        target: target
      };
      setHistory([newEntry, ...history]);
      setMessage('');
      alert('Comunicado enviado com sucesso!');
    } catch (error) {
      console.error('Failed to send announcement:', error);
      alert('Erro ao enviar comunicado. Verifique a conexão com o servidor.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enviar Comunicados</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Público-Alvo</label>
                <select 
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full rounded-lg border bg-white p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option>Todos os Líderes</option>
                  <option>Líderes de Ministério</option>
                  <option>Diáconos e Presbíteros</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Mensagem</label>
                <textarea
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escreva aqui o comunicado que será enviado via WhatsApp..."
                  className="w-full rounded-lg border bg-white p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <p className="text-xs text-gray-500 text-right">{message.length} / 1000 caracteres</p>
              </div>

              <button 
                onClick={handleSend}
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              >
                {sending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                {sending ? 'Enviando...' : 'Enviar Agora via WhatsApp'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4 text-gray-900 dark:text-white">
              <History size={18} />
              <h3 className="font-semibold">Histórico Recente</h3>
            </div>
            <ul className="space-y-4">
              {history.map((item) => (
                <li key={item.id} className="border-b pb-4 last:border-0 last:pb-0 dark:border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">Enviado em {item.date}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 italic">
                    "{item.text}"
                  </p>
                  <p className="text-xs text-blue-600 mt-1">Para: {item.target}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-blue-600 p-6 text-white shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users size={18} />
              <h3 className="font-semibold">Dica de Envio</h3>
            </div>
            <p className="text-sm text-blue-100">
              Mantenha as mensagens curtas e objetivas. Use emojis para tornar a leitura mais amigável no WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
