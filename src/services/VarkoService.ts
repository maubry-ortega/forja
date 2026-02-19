import dayService from './DayService';
import streakService from './StreakService';

export type VarkoLevel = 'Cría' | 'Cazador' | 'Dominante' | 'Apex';

export interface VarkoState {
    level: VarkoLevel;
    index: number;
    streak: number;
    description: string;
    message: string;
}

class VarkoService {
    async getVarkoState(): Promise<VarkoState> {
        const forjaIndex = await dayService.getForjaIndex();
        const streakData = await streakService.getStreak();

        const index = forjaIndex.index;
        const streak = streakData.current_streak;

        let level: VarkoLevel = 'Cría';
        let description = 'Un pequeño lagarto que apenas comienza su camino.';
        let message = 'Sigue forjando tu voluntad para crecer.';

        if (index > 75 && streak >= 15) {
            level = 'Apex';
            description = 'El depredador supremo. Nada detiene tu voluntad.';
            message = 'Eres la personificación de la disciplina.';
        } else if (index > 50 && streak >= 7) {
            level = 'Dominante';
            description = 'Un espécimen imponente que domina su entorno.';
            message = 'Tu consistencia es tu mayor fuerza.';
        } else if (index >= 25 && streak >= 3) {
            level = 'Cazador';
            description = 'Ágil y decidido, buscando su próxima victoria.';
            message = 'Estás encontrando tu ritmo. ¡No te detengas!';
        }

        return {
            level,
            index,
            streak,
            description,
            message
        };
    }
}

const varkoService = new VarkoService();
export default varkoService;
export { varkoService };
