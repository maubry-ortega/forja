import { LocalNotifications } from '@capacitor/local-notifications';
import { Task } from './TaskService';

class NotificationService {
    async requestPermissions() {
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
            await LocalNotifications.requestPermissions();
        }
    }

    async scheduleTaskNotification(task: Task) {
        if (!task.due_time) return;

        await this.requestPermissions();

        const [hours, minutes] = task.due_time.split(':').map(Number);
        const scheduleDate = new Date(task.date);
        scheduleDate.setHours(hours, minutes, 0, 0);

        // If the time has already passed for today, don't schedule
        if (scheduleDate.getTime() < Date.now()) return;

        await LocalNotifications.schedule({
            notifications: [
                {
                    title: '¡Es hora de forjar!',
                    body: `Desafío pendiente: ${task.title}`,
                    id: task.id || Math.floor(Math.random() * 10000),
                    schedule: { at: scheduleDate },
                    sound: 'beep.wav',
                    extra: { taskId: task.id }
                }
            ]
        });
    }

    async cancelNotification(id: number) {
        await LocalNotifications.cancel({
            notifications: [{ id }]
        });
    }

    async scheduleReflectionReminder() {
        await this.requestPermissions();

        const REFLECTION_NOTIF_ID = 9999;

        // Check if already scheduled to avoid duplicates
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.some(n => n.id === REFLECTION_NOTIF_ID)) {
            return;
        }

        await LocalNotifications.schedule({
            notifications: [
                {
                    title: 'Juicio del Día',
                    body: 'Es hora de examinar tu jornada. Forja tu voluntad.',
                    id: REFLECTION_NOTIF_ID,
                    schedule: {
                        on: {
                            hour: 21,
                            minute: 0
                        },
                        repeats: true,
                        allowWhileIdle: true
                    },
                    sound: 'beep.wav'
                }
            ]
        });
    }

    async scheduleTaskPrompt() {
        await this.requestPermissions();
        const TASK_PROMPT_ID = 8888;

        const pending = await LocalNotifications.getPending();
        if (pending.notifications.some(n => n.id === TASK_PROMPT_ID)) {
            return;
        }

        await LocalNotifications.schedule({
            notifications: [
                {
                    title: 'Forja tu Voluntad',
                    body: 'No has forjado ningún desafío para hoy. ¡Empieza ahora!',
                    id: TASK_PROMPT_ID,
                    schedule: {
                        on: {
                            hour: 10,
                            minute: 0
                        },
                        repeats: true,
                        allowWhileIdle: true
                    }
                }
            ]
        });
    }

    async cancelTaskPrompt() {
        await this.cancelNotification(8888);
    }
}

const notificationService = new NotificationService();
export default notificationService;
export { notificationService };
