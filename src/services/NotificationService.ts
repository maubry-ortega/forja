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
}

const notificationService = new NotificationService();
export default notificationService;
export { notificationService };
