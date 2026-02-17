import databaseService from './DatabaseService';
import taskService from './TaskService';
import streakService from './StreakService';

export interface DailyLog {
    id?: number;
    date: string;
    completed_count: number;
    total_count: number;
    reflection: string | null;
}

class DayService {
    async getCompletionStats(date: string) {
        const tasks = await taskService.getTasksByDate(date);
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed === 1).length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;

        return { total, completed, percentage };
    }

    async saveDailyLog(log: DailyLog) {
        const db = await databaseService.getDb();
        const query = `
      INSERT OR REPLACE INTO daily_logs (date, completed_count, total_count, reflection)
      VALUES (?, ?, ?, ?)
    `;
        const params = [log.date, log.completed_count, log.total_count, log.reflection];
        await db.run(query, params);

        // Update streak based on completion. If there were no tasks, it's considered "met" (not failed).
        const isGoalMet = log.completed_count === log.total_count;
        await streakService.updateStreak(isGoalMet, log.date);

        await databaseService.save();
    }

    async getPreviousClosingPending(currentDate: string): Promise<string | null> {
        const db = await databaseService.getDb();

        // 1. Get the latest date logged in daily_logs
        const lastLogRes = await db.query('SELECT date FROM daily_logs ORDER BY date DESC LIMIT 1');

        let startDate: string | null = null;
        if (lastLogRes.values && lastLogRes.values.length > 0) {
            // Start checking from the day after the last log
            const lastDate = new Date(lastLogRes.values[0].date);
            lastDate.setDate(lastDate.getDate() + 1);
            startDate = lastDate.toISOString().split('T')[0];
        } else {
            // If no logs, check if there are tasks earlier than today
            const firstTaskRes = await db.query('SELECT date FROM tasks WHERE date < ? ORDER BY date ASC LIMIT 1', [currentDate]);
            if (firstTaskRes.values && firstTaskRes.values.length > 0) {
                startDate = firstTaskRes.values[0].date;
            }
        }

        if (startDate && startDate < currentDate) {
            return startDate;
        }

        return null;
    }

    async getHistory(limit: number = 30): Promise<DailyLog[]> {
        const db = await databaseService.getDb();
        const res = await db.query('SELECT * FROM daily_logs ORDER BY date DESC LIMIT ?', [limit]);
        return res.values || [];
    }

    async getChartData(days: number = 7) {
        const db = await databaseService.getDb();
        // Fetch last N logs
        const res = await db.query('SELECT date, completed_count, total_count FROM daily_logs ORDER BY date DESC LIMIT ?', [days]);
        const logs = [...(res.values || [])].reverse();

        const labels = logs.map(l => {
            const date = new Date(l.date);
            return date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
        });

        const data = logs.map(l => (l.total_count > 0 ? (l.completed_count / l.total_count) * 100 : 0));

        return { labels, data };
    }

    async getForjaIndex() {
        const db = await databaseService.getDb();
        const streak = await streakService.getStreak();

        // Avg completion of last 14 days
        const res = await db.query('SELECT completed_count, total_count FROM daily_logs ORDER BY date DESC LIMIT 14');
        const logs = res.values || [];

        let avgCompletion = 0;
        if (logs.length > 0) {
            const sum = logs.reduce((acc, log) => {
                const perc = log.total_count > 0 ? (log.completed_count / log.total_count) : 1; // 1 if no tasks but closed? Or skip?
                return acc + perc;
            }, 0);
            avgCompletion = (sum / logs.length) * 100;
        }

        // Normalized streak: 30 days = 100% impact
        const normalizedStreak = Math.min(streak.current_streak / 30, 1) * 100;

        // Weight: 60% completion, 40% streak discipline
        const index = (avgCompletion * 0.6) + (normalizedStreak * 0.4);

        return {
            index: Math.round(index),
            avgCompletion: Math.round(avgCompletion),
            streakBonus: Math.round(normalizedStreak)
        };
    }


}

export const dayService = new DayService();
export default dayService;
