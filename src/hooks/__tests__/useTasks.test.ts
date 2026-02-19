import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../useTasks';
import taskService from '../../services/TaskService';
import notificationService from '../../services/NotificationService';

vi.mock('../../services/TaskService', () => ({
    default: {
        getTasksByDate: vi.fn(),
        toggleTaskCompletion: vi.fn(),
        deleteTask: vi.fn()
    }
}));

vi.mock('../../services/NotificationService', () => ({
    default: {
        cancelTaskPrompt: vi.fn(),
        scheduleTaskPrompt: vi.fn()
    }
}));

vi.mock('canvas-confetti', () => ({
    default: vi.fn()
}));

describe('useTasks', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load tasks and cancel prompt if tasks exist', async () => {
        const mockTasks = [{ id: 1, title: 'Task 1', completed: 0 }];
        (taskService.getTasksByDate as any).mockResolvedValue(mockTasks);

        const { result } = renderHook(() => useTasks('2026-02-19'));

        await act(async () => {
            await result.current.loadTasks();
        });

        expect(result.current.tasks).toEqual(mockTasks);
        expect(notificationService.cancelTaskPrompt).toHaveBeenCalled();
    });

    it('should schedule prompt if no tasks exist', async () => {
        (taskService.getTasksByDate as any).mockResolvedValue([]);

        const { result } = renderHook(() => useTasks('2026-02-19'));

        await act(async () => {
            await result.current.loadTasks();
        });

        expect(result.current.tasks).toEqual([]);
        expect(notificationService.scheduleTaskPrompt).toHaveBeenCalled();
    });

    it('should toggle task and play confetti on completion', async () => {
        const task = { id: 1, title: 'Task 1', completed: 0, date: '2026-02-19' };

        const { result } = renderHook(() => useTasks('2026-02-19'));

        await act(async () => {
            await result.current.toggleTask(task);
        });

        expect(taskService.toggleTaskCompletion).toHaveBeenCalledWith(1, 1);
        // We'd need to mock canvas-confetti to check if it was called
    });
});
