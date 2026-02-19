import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyticsService } from '../../services/AnalyticsService';
import dayService from '../../services/DayService';

vi.mock('../../services/DayService', () => ({
    default: {
        getHistory: vi.fn(),
    }
}));

describe('AnalyticsService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should calculate "up" trend when completion improves', async () => {
        const mockHistory = [
            { date: '2026-02-19', total_count: 10, completed_count: 10, reflection: 'bueno éxito disciplina mejor fuerte' }, // last 7 days (avg 100%)
            { date: '2026-02-12', total_count: 10, completed_count: 5, reflection: 'cansado' }, // prev 7 days (avg 50%)
        ];

        // Fill to match 14 days logic in service (it slices 0,7 and 7,14)
        const fullMock = [
            ...Array(7).fill(mockHistory[0]),
            ...Array(7).fill(mockHistory[1])
        ];

        (dayService.getHistory as any).mockResolvedValue(fullMock);

        const report = await analyticsService.generateWeeklyReport('2026-02-19');

        expect(report.avgCompletion).toBe(100);
        expect(report.trend).toBe('up');
        expect(report.sentimentSummary).toContain('positivo');
    });

    it('should identify peak and weak days correctly', async () => {
        const mockHistory = [
            { date: '2026-02-19', total_count: 10, completed_count: 10 }, // Peak (100%)
            { date: '2026-02-18', total_count: 10, completed_count: 0 },  // Weak (0%)
            ...Array(5).fill({ date: '2026-02-17', total_count: 10, completed_count: 5 }),
            ...Array(7).fill({ date: '2026-02-10', total_count: 10, completed_count: 5 }),
        ];

        (dayService.getHistory as any).mockResolvedValue(mockHistory);

        const report = await analyticsService.generateWeeklyReport('2026-02-19');

        expect(report.peakDay).toBe('jueves'); // 19 Feb 2026 is Thursday
        expect(report.weakDay).toBe('miércoles'); // 18 Feb 2026 is Wednesday
    });

    it('should detect negative sentiment pattern', async () => {
        const mockHistory = Array(14).fill({
            date: '2026-02-19',
            total_count: 10,
            completed_count: 5,
            reflection: 'fallé porque estaba cansado y tuve pereza'
        });

        (dayService.getHistory as any).mockResolvedValue(mockHistory);

        const report = await analyticsService.generateWeeklyReport('2026-02-19');

        expect(report.sentimentSummary).toContain('fatiga');
    });

    it('should throw error if not enough data', async () => {
        (dayService.getHistory as any).mockResolvedValue([]);

        await expect(analyticsService.generateWeeklyReport('2026-02-19'))
            .rejects.toThrow('No hay suficientes datos');
    });
});
