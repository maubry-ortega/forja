import { describe, it, expect, vi, beforeEach } from 'vitest';
import taskService from '../TaskService';
import databaseService from '../DatabaseService';
import notificationService from '../NotificationService';

vi.mock('../DatabaseService', () => ({
    default: {
        getDb: vi.fn(),
        save: vi.fn()
    }
}));

vi.mock('../NotificationService', () => ({
    default: {
        scheduleTaskNotification: vi.fn(),
        cancelNotification: vi.fn()
    }
}));

describe('TaskService', () => {
    const mockDb = {
        run: vi.fn(),
        query: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (databaseService.getDb as any).mockResolvedValue(mockDb);
    });

    it('should add a task and schedule notification if due_time exists', async () => {
        const task = { title: 'Test Task', completed: 0, date: '2026-02-19', due_time: '14:00' };
        mockDb.run.mockResolvedValue({ changes: { lastId: 1 } });

        await taskService.addTask(task);

        expect(mockDb.run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO tasks'),
            ['Test Task', 0, 'default', '2026-02-19', '14:00']
        );
        expect(notificationService.scheduleTaskNotification).toHaveBeenCalledWith(
            expect.objectContaining({ id: 1, due_time: '14:00' })
        );
    });

    it('should get tasks by date', async () => {
        const mockTasks = [{ id: 1, title: 'Task 1' }];
        mockDb.query.mockResolvedValue({ values: mockTasks });

        const tasks = await taskService.getTasksByDate('2026-02-19');

        expect(mockDb.query).toHaveBeenCalledWith(
            expect.stringContaining('SELECT * FROM tasks WHERE date = ?'),
            ['2026-02-19']
        );
        expect(tasks).toEqual(mockTasks);
    });

    it('should delete task and cancel notification', async () => {
        await taskService.deleteTask(1);

        expect(mockDb.run).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM tasks WHERE id = ?'),
            [1]
        );
        expect(notificationService.cancelNotification).toHaveBeenCalledWith(1);
    });
});
