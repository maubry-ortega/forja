import databaseService from './DatabaseService';

export interface CategoryStats {
    name: string;
    exp: number;
    level: number;
    color: string;
}

export interface UserStats {
    strength: number;
    discipline: number;
    wisdom: number;
    total_exp: number;
}

class StatsService {
    async getCategoryStats(): Promise<CategoryStats[]> {
        const db = await databaseService.getDb();
        const res = await db.query('SELECT * FROM category_progress');
        return (res.values || []) as CategoryStats[];
    }

    async getStats(): Promise<UserStats> {
        const db = await databaseService.getDb();
        const res = await db.query('SELECT * FROM user_stats LIMIT 1');
        return (res.values?.[0] || { strength: 0, discipline: 0, wisdom: 0, total_exp: 0 }) as UserStats;
    }

    private calculateLevel(exp: number): number {
        // Level logic: exp 100 -> Lvl 1, 400 -> Lvl 2, 900 -> Lvl 3...
        return Math.floor(Math.sqrt(exp / 100)) + 1;
    }

    async addExperience(category: string, amount: number = 10) {
        const db = await databaseService.getDb();

        // 1. Update Global Stats
        const stats = await this.getStats();
        let { strength, discipline, wisdom, total_exp } = stats;

        switch (category) {
            case 'Salud': strength += amount; break;
            case 'Trabajo':
            case 'Personal': discipline += amount; break;
            case 'Estudio': wisdom += amount; break;
            default: total_exp += amount / 2; break;
        }
        total_exp += amount;

        await db.run(
            'UPDATE user_stats SET strength = ?, discipline = ?, wisdom = ?, total_exp = ? WHERE id = 1',
            [strength, discipline, wisdom, total_exp]
        );

        // 2. Update Category Specific Stats
        const catRes = await db.query('SELECT exp FROM category_progress WHERE name = ?', [category]);
        if (catRes.values && catRes.values.length > 0) {
            const newExp = catRes.values[0].exp + amount;
            const newLevel = this.calculateLevel(newExp);
            await db.run(
                'UPDATE category_progress SET exp = ?, level = ? WHERE name = ?',
                [newExp, newLevel, category]
            );
        }

        await databaseService.save();
    }

    async subtractExperience(category: string, amount: number = 5) {
        const db = await databaseService.getDb();

        // 1. Update Global Stats
        const stats = await this.getStats();
        let { strength, discipline, wisdom, total_exp } = stats;

        switch (category) {
            case 'Salud': strength = Math.max(0, strength - amount); break;
            case 'Trabajo':
            case 'Personal': discipline = Math.max(0, discipline - amount); break;
            case 'Estudio': wisdom = Math.max(0, wisdom - amount); break;
            default: total_exp = Math.max(0, total_exp - amount / 2); break;
        }
        total_exp = Math.max(0, total_exp - amount);

        await db.run(
            'UPDATE user_stats SET strength = ?, discipline = ?, wisdom = ?, total_exp = ? WHERE id = 1',
            [strength, discipline, wisdom, total_exp]
        );

        // 2. Update Category Specific Stats
        const catRes = await db.query('SELECT exp FROM category_progress WHERE name = ?', [category]);
        if (catRes.values && catRes.values.length > 0) {
            const newExp = Math.max(0, catRes.values[0].exp - amount);
            const newLevel = this.calculateLevel(newExp);
            await db.run(
                'UPDATE category_progress SET exp = ?, level = ? WHERE name = ?',
                [newExp, newLevel, category]
            );
        }

        await databaseService.save();
    }
}

const statsService = new StatsService();
export default statsService;
export { statsService };
