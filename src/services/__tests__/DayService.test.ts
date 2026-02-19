import { describe, it, expect, vi, beforeEach } from 'vitest';
import dayService from '../DayService';
import taskService from '../TaskService';
import databaseService from '../DatabaseService';
import streakService from '../StreakService';

vi.mock('../DatabaseService', () => ({
    default: {
        getDb: vi.fn(),
        save: vi.fn()
    }
}));

vi.mock('../TaskService', () => ({
    default: {
        getTasksByDate: vi.fn()
    }
}));

vi.mock('../StreakService', () => ({
    default: {
        getStreak: vi.fn(),
        updateStreak: vi.fn()
    }
}));

describe('DayService', () => {
    const mockDb = {
        run: vi.fn(),
        query: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (databaseService.getDb as any).mockResolvedValue(mockDb);
    });

    it('should calculate completion stats correctly', async () => {
        (taskService.getTasksByDate as any).mockResolvedValue([
            { completed: 1 },
            { completed: 0 }
        ]);

        const stats = await dayService.getCompletionStats('2026-02-19');

        expect(stats.total).toBe(2);
        expect(stats.completed).toBe(1);
        expect(stats.percentage).toBe(50);
    });

    it('should save daily log and update streak', async () => {
        const log = {
            date: '2026-02-19',
            completed_count: 5,
            total_count: 5,
            reflection: 'Excelente'
        };

        await dayService.saveDailyLog(log);

        expect(mockDb.run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT OR REPLACE INTO daily_logs'),
            [log.date, 5, 5, 'Excelente']
        );
        expect(streakService.updateStreak).toHaveBeenCalledWith(true, log.date);
    });

    it('should calculate Forja Index with weighted logic', async () => {
        (streakService.getStreak as any).mockResolvedValue({ current_streak: 15 });
        mockDb.query.mockResolvedValue({
            values: [
                { total_count: 10, completed_count: 10 },
                { total_count: 10, completed_count: 0 }
            ]
        });

        const result = await dayService.getForjaIndex();

        // Avg completion: (100% + 0%) / 2 = 50%
        // Normalized streak: 15 / 30 = 50%
        // Index: (50 * 0.6) + (50 * 0.4) = 30 + 20 = 50
        expect(result.index).toBe(50);
    });
});
