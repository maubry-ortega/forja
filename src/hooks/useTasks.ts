import { useState, useCallback } from 'react';
import taskService, { Task } from '../services/TaskService';
import notificationService from '../services/NotificationService';
import statsService from '../services/StatsService';
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
            return fetchedTasks || [];
        } catch (error) {
            console.error('Failed to load tasks', error);
            return [];
        }
    }, [today]);

    const toggleTask = useCallback(async (task: Task, onComplete?: () => void, masterTaskId?: number | null) => {
        try {
            const newStatus = task.completed === 1 ? 0 : 1;
            await taskService.toggleTaskCompletion(task.id!, newStatus);

            if (newStatus === 1) {
                const isMasterTask = task.id === masterTaskId;
                await statsService.addExperience(task.category || 'default', isMasterTask ? 20 : 10);

                confetti({
                    particleCount: isMasterTask ? 200 : 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: isMasterTask ? ['#ffc409', '#ffffff'] : ['#2dd36f', '#3880ff']
                });
            } else {
                await statsService.subtractExperience(task.category || 'default');
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
