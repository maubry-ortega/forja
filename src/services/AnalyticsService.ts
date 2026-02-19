import dayService, { DailyLog } from './DayService';

export interface WeeklyReport {
    startDate: string;
    endDate: string;
    avgCompletion: number;
    trend: 'up' | 'down' | 'stable';
    weakDay: string;
    peakDay: string;
    sentimentSummary: string;
    varkoAdvice: string;
    totalTasks: number;
    completedTasks: number;
}

class AnalyticsService {
    private POSITIVE_KEYWORDS = ['logré', 'bueno', 'éxito', 'disciplina', 'mejor', 'fuerte', 'voluntad', 'pude', 'conseguí', 'avanzando'];
    private NEGATIVE_KEYWORDS = ['cansado', 'fallé', 'difícil', 'pereza', 'mal', 'frustrado', 'perdí', 'distracción', 'procrastiné', 'mañana'];

    async generateWeeklyReport(currentDate: string): Promise<WeeklyReport> {
        const history = await dayService.getHistory(14); // Get last 14 logs to compare trends
        const last7Days = history.slice(0, 7).reverse();
        const previous7Days = history.slice(7, 14).reverse();

        if (last7Days.length === 0) {
            throw new Error('No hay suficientes datos para generar un reporte.');
        }

        const totalTasks = last7Days.reduce((acc, log) => acc + log.total_count, 0);
        const completedTasks = last7Days.reduce((acc, log) => acc + log.completed_count, 0);
        const avgCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

        // Trend calculation
        const prevTotal = previous7Days.reduce((acc, log) => acc + log.total_count, 0);
        const prevCompleted = previous7Days.reduce((acc, log) => acc + log.completed_count, 0);
        const prevAvg = prevTotal > 0 ? (prevCompleted / prevTotal) * 100 : 0;

        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (avgCompletion > prevAvg + 5) trend = 'up';
        else if (avgCompletion < prevAvg - 5) trend = 'down';

        // Weak/Peak days
        let peakDay = last7Days[0];
        let weakDay = last7Days[0];

        last7Days.forEach(log => {
            const perc = log.total_count > 0 ? log.completed_count / log.total_count : 0;
            const peakPerc = peakDay.total_count > 0 ? peakDay.completed_count / peakDay.total_count : 0;
            const weakPerc = weakDay.total_count > 0 ? weakDay.completed_count / weakDay.total_count : 0;

            if (perc >= peakPerc) peakDay = log;
            if (perc <= weakPerc) weakDay = log;
        });

        const formatDate = (dateStr: string) => {
            return new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'long' });
        };

        // Sentiment patterns
        const reflections = last7Days.map(l => l.reflection || '').join(' ').toLowerCase();
        const posCount = this.POSITIVE_KEYWORDS.filter(k => reflections.includes(k)).length;
        const negCount = this.NEGATIVE_KEYWORDS.filter(k => reflections.includes(k)).length;

        let sentimentSummary = "Tus reflexiones muestran un equilibrio emocional estable.";
        if (posCount > negCount + 2) sentimentSummary = "Tu tono es altamente positivo y resiliente. Estás dominando tu mente.";
        else if (negCount > posCount + 1) sentimentSummary = "Detecto patrones de fatiga o frustración. Recuerda que la disciplina es amor propio.";

        // Varko's Advice
        let varkoAdvice = "Sigue forjando. No te detengas.";
        if (trend === 'down') varkoAdvice = "Has bajado el ritmo. El acero se enfría si no lo golpeas. Retoma la intensidad.";
        else if (avgCompletion > 90) varkoAdvice = "Tu voluntad es pura. Estás listo para desafíos más grandes.";
        else if (avgCompletion < 50) varkoAdvice = "Menos del 50%. No permitas que la mediocridad gane. Reorganiza tu día.";

        return {
            startDate: last7Days[0].date,
            endDate: last7Days[last7Days.length - 1].date,
            avgCompletion: Math.round(avgCompletion),
            trend,
            weakDay: formatDate(weakDay.date),
            peakDay: formatDate(peakDay.date),
            sentimentSummary,
            varkoAdvice,
            totalTasks,
            completedTasks
        };
    }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
