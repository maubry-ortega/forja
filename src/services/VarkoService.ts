import dayService from './DayService';
import streakService from './StreakService';
import statsService, { UserStats } from './StatsService';

export type VarkoLevel = 'Cría' | 'Cazador' | 'Dominante' | 'Apex';
export type VarkoMood = 'Cansado' | 'Neutral' | 'Motivado' | 'Feroz';

export interface VarkoState {
    level: VarkoLevel;
    mood: VarkoMood;
    stats: UserStats;
    index: number;
    streak: number;
    description: string;
    message: string;
}

class VarkoService {
    async getVarkoState(): Promise<VarkoState> {
        const forjaIndex = await dayService.getForjaIndex();
        const streakData = await streakService.getStreak();
        const stats = await statsService.getStats();

        const index = forjaIndex.index;
        const streak = streakData.current_streak;

        let level: VarkoLevel = 'Cría';
        if (stats.total_exp >= 1000) level = 'Apex';
        else if (stats.total_exp >= 500) level = 'Dominante';
        else if (stats.total_exp >= 150) level = 'Cazador';

        let mood: VarkoMood = 'Neutral';
        if (index >= 90) mood = 'Feroz';
        else if (index >= 60) mood = 'Motivado';
        else if (index < 30) mood = 'Cansado';

        const descriptions: Record<VarkoLevel, string> = {
            'Cría': 'Un pequeño lagarto que apenas comienza su camino.',
            'Cazador': 'Ágil y decidido, buscando su próxima victoria.',
            'Dominante': 'Un espécimen imponente que domina su entorno.',
            'Apex': 'El depredador supremo. Nada detiene tu voluntad.'
        };

        const messages: Record<VarkoMood, string> = {
            'Cansado': 'Varko parece agotado. Necesitas forjar tu voluntad hoy.',
            'Neutral': 'Varko te observa en silencio. El camino sigue.',
            'Motivado': '¡Varko siente tu energía! Tu progreso es notable.',
            'Feroz': 'Varko ruge de poder. ¡Eres imparable!'
        };

        return {
            level,
            mood,
            stats,
            index,
            streak,
            description: descriptions[level],
            message: messages[mood]
        };
    }
}

const varkoService = new VarkoService();
export default varkoService;
export { varkoService };
