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
            if (lastDate) {
                const last = new Date(lastDate);
                const currentData = new Date(date);
                // Reset hours to ensure clean day comparison
                last.setHours(0, 0, 0, 0);
                currentData.setHours(0, 0, 0, 0);

                const diffTime = currentData.getTime() - last.getTime();
                const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

                if (diffDays === 1) {
                    current += 1;
                } else if (diffDays > 1) {
                    current = 1; // Streak was broken by a gap, starting new streak today
                }
                // diffDays === 0: already processed this day or same day update, ignore increment
            } else {
                current = 1;
            }

            if (current > best) best = current;
            lastDate = date;
        } else {
            // Goal not met for this specific day being closed
            current = 0;
            // lastDate remains the same as the last successful day, 
            // but the streak count is broken.
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
