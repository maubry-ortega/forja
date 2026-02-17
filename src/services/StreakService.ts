import databaseService from './DatabaseService';

export interface Streak {
    id?: number;
    current_streak: number;
    last_completed_date: string | null;
    best_streak: number;
}

class StreakService {
    async getStreak(): Promise<Streak> {
        const db = await databaseService.getDb();
        const res = await db.query('SELECT * FROM streak LIMIT 1');
        return res.values![0] as Streak;
    }

    async updateStreak(isGoalMet: boolean, date: string) {
        const db = await databaseService.getDb();
        const streak = await this.getStreak();

        let current = streak.current_streak;
        let best = streak.best_streak;
        let lastDate = streak.last_completed_date;

        if (isGoalMet) {
            // Logic for incrementing: check if yesterday was the last completed date
            if (lastDate) {
                const last = new Date(lastDate);
                const currentData = new Date(date);
                const diffDays = Math.floor((currentData.getTime() - last.getTime()) / (1000 * 3600 * 24));

                if (diffDays === 1) {
                    current += 1;
                } else if (diffDays > 1) {
                    current = 1; // Reset to 1 if a day was missed
                }
                // if diffDays === 0, it's the same day, don't increment
            } else {
                current = 1;
            }

            if (current > best) best = current;
            lastDate = date;
        } else {
            // If goal wasn't met, we might reset streak immediately or wait for day closure
            // Usually reset happens if day closure reveals < 100% or threshold
            current = 0;
        }

        await db.run(
            'UPDATE streak SET current_streak = ?, last_completed_date = ?, best_streak = ? WHERE id = ?',
            [current, lastDate, best, streak.id]
        );
        await databaseService.save();
        return { current, best };
    }
}

export const streakService = new StreakService();
export default streakService;
