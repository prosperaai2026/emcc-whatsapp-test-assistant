'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { api, PrayerRequest } from '@/lib/api';

export default function PrayerRequests() {
  const [requests, setRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await api.getPrayerRequests();
      setRequests(data);
    } catch (err) {
      setError('Erro ao carregar pedidos de oração');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleMarkAsPrayed(id: number) {
    try {
      await api.markAsPrayed(id);
      loadRequests(); // Reload to update counter
    } catch (err) {
      console.error('Failed to mark as prayed:', err);
    }
  }

  if (loading && requests.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pedidos de Oração</h2>
        <button 
          onClick={loadRequests}
          className="text-sm text-blue-600 hover:underline"
        >
          Atualizar
        </button>
      </div>

      <div className="grid gap-4">
        {error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum pedido de oração recebido.</div>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="rounded-full bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {request.is_anonymous ? 'Anônimo' : request.name}
                      </h3>
                      <span className="text-xs text-gray-500">• {request.phone}</span>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{request.request}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-sm font-medium text-amber-600">
                    <Clock size={16} />
                    <span>Orado {request.prayed_for}x</span>
                  </div>
                  <button 
                    onClick={() => handleMarkAsPrayed(request.id)}
                    className="ml-4 rounded-lg border px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Marcar como Orado
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
