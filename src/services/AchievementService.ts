import streakService from './StreakService';
import dayService from './DayService';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
    condition: () => Promise<boolean>;
}

class AchievementService {
    private achievements: Achievement[] = [
        {
            id: 'initiation',
            title: 'Iniciación',
            description: 'Alcanza una racha de 3 días.',
            icon: '🔥',
            unlocked: false,
            condition: async () => {
                const s = await streakService.getStreak();
                return s.current_streak >= 3;
            }
        },
        {
            id: 'constancy',
            title: 'Constancia',
            description: 'Mantén una racha de 7 días.',
            icon: '🛡️',
            unlocked: false,
            condition: async () => {
                const s = await streakService.getStreak();
                return s.current_streak >= 7;
            }
        },
        {
            id: 'perfectionist',
            title: 'Perfeccionista',
            description: 'Cierra un día con el 100% de cumplimiento.',
            icon: '💎',
            unlocked: false,
            condition: async () => {
                const history = await dayService.getHistory(1);
                if (history.length === 0) return false;
                const lastLog = history[0];
                return lastLog.total_count > 0 && lastLog.completed_count === lastLog.total_count;
            }
        },
        {
            id: 'mastery',
            title: 'Maestría',
            description: 'Alcanza una racha de 15 días.',
            icon: '🦁',
            unlocked: false,
            condition: async () => {
                const s = await streakService.getStreak();
                return s.current_streak >= 15;
            }
        },
        {
            id: 'explorer',
            title: 'Explorador',
            description: 'Completa al menos una tarea en cada categoría.',
            icon: '🗺️',
            unlocked: false,
            condition: async () => {
                const stats = await dayService.getCategoryStats();
                const completedCats = Object.values(stats).filter(s => s.completed > 0);
                return completedCats.length >= 4; // Tenemos 5 categorías incluyendo 'Otros'
            }
        }
    ];

    async getAchievements(): Promise<Achievement[]> {
        const results = await Promise.all(
            this.achievements.map(async (acc) => {
                return { ...acc, unlocked: await acc.condition() };
            })
        );
        return results;
    }
}

const achievementService = new AchievementService();
export default achievementService;
export { achievementService };
