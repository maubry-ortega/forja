import databaseService from './DatabaseService';

export interface Ritual {
    id: number;
    title: string;
    category: string;
    due_time: string | null;
    active: number;
    last_completed_date: string | null;
}

class RitualService {
    async getActiveRituals(): Promise<Ritual[]> {
        const db = await databaseService.getDb();
        const res = await db.query('SELECT * FROM rituals WHERE active = 1');
        return (res.values || []) as Ritual[];
    }

    async completeRitual(id: number, date: string) {
        const db = await databaseService.getDb();
        await db.run('UPDATE rituals SET last_completed_date = ? WHERE id = ?', [date, id]);
        await databaseService.save();
    }

    isExpirated(ritual: Ritual): boolean {
        if (!ritual.due_time) return false;

        const now = new Date();
        const [hours, minutes] = ritual.due_time.split(':').map(Number);
        const limit = new Date();
        limit.setHours(hours, minutes, 0, 0);

        return now > limit;
    }

    async getDailyRitualTasks(date: string): Promise<any[]> {
        const rituals = await this.getActiveRituals();
        return rituals.map(r => {
            const isCompleted = r.last_completed_date === date;
            const isExpired = !isCompleted && this.isExpirated(r);

            return {
                id: `ritual_${r.id}`,
                ritualId: r.id,
                title: r.title,
                completed: isCompleted ? 1 : 0,
                isExpired: isExpired,
                category: r.category,
                date: date,
                isRitual: true,
                due_time: r.due_time
            };
        });
    }
}

const ritualService = new RitualService();
export default ritualService;
export { ritualService };
