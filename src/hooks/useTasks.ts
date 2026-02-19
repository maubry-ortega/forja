import { useState, useCallback } from 'react';
import taskService, { Task } from '../services/TaskService';
import notificationService from '../services/NotificationService';
import confetti from 'canvas-confetti';

export const useTasks = (today: string) => {
    const [tasks, setTasks] = useState<Task[]>([]);

    const loadTasks = useCallback(async () => {
        try {
            const fetchedTasks = await taskService.getTasksByDate(today);
            setTasks(fetchedTasks || []);

            if (fetchedTasks && fetchedTasks.length > 0) {
                notificationService.cancelTaskPrompt();
            } else {
                notificationService.scheduleTaskPrompt();
            }
        } catch (error) {
            console.error('Failed to load tasks', error);
        }
    }, [today]);

    const toggleTask = useCallback(async (task: Task, onComplete?: () => void) => {
        try {
            const newStatus = task.completed === 1 ? 0 : 1;
            await taskService.toggleTaskCompletion(task.id!, newStatus);

            if (newStatus === 1) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#3880ff', '#2dd36f', '#ffc409']
                });
            }

            await loadTasks();
            if (onComplete) onComplete();
        } catch (error) {
            console.error('Failed to toggle task', error);
        }
    }, [loadTasks]);

    const deleteTask = useCallback(async (id: number) => {
        try {
            await taskService.deleteTask(id);
            await loadTasks();
        } catch (error) {
            console.error('Failed to delete task', error);
        }
    }, [loadTasks]);

    return {
        tasks,
        loadTasks,
        toggleTask,
        deleteTask
    };
};
