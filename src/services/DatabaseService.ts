import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

class DatabaseService {
    private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
    private db!: SQLiteDBConnection;
    private readonly DB_NAME = 'forja_db';

    async initialize() {
        console.log('DatabaseService: Initializing...');
        try {
            if (Capacitor.getPlatform() === 'web') {
                const jeepSqliteElem = document.querySelector('jeep-sqlite');
                if (jeepSqliteElem) {
                    await this.initWeb(jeepSqliteElem);
                } else {
                    console.warn('DatabaseService: jeep-sqlite element not found in DOM');
                }
            }

            const ret = await this.sqlite.checkConnectionsConsistency();
            const isConn = (await this.sqlite.isConnection(this.DB_NAME, false)).result;

            if (ret.result && isConn) {
                console.log('DatabaseService: Retrieving existing connection');
                this.db = await this.sqlite.retrieveConnection(this.DB_NAME, false);
            } else {
                console.log('DatabaseService: Creating new connection');
                this.db = await this.sqlite.createConnection(this.DB_NAME, false, 'no-encryption', 1, false);
            }

            await this.db.open();
            console.log('DatabaseService: Database opened');
            await this.createTables();

            if (Capacitor.getPlatform() === 'web') {
                await this.sqlite.saveToStore(this.DB_NAME);
            }
            console.log('DatabaseService: Initialization complete');
        } catch (error) {
            console.error('DatabaseService: Initialization failed', error);
        }
    }

    private async initWeb(jeepSqliteElem: any) {
        console.log('DatabaseService: Initializing web store...');
        return new Promise<void>((resolve) => {
            const timeout = setTimeout(() => {
                console.warn('DatabaseService: jeepSqliteReady timed out, attempting initWebStore anyway');
                this.sqlite.initWebStore().then(() => resolve()).catch(() => resolve());
            }, 2000);

            const handleReady = async () => {
                clearTimeout(timeout);
                console.log('DatabaseService: jeepSqliteReady event received');
                jeepSqliteElem.removeEventListener('jeepSqliteReady', handleReady);
                try {
                    await this.sqlite.initWebStore();
                    console.log('DatabaseService: Web store initialized');
                    resolve();
                } catch (error) {
                    console.error('DatabaseService: initWebStore failed', error);
                    resolve();
                }
            };
            jeepSqliteElem.addEventListener('jeepSqliteReady', handleReady);

            // If it's already rendered, it might have missed the event
            // Note: Stencil elements often have a componentOnReady() method
            if (jeepSqliteElem.componentOnReady) {
                jeepSqliteElem.componentOnReady().then(() => {
                    console.log('DatabaseService: jeep-sqlite component is ready (via componentOnReady)');
                });
            }
        });
    }



    private async createTables() {
        const tasksTable = `
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        category TEXT,
        date TEXT NOT NULL,
        due_time TEXT
      );
    `;

        const dailyLogsTable = `
      CREATE TABLE IF NOT EXISTS daily_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT UNIQUE NOT NULL,
        completed_count INTEGER DEFAULT 0,
        total_count INTEGER DEFAULT 0,
        reflection TEXT
      );
    `;

        const streakTable = `
      CREATE TABLE IF NOT EXISTS streak (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        current_streak INTEGER DEFAULT 0,
        last_completed_date TEXT,
        best_streak INTEGER DEFAULT 0
      );
    `;

        const userStatsTable = `
      CREATE TABLE IF NOT EXISTS user_stats (
        id INTEGER PRIMARY KEY DEFAULT 1,
        strength INTEGER DEFAULT 0,
        discipline INTEGER DEFAULT 0,
        wisdom INTEGER DEFAULT 0,
        total_exp INTEGER DEFAULT 0
      );
    `;

        const categoryProgressTable = `
      CREATE TABLE IF NOT EXISTS category_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        exp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        color TEXT
      );
    `;

        const ritualsTable = `
      CREATE TABLE IF NOT EXISTS rituals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT,
        due_time TEXT, -- Optional limit (e.g., 08:00)
        active INTEGER DEFAULT 1,
        last_completed_date TEXT
      );
    `;

        await this.db.execute(tasksTable);
        await this.db.execute(dailyLogsTable);
        await this.db.execute(streakTable);
        await this.db.execute(userStatsTable);
        await this.db.execute(categoryProgressTable);
        await this.db.execute(ritualsTable);

        // Apply Migrations for existing users
        await this.applyMigrations();

        // Initialize streak if not exists
        const res = await this.db.query('SELECT COUNT(*) as count FROM streak');
        if (res.values && res.values[0].count === 0) {
            await this.db.run('INSERT INTO streak (current_streak, best_streak) VALUES (0, 0)');
        }

        // Initialize user_stats if not exists
        const statsRes = await this.db.query('SELECT COUNT(*) as count FROM user_stats');
        if (statsRes.values && statsRes.values[0].count === 0) {
            await this.db.run('INSERT INTO user_stats (id, strength, discipline, wisdom, total_exp) VALUES (1, 0, 0, 0, 0)');
        }

        // Initialize default categories if not exists
        const categories = [
            { name: 'Trabajo', color: '#3880ff' },
            { name: 'Salud', color: '#2dd36f' },
            { name: 'Estudio', color: '#5260ff' },
            { name: 'Personal', color: '#ffc409' },
            { name: 'Otros', color: '#92949c' }
        ];
        for (const cat of categories) {
            await this.db.run('INSERT OR IGNORE INTO category_progress (name, exp, level, color) VALUES (?, ?, ?, ?)', [cat.name, 0, 1, cat.color]);
        }

        // Initialize default rituals if not exists
        const rituals = [
            { title: 'Madrugar (Antes 08:00)', category: 'Personal', due_time: '08:00' },
            { title: 'Ejercicio Diario', category: 'Salud', due_time: null },
            { title: 'Lectura Reflexiva', category: 'Estudio', due_time: null }
        ];
        const ritualCount = (await this.db.query('SELECT COUNT(*) as count FROM rituals')).values?.[0].count;
        if (ritualCount === 0) {
            for (const ritual of rituals) {
                await this.db.run('INSERT INTO rituals (title, category, due_time) VALUES (?, ?, ?)', [ritual.title, ritual.category, ritual.due_time]);
            }
        }
    }

    private async applyMigrations() {
        try {
            // Add reflection to daily_logs if missing
            await this.db.execute("ALTER TABLE daily_logs ADD COLUMN reflection TEXT;").catch(() => { });
            // Add due_time to tasks if missing
            await this.db.execute("ALTER TABLE tasks ADD COLUMN due_time TEXT;").catch(() => { });

            // Add Indexes for performance
            await this.db.execute("CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);").catch(() => { });
            await this.db.execute("CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);").catch(() => { });
        } catch (e) {
            console.warn('Migrations already applied or failed safely');
        }
    }


    async getDb() {
        if (!this.db) {
            await this.initialize();
        }
        return this.db;
    }

    async save() {
        if (Capacitor.getPlatform() === 'web') {
            await this.sqlite.saveToStore(this.DB_NAME);
        }
    }
}

const databaseService = new DatabaseService();
export default databaseService;
export { databaseService };
