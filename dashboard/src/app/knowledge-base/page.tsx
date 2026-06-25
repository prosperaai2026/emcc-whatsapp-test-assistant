'use client';

import { useState, useEffect } from 'react';
import { Save, Info, Loader2, Plus, Trash2 } from 'lucide-react';
import { api, KnowledgeBaseEntry, ChurchInfo } from '@/lib/api';

export default function KnowledgeBase() {
  const [entries, setEntries] = useState<KnowledgeBaseEntry[]>([]);
  const [churchInfo, setChurchInfo] = useState<ChurchInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [kbData, infoData] = await Promise.all([
        api.getKnowledgeBase(),
        api.getChurchInfo()
      ]);
      setEntries(kbData);
      setChurchInfo(infoData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddEntry() {
    try {
      await api.createKnowledgeBaseEntry({
        question: 'Nova Pergunta',
        answer: 'Nova Resposta',
        category: 'geral',
        keywords: [],
        is_active: true
      });
      const data = await api.getKnowledgeBase();
      setEntries(data);
    } catch (err) {
      console.error('Failed to add entry:', err);
    }
  }

  async function handleUpdateEntry(id: number, field: string, value: any) {
    setEntries(entries.map(e => e.id === id ? { ...e, [field]: value } : e));
  }

  async function saveEntry(id: number) {
    const entry = entries.find(e => e.id === id);
    if (!entry) return;
    try {
      setSaving(true);
      await api.updateKnowledgeBaseEntry(id, entry);
      alert('Pergunta salva!');
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id: number) {
    if (!confirm('Tem certeza?')) return;
    try {
      await api.deleteKnowledgeBaseEntry(id);
      setEntries(entries.filter(e => e.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }

  async function saveChurchInfo() {
    if (!churchInfo) return;
    try {
      setSaving(true);
      await api.updateChurchInfo(churchInfo);
      alert('Informações da igreja atualizadas!');
    } catch (err) {
      console.error('Failed to save info:', err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-12 pb-20">
      {/* Church Info Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Informações da Igreja</h2>
          <button 
            onClick={saveChurchInfo}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Save size={18} />
            Salvar Dados
          </button>
        </div>

        <div className="rounded-xl border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Nome</label>
              <input
                type="text"
                value={churchInfo?.name || ''}
                onChange={(e) => setChurchInfo(prev => prev ? {...prev, name: e.target.value} : null)}
                className="w-full rounded-lg border bg-white p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase">Pastor Responsável</label>
              <input
                type="text"
                value={churchInfo?.pastor_name || ''}
                onChange={(e) => setChurchInfo(prev => prev ? {...prev, pastor_name: e.target.value} : null)}
                className="w-full rounded-lg border bg-white p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Endereço</label>
            <input
              type="text"
              value={churchInfo?.address || ''}
              onChange={(e) => setChurchInfo(prev => prev ? {...prev, address: e.target.value} : null)}
              className="w-full rounded-lg border bg-white p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Sobre a Igreja</label>
            <textarea
              rows={4}
              value={churchInfo?.about || ''}
              onChange={(e) => setChurchInfo(prev => prev ? {...prev, about: e.target.value} : null)}
              className="w-full rounded-lg border bg-white p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </section>

      {/* KB Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Base de Conhecimento (FAQ)</h2>
          <button 
            onClick={handleAddEntry}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus size={18} />
            Nova Pergunta
          </button>
        </div>

        <div className="grid gap-6">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-xl border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
              <div className="border-b px-6 py-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700">
                <input
                  type="text"
                  value={entry.category || ''}
                  onChange={(e) => handleUpdateEntry(entry.id, 'category', e.target.value)}
                  placeholder="Categoria"
                  className="bg-transparent font-medium text-blue-600 dark:text-blue-400 focus:outline-none text-sm uppercase tracking-wider"
                />
                <div className="flex items-center gap-2">
                  <button onClick={() => saveEntry(entry.id)} disabled={saving} className="p-2 text-gray-500 hover:text-blue-600">
                    <Save size={18} />
                  </button>
                  <button onClick={() => deleteEntry(entry.id)} className="p-2 text-gray-500 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  value={entry.question}
                  onChange={(e) => handleUpdateEntry(entry.id, 'question', e.target.value)}
                  className="w-full rounded-lg border bg-white p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white font-semibold"
                />
                <textarea
                  rows={3}
                  value={entry.answer}
                  onChange={(e) => handleUpdateEntry(entry.id, 'answer', e.target.value)}
                  className="w-full rounded-lg border bg-white p-2.5 text-sm focus:border-blue-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 flex gap-3">
        <Info className="text-blue-600 shrink-0" size={20} />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          O bot usa estas informações para treinar o modelo de IA e responder a congregação.
        </p>
      </div>
    </div>
  );
}
