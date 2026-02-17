import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonButton,
  IonInput,
  IonIcon,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonBadge,
  IonText
} from '@ionic/react';
import { add, trash, flash } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import taskService, { Task } from '../services/TaskService';
import dayService from '../services/DayService';
import streakService, { Streak } from '../services/StreakService';
import DayClosureModal from '../components/DayClosureModal';
import './Home.css';

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState<string | undefined>(undefined);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [pendingClosureDate, setPendingClosureDate] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    checkContext();
  }, []);

  const checkContext = async () => {
    await loadTasks();
    await loadStreak();

    // Check if there's a previous day needing closure
    const pendingDate = await dayService.getPreviousClosingPending(today);
    if (pendingDate) {
      setPendingClosureDate(pendingDate);
    }
  };

  const loadTasks = async () => {
    try {
      const fetchedTasks = await taskService.getTasksByDate(today);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  };

  const loadStreak = async () => {
    const s = await streakService.getStreak();
    setStreak(s);
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      await taskService.addTask({
        title: newTaskTitle,
        completed: 0,
        date: today,
        due_time: newTaskTime
      });
      setNewTaskTitle('');
      setNewTaskTime(undefined);
      loadTasks();
    } catch (error) {
      console.error('Failed to add task', error);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      await taskService.toggleTaskCompletion(task.id!, task.completed === 1 ? 0 : 1);
      loadTasks();
    } catch (error) {
      console.error('Failed to toggle task', error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await taskService.deleteTask(id);
      loadTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const onDayClosed = async () => {
    setPendingClosureDate(null);
    checkContext(); // Check again if there's another day pending or just refresh today
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Forja</IonTitle>
          {streak && (
            <IonBadge slot="end" color="warning" style={{ marginRight: '10px', padding: '5px 10px' }}>
              <IonIcon icon={flash} /> {streak.current_streak}
            </IonBadge>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="ion-padding">
          <IonText color="medium">
            <p style={{ marginTop: 0 }}>Hoy: {today}</p>
          </IonText>

          <div style={{ background: '#f4f4f4', borderRadius: '15px', padding: '10px', marginBottom: '20px' }}>
            <IonItem lines="none" style={{ '--background': 'transparent' }}>
              <IonInput
                value={newTaskTitle}
                placeholder="¿Qué forjarás hoy?"
                onIonInput={(e) => setNewTaskTitle(e.detail.value!)}
              />
            </IonItem>
            <IonItem lines="none" style={{ '--background': 'transparent' }}>
              <IonLabel slot="start" color="medium" style={{ fontSize: '0.9rem' }}>Hora (opcional):</IonLabel>
              <IonInput
                type="time"
                value={newTaskTime}
                onIonInput={(e) => setNewTaskTime(e.detail.value!)}
                style={{ textAlign: 'right' }}
              />
              <IonButton slot="end" fill="clear" onClick={addTask}>
                <IonIcon icon={add} size="large" />
              </IonButton>
            </IonItem>
          </div>

          <IonList>
            {tasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <IonText color="medium">
                  <p>No hay tareas para hoy.<br />Añade tu primer desafío.</p>
                </IonText>
              </div>
            )}
            {tasks.map((task) => (
              <IonItemSliding key={task.id}>
                <IonItem>
                  <IonCheckbox
                    slot="start"
                    checked={task.completed === 1}
                    onIonChange={() => toggleTask(task)}
                  />
                  <IonLabel style={{
                    textDecoration: task.completed === 1 ? 'line-through' : 'none',
                    opacity: task.completed === 1 ? 0.6 : 1
                  }}>
                    <div style={{ fontWeight: '500' }}>{task.title}</div>
                    {task.due_time && (
                      <IonText color="primary" style={{ fontSize: '0.8rem' }}>
                        <IonIcon icon={flash} style={{ fontSize: '0.8rem', verticalAlign: 'middle' }} /> {task.due_time}
                      </IonText>
                    )}
                  </IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption color="danger" onClick={() => deleteTask(task.id!)}>
                    <IonIcon slot="icon-only" icon={trash} />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        </div>

        <DayClosureModal
          isOpen={!!pendingClosureDate}
          dateToClose={pendingClosureDate || ''}
          onClosed={onDayClosed}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;


