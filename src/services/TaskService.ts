import databaseService from './DatabaseService';
import notificationService from './NotificationService';


export interface Task {
    id?: number;
    title: string;
    completed: number; // 0 or 1
    category?: string;
    date: string; // YYYY-MM-DD
    due_time?: string; // HH:mm or null
}

class TaskService {
    async addTask(task: Task) {
        const db = await databaseService.getDb();
        const query = 'INSERT INTO tasks (title, completed, category, date, due_time) VALUES (?, ?, ?, ?, ?)';
        const params = [task.title, task.completed, task.category || 'default', task.date, task.due_time || null];
        const res = await db.run(query, params);
        await databaseService.save();

        if (task.due_time && res.changes?.lastId) {
            try {
                await notificationService.scheduleTaskNotification({ ...task, id: Number(res.changes.lastId) });
            } catch (notifyError) {
                console.warn('Failed to schedule notification', notifyError);
            }
        }

        return res;
    }

    async getTasksByDate(date: string) {
        const db = await databaseService.getDb();
        const query = 'SELECT * FROM tasks WHERE date = ? ORDER BY id ASC';
        const res = await db.query(query, [date]);
        return res.values as Task[];
    }

    async updateTask(task: Task) {
        const db = await databaseService.getDb();
        const query = 'UPDATE tasks SET title = ?, completed = ?, category = ?, due_time = ? WHERE id = ?';
        const params = [task.title, task.completed, task.category, task.due_time, task.id];
        const res = await db.run(query, params);
        await databaseService.save();
        return res;
    }


    async deleteTask(id: number) {
        const db = await databaseService.getDb();
        const query = 'DELETE FROM tasks WHERE id = ?';
        const res = await db.run(query, [id]);
        await databaseService.save();
        await notificationService.cancelNotification(id);
        return res;
    }

    async toggleTaskCompletion(id: number, completed: number) {
        const db = await databaseService.getDb();
        const query = 'UPDATE tasks SET completed = ? WHERE id = ?';
        const res = await db.run(query, [completed, id]);
        await databaseService.save();
        return res;
    }
}

const taskService = new TaskService();
export default taskService;
export { taskService };
