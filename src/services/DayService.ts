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

}

export const dayService = new DayService();
export default dayService;
