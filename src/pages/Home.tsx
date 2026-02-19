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
import { add, trash, flash, moon, sunny, briefcase, fitness, school, person, list, heart } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import taskService, { Task } from '../services/TaskService';
import dayService from '../services/DayService';
import streakService, { Streak } from '../services/StreakService';
import DayClosureModal from '../components/DayClosureModal';
import AddTaskModal from '../components/AddTaskModal';
import VarkoProfileModal from '../components/VarkoProfileModal';
import VarkoRoaming from '../components/VarkoRoaming';
import varkoService, { VarkoState } from '../services/VarkoService';
import phraseService, { DailyPhrase } from '../services/PhraseService';
import confetti from 'canvas-confetti';
import './Home.css';

const CATEGORY_MAP: Record<string, { icon: string; color: string }> = {
  'Trabajo': { icon: briefcase, color: 'var(--ion-color-secondary)' },
  'Salud': { icon: fitness, color: 'var(--ion-color-success)' },
  'Estudio': { icon: school, color: 'var(--ion-color-tertiary)' },
  'Personal': { icon: person, color: 'var(--ion-color-warning)' },
  'Otros': { icon: list, color: 'var(--ion-color-medium)' },
};


const Home: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [pendingClosureDate, setPendingClosureDate] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [varkoState, setVarkoState] = useState<VarkoState | null>(null);
  const [dailyPhrase, setDailyPhrase] = useState<DailyPhrase | null>(null);
  const [isVarkoProfileOpen, setIsVarkoProfileOpen] = useState(false);

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

    loadVarko();
    loadPhrase();
  };

  const loadPhrase = async () => {
    const p = await phraseService.getDailyPhrase();
    setDailyPhrase(p);
  };

  const loadVarko = async () => {
    const state = await varkoService.getVarkoState();
    setVarkoState(state);
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

      loadTasks();
      loadVarko();
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
          <IonTitle slot="start" style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '1px' }}>FORJA</IonTitle>
          <IonButtons slot="end">
            {streak && (
              <IonBadge color="warning" style={{ marginRight: '4px', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
                <IonIcon icon={flash} style={{ marginRight: '2px' }} /> {streak.current_streak}
              </IonBadge>
            )}
            <IonButton fill="clear" onClick={() => setIsVarkoProfileOpen(true)} style={{ margin: 0, '--padding-start': '4px', '--padding-end': '4px' }}>
              <IonIcon icon={heart} color="danger" style={{ fontSize: '1.3rem' }} />
            </IonButton>
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '2px', marginRight: '4px' }}>
              <IonIcon icon={isDarkMode ? moon : sunny} color={isDarkMode ? 'warning' : 'medium'} style={{ fontSize: '1.1rem', marginRight: '2px' }} />
              <IonToggle
                checked={isDarkMode}
                onIonChange={(e) => toggleTheme(e.detail.checked)}
                style={{ '--handle-spacing': '1px', transform: 'scale(0.8)' }}
              />
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="home-container">
        <div className="ion-padding">
          <div className="date-header" style={{ marginBottom: '24px' }}>
            <IonText color="medium">
              <h1 style={{ margin: 0, fontWeight: 800, fontSize: '2.5rem', textTransform: 'capitalize' }}>Hoy</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontStyle: 'italic' }}>
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </IonText>
          </div>

          {dailyPhrase && (
            <div className="phrase-container" style={{
              background: 'rgba(var(--ion-text-color-rgb, 0,0,0), 0.05)',
              padding: '20px',
              borderRadius: '20px',
              marginBottom: '32px',
              borderLeft: '5px solid var(--ion-color-primary)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <IonText style={{ color: 'var(--ion-text-color)' }}>
                <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.5', fontWeight: 500, fontStyle: 'italic', color: 'inherit' }}>
                  "{dailyPhrase.phrase}"
                </p>
                <p style={{ margin: '12px 0 0 0', fontSize: '0.85rem', opacity: 0.6, textAlign: 'right', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'inherit' }}>
                  — {dailyPhrase.author}
                </p>
              </IonText>
            </div>
          )}


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
                    <div className="task-title-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {task.category && task.category !== 'default' && (
                        <IonIcon
                          icon={CATEGORY_MAP[task.category]?.icon || list}
                          style={{
                            color: CATEGORY_MAP[task.category]?.color || 'var(--ion-color-medium)',
                            fontSize: '1.2rem'
                          }}
                        />
                      )}
                      <div className="task-title" style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textDecoration: task.completed === 1 ? 'line-through' : 'none',
                      }}>{task.title}</div>
                    </div>
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

        <VarkoProfileModal
          isOpen={isVarkoProfileOpen}
          onDismiss={() => setIsVarkoProfileOpen(false)}
          state={varkoState}
        />
      </IonContent>
      <VarkoRoaming state={varkoState} />
    </IonPage>
  );
};

export default Home;
