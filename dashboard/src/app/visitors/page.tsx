'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Filter, Loader2 } from 'lucide-react';
import { api, Visitor } from '@/lib/api';

export default function Visitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadVisitors() {
      try {
        const data = await api.getVisitors();
        setVisitors(data);
      } catch (err) {
        setError('Erro ao carregar visitantes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadVisitors();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visitantes</h2>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <UserPlus size={18} />
          Adicionar Visitante
        </button>
      </div>

      <div className="rounded-xl border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col border-b p-4 gap-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-700">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              className="w-full rounded-lg border bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600">
            <Filter size={18} />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          {error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : visitors.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum visitante encontrado.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">Nome</th>
                  <th className="px-6 py-3">Telefone</th>
                  <th className="px-6 py-3">Cidade</th>
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {visitors.map((visitor) => (
                  <tr key={visitor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{visitor.name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{visitor.phone}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{visitor.city || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {new Date(visitor.visited_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:underline dark:text-blue-400">
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
