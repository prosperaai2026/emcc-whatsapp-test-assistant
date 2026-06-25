import { 
  Users, 
  MessageSquare, 
  Calendar, 
  ArrowUpRight,
  TrendingUp,
  Cake
} from 'lucide-react';
import { api, Visitor, PrayerRequest } from '@/lib/api';

export default async function Dashboard() {
  // Fetch data on the server
  let report;
  try {
    report = await api.getWeeklyReport();
  } catch (error) {
    console.error('Failed to fetch weekly report:', error);
    // Fallback or empty state
    report = {
      total_visitors: 0,
      total_prayer_requests: 0,
      upcoming_events: [],
      birthdays_this_week: []
    };
  }

  const stats = [
    { name: 'Novos Visitantes', value: report.total_visitors.toString(), icon: Users, change: 'Esta semana', trend: 'neutral' },
    { name: 'Pedidos de Oração', value: report.total_prayer_requests.toString(), icon: MessageSquare, change: 'Esta semana', trend: 'neutral' },
    { name: 'Próximos Eventos', value: report.upcoming_events.length.toString(), icon: Calendar, change: 'Esta semana', trend: 'neutral' },
    { name: 'Aniversariantes', value: report.birthdays_this_week.length.toString(), icon: Cake, change: 'Esta semana', trend: 'neutral' },
  ];

  // Fetch recent visitors and prayers for the feeds
  let recentVisitors: Visitor[] = [];
  let recentPrayers: PrayerRequest[] = [];
  try {
    [recentVisitors, recentPrayers] = await Promise.all([
      api.getVisitors(5),
      api.getPrayerRequests()
    ]);
  } catch (error) {
    console.error('Failed to fetch recent activity:', error);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Visão Geral</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Semana de {new Date().toLocaleDateString('pt-BR')}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <stat.icon size={24} />
              </div>
              <div className="text-xs font-medium text-gray-500">
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {stat.name}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-xl border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="border-b px-6 py-4 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Visitantes Recentes</h3>
          </div>
          <div className="p-6">
            {recentVisitors.length > 0 ? (
              <ul className="space-y-4">
                {recentVisitors.map((visitor) => (
                  <li key={visitor.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Users size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{visitor.name}</p>
                        <p className="text-xs text-gray-500">{new Date(visitor.visited_at).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-blue-600 hover:underline">
                      Ver detalhes
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum visitante cadastrado esta semana.</p>
            )}
          </div>
        </div>

        {/* Prayer Requests */}
        <div className="rounded-xl border bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700">
          <div className="border-b px-6 py-4 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Últimos Pedidos de Oração</h3>
          </div>
          <div className="p-6">
            {recentPrayers.length > 0 ? (
              <ul className="space-y-4">
                {recentPrayers.slice(0, 5).map((request) => (
                  <li key={request.id} className="flex flex-col gap-1 border-b pb-4 last:border-0 last:pb-0 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {request.is_anonymous ? 'Anônimo' : request.name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {request.prayed_for > 0 ? `Orado ${request.prayed_for}x` : 'Pendente'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {request.request}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Nenhum pedido de oração pendente.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
