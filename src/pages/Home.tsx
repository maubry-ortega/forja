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
  IonIcon,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonBadge,
  IonText,
  IonToggle,
  IonButtons,
  IonFab,
  IonFabButton
} from '@ionic/react';
import { add, trash, flash, moon, sunny } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import taskService, { Task } from '../services/TaskService';
import dayService from '../services/DayService';
import streakService, { Streak } from '../services/StreakService';
import DayClosureModal from '../components/DayClosureModal';
import AddTaskModal from '../components/AddTaskModal';
import './Home.css';

const Home: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [pendingClosureDate, setPendingClosureDate] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Check initial theme
    const isDark = document.body.classList.contains('ion-palette-dark');
    setIsDarkMode(isDark);
    checkContext();
  }, []);

  const toggleTheme = (enable: boolean) => {
    setIsDarkMode(enable);
    document.body.classList.toggle('ion-palette-dark', enable);
  };

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
      setTasks(fetchedTasks || []);
    } catch (error) {
      console.error('Failed to load tasks', error);
    }
  };

  const loadStreak = async () => {
    const s = await streakService.getStreak();
    setStreak(s);
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
    checkContext();
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar color="dark">
          <IonTitle style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '1px' }}>FORJA</IonTitle>
          <IonButtons slot="end">
            <div className="theme-toggle-container">
              <IonIcon icon={isDarkMode ? moon : sunny} color={isDarkMode ? 'warning' : 'medium'} />
              <IonToggle
                checked={isDarkMode}
                onIonChange={(e) => toggleTheme(e.detail.checked)}
              />
            </div>
            {streak && (
              <IonBadge color="warning" style={{ marginRight: '16px', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                <IonIcon icon={flash} style={{ marginRight: '4px' }} /> {streak.current_streak}
              </IonBadge>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="home-container">
        <div className="ion-padding">
          <div className="date-header" style={{ marginBottom: '32px' }}>
            <IonText color="medium">
              <h1 style={{ margin: 0, fontWeight: 800, fontSize: '2.5rem', textTransform: 'capitalize' }}>Hoy</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontStyle: 'italic' }}>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </IonText>
          </div>

          <IonList className="task-list" lines="none">
            {tasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <IonIcon icon={add} style={{ fontSize: '120px', opacity: 0.05 }} />
                <IonText color="medium">
                  <p style={{ fontSize: '1.2rem', marginTop: '16px' }}>No hay tareas para hoy.<br />Presiona el botón + para forjar tu voluntad.</p>
                </IonText>
              </div>
            )}
            {tasks.map((task) => (
              <IonItemSliding key={task.id}>
                <IonItem className="task-item" style={{
                  '--background': 'var(--ion-item-background, var(--ion-background-color))',
                  marginBottom: '16px'
                }}>
                  <IonCheckbox
                    slot="start"
                    checked={task.completed === 1}
                    onIonChange={() => toggleTask(task)}
                    color="success"
                  />
                  <IonLabel style={{
                    opacity: task.completed === 1 ? 0.5 : 1
                  }}>
                    <div className="task-title" style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      textDecoration: task.completed === 1 ? 'line-through' : 'none',
                    }}>{task.title}</div>
                    {task.due_time && (
                      <div className="task-time" style={{ marginTop: '4px', fontSize: '0.9rem' }}>
                        <IonText color="primary">
                          <IonIcon icon={flash} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> {task.due_time}
                        </IonText>
                      </div>
                    )}
                  </IonLabel>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption color="danger" onClick={() => deleteTask(task.id!)} style={{ borderRadius: '12px', margin: '0 4px 16px 0' }}>
                    <IonIcon slot="icon-only" icon={trash} />
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: '24px', marginRight: '16px' }}>
          <IonFabButton onClick={() => setIsAddTaskModalOpen(true)} color="primary" style={{ '--box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.4)' }}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <AddTaskModal
          isOpen={isAddTaskModalOpen}
          onDismiss={() => setIsAddTaskModalOpen(false)}
          onTaskAdded={loadTasks}
          date={today}
        />

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
