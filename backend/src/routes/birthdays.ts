import { Router, Request, Response } from 'express';
import db from '../db/connection';

const router = Router();

// Helper: Get current week's date range
function getWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  // Adjust to Brasília time (UTC-3)
  const dayOfWeek = now.getDay(); // 0=Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // Go back to Monday
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

// GET /api/birthdays - Aniversariantes da semana (liderança)
router.get('/', (req: Request, res: Response) => {
  try {
    const { period } = req.query;
    const weekRange = getWeekRange();

    // Extract month and day from the week range
    const startMonth = weekRange.start.getMonth() + 1; // 1-12
    const startDay = weekRange.start.getDate();
    const endMonth = weekRange.end.getMonth() + 1;
    const endDay = weekRange.end.getDate();

    let birthdays: any[];

    if (period === 'month') {
      // All birthdays in current month
      const currentMonth = new Date().getMonth() + 1;
      birthdays = db.prepare(`
        SELECT * FROM leaders 
        WHERE is_active = 1 
          AND birth_date IS NOT NULL 
          AND CAST(strftime('%m', birth_date) AS INTEGER) = ?
        ORDER BY CAST(strftime('%d', birth_date) AS INTEGER) ASC
      `).all(currentMonth);
    } else if (period === 'today') {
      // Birthdays today
      const today = new Date();
      const todayMonth = today.getMonth() + 1;
      const todayDay = today.getDate();
      birthdays = db.prepare(`
        SELECT * FROM leaders 
        WHERE is_active = 1 
          AND birth_date IS NOT NULL 
          AND CAST(strftime('%m', birth_date) AS INTEGER) = ?
          AND CAST(strftime('%d', birth_date) AS INTEGER) = ?
      `).all(todayMonth, todayDay);
    } else {
      // Default: this week's birthdays
      // SQLite doesn't have great date functions for this, so we handle it with a query for the month
      // and filter in memory for the day range
      const candidates = db.prepare(`
        SELECT * FROM leaders 
        WHERE is_active = 1 
          AND birth_date IS NOT NULL
        ORDER BY birth_date ASC
      `).all() as any[];

      birthdays = candidates.filter((leader: any) => {
        const bday = new Date(leader.birth_date);
        const bdayThisYear = new Date(new Date().getFullYear(), bday.getMonth(), bday.getDate());
        return bdayThisYear >= weekRange.start && bdayThisYear <= weekRange.end;
      });

      // Sort by day of month
      birthdays.sort((a: any, b: any) => {
        const aDay = new Date(a.birth_date).getDate();
        const bDay = new Date(b.birth_date).getDate();
        return aDay - bDay;
      });
    }

    // Format the response
    const formatted = birthdays.map((leader: any) => {
      const birthDate = new Date(leader.birth_date);
      const monthNames = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
      return {
        ...leader,
        birthday_formatted: `${birthDate.getDate()} de ${monthNames[birthDate.getMonth()]}`,
      };
    });

    return res.json({ success: true, data: formatted, count: formatted.length });
  } catch (error) {
    console.error('Error fetching birthdays:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router;