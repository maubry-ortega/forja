import databaseService from './DatabaseService';

export interface AnnualRecap {
    totalTasksCompletadas: number;
    mesDorado: string;
    mejorMesCumplimiento: number;
    diasPerfectos: number;
    evolucionVarko: string;
}

class RecapService {
    async getAnnualRecap(): Promise<AnnualRecap> {
        const db = await databaseService.getDb();
        const year = new Date().getFullYear();

        // 1. Total tasks completed
        const tasksRes = await db.query("SELECT COUNT(*) as count FROM tasks WHERE completed = 1 AND date LIKE ?", [`${year}-%`]);
        const totalTasks = tasksRes.values?.[0].count || 0;

        // 2. Best Month
        const logsRes = await db.query("SELECT date, completed_count, total_count FROM daily_logs WHERE date LIKE ?", [`${year}-%`]);
        const logs = logsRes.values || [];

        const monthStats: Record<string, { completed: number, total: number }> = {};
        let perfectDays = 0;

        logs.forEach(log => {
            const month = log.date.substring(0, 7); // YYYY-MM
            if (!monthStats[month]) monthStats[month] = { completed: 0, total: 0 };
            monthStats[month].completed += log.completed_count;
            monthStats[month].total += log.total_count;

            if (log.completed_count === log.total_count && log.total_count > 0) perfectDays++;
        });

        let bestMonth = "N/A";
        let bestRate = 0;

        Object.entries(monthStats).forEach(([month, stats]) => {
            const rate = stats.total > 0 ? (stats.completed / stats.total) : 0;
            if (rate > bestRate) {
                bestRate = rate;
                bestMonth = month;
            }
        });

        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        const mesDoradoNombre = bestMonth !== "N/A" ? monthNames[parseInt(bestMonth.split('-')[1]) - 1] : "N/A";

        // 3. Varko Evolution Level
        const statsRes = await db.query("SELECT total_exp FROM user_stats LIMIT 1");
        const exp = statsRes.values?.[0].total_exp || 0;
        let varkoLevel = "Cría";
        if (exp >= 1000) varkoLevel = "Apex";
        else if (exp >= 500) varkoLevel = "Dominante";
        else if (exp >= 150) varkoLevel = "Cazador";

        return {
            totalTasksCompletadas: totalTasks,
            mesDorado: mesDoradoNombre,
            mejorMesCumplimiento: Math.round(bestRate * 100),
            diasPerfectos: perfectDays,
            evolucionVarko: varkoLevel
        };
    }
}

const recapService = new RecapService();
export default recapService;
export { recapService };
