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

        // Update streak based on 100% completion (adjustable logic)
        const isGoalMet = log.total_count > 0 && log.completed_count === log.total_count;
        await streakService.updateStreak(isGoalMet, log.date);

        await databaseService.save();
    }

    async getPreviousClosingPending(currentDate: string): Promise<string | null> {
        const db = await databaseService.getDb();

        // Find dates in tasks that are not in daily_logs and are before currentDate
        const query = `
      SELECT DISTINCT date FROM tasks 
      WHERE date < ? 
      AND date NOT IN (SELECT date FROM daily_logs)
      ORDER BY date ASC LIMIT 1
    `;
        const res = await db.query(query, [currentDate]);

        if (res.values && res.values.length > 0) {
            return res.values[0].date;
        }
        return null;
    }
}

export const dayService = new DayService();
export default dayService;
