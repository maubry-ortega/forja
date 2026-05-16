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
import { add, trash, flash, moon, sunny, briefcase, fitness, school, person, list, heart, star, timeOutline, alertCircleOutline, trophy } from 'ionicons/icons';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import React, { useEffect, useState, useCallback } from 'react';
import taskService, { Task } from '../services/TaskService';
import streakService, { Streak } from '../services/StreakService';
import dayService from '../services/DayService';
import ritualService from '../services/RitualService';
import notificationService from '../services/NotificationService';
import { useTasks } from '../hooks/useTasks';
import { useVarko } from '../hooks/useVarko';
import { usePhrase } from '../hooks/usePhrase';

import MorningGreetingModal from '../components/modals/MorningGreetingModal';
import DayClosureModal from '../components/modals/DayClosureModal';
import AddTaskModal from '../components/modals/AddTaskModal';
import VarkoProfileModal from '../components/modals/VarkoProfileModal';
import TaskPromptModal from '../components/modals/TaskPromptModal';
import VarkoRoaming from '../components/ui/VarkoRoaming';
import './Home.css';

const CATEGORY_MAP: Record<string, { icon: string; color: string }> = {
  'Trabajo': { icon: briefcase, color: 'var(--ion-color-secondary)' },
  'Salud': { icon: fitness, color: 'var(--ion-color-success)' },
  'Estudio': { icon: school, color: 'var(--ion-color-tertiary)' },
  'Personal': { icon: person, color: 'var(--ion-color-warning)' },
  'Otros': { icon: list, color: 'var(--ion-color-medium)' },
};

const Home: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [streak, setStreak] = useState<Streak | null>(null);
  const [pendingClosureDate, setPendingClosureDate] = useState<string | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVarkoProfileOpen, setIsVarkoProfileOpen] = useState(false);
  const [showTaskPrompt, setShowTaskPrompt] = useState(false);
  const [showMorningRitual, setShowMorningRitual] = useState(false);
  const [masterTaskId, setMasterTaskId] = useState<number | null>(null);
  const [rituals, setRituals] = useState<any[]>([]);

  // Custom Hooks
  const { tasks, loadTasks, toggleTask, deleteTask } = useTasks(today);
  const { varkoState, loadVarko } = useVarko();
  const { dailyPhrase, loadPhrase } = usePhrase();

  const loadRituals = useCallback(async () => {
    const rits = await ritualService.getDailyRitualTasks(today);
    setRituals(rits);
  }, [today]);

  useEffect(() => {
    const isDark = document.body.classList.contains('ion-palette-dark');
    setIsDarkMode(isDark);
    initialize();
  }, []);

  const initialize = async () => {
    const loadedTasks = await loadTasks();
    await loadRituals();
    await loadStreak();
    await loadVarko();
    await loadPhrase();

    const pendingDate = await dayService.getPreviousClosingPending(today);
    if (pendingDate) {
      setPendingClosureDate(pendingDate);
    }

    const lastRitualDate = localStorage.getItem('last_morning_ritual_date');
    if (lastRitualDate !== today && !pendingDate) {
      setShowMorningRitual(true);
    }

    const lastPromptDate = localStorage.getItem('last_task_prompt_date');
    if (loadedTasks?.length === 0 && lastPromptDate !== today && !pendingDate) {
      setShowTaskPrompt(true);
      localStorage.setItem('last_task_prompt_date', today);
    }

    notificationService.scheduleReflectionReminder();
  };

  const toggleTheme = (enable: boolean) => {
    setIsDarkMode(enable);
    document.body.classList.toggle('ion-palette-dark', enable);
  };

  const loadStreak = async () => {
    const s = await streakService.getStreak();
    setStreak(s);
  };

  const onDayClosed = async () => {
    setPendingClosureDate(null);
    initialize();
  };

  const handleToggleRitual = async (ritualTask: any) => {
    if (ritualTask.isExpired) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
      await ritualService.completeRitual(ritualTask.ritualId, today);
      await loadRituals();
      await loadVarko();
    } catch (e) { }
  };

  const allTasks = [...rituals, ...tasks];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle slot="start" style={{ fontWeight: 900, fontSize: '1.2rem', letterSpacing: '1px', color: 'var(--header-text-color)' }}>FORJA</IonTitle>
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
            {allTasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <IonIcon icon={add} style={{ fontSize: '120px', opacity: 0.05 }} />
                <IonText color="medium">
                  <p style={{ fontSize: '1.2rem', marginTop: '16px' }}>No hay tareas para hoy.<br />Presiona el botón + para forjar tu voluntad.</p>
                </IonText>
              </div>
            )}
            {allTasks.map((task) => (
              <IonItemSliding key={task.isRitual ? `ritual-${task.ritualId}` : `task-${task.id}`}>
                <IonItem className={`task-item ${task.isRitual ? 'ritual-item' : ''}`} style={{
                  '--background': task.id === masterTaskId ? 'rgba(var(--ion-color-warning-rgb), 0.08)' :
                    task.isRitual ? 'rgba(var(--ion-color-primary-rgb), 0.05)' :
                      'var(--ion-item-background, var(--ion-background-color))',
                  marginBottom: '14px',
                  borderRadius: '18px',
                  border: task.id === masterTaskId ? '2px solid var(--ion-color-warning)' :
                    task.isRitual ? '1px dashed rgba(var(--ion-color-primary-rgb), 0.3)' : 'none',
                  boxShadow: task.id === masterTaskId ? '0 4px 12px rgba(255, 196, 9, 0.15)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  <IonCheckbox
                    slot="start"
                    checked={task.completed === 1}
                    disabled={task.isExpired}
                    onIonChange={async () => {
                      if (task.completed === 0) {
                        try {
                          await Haptics.impact({ style: ImpactStyle.Heavy });
                        } catch (e) { }
                      }
                      if (task.isRitual) {
                        handleToggleRitual(task);
                      } else {
                        toggleTask(task, loadVarko, masterTaskId);
                      }
                    }}
                    color={task.id === masterTaskId ? "warning" : "success"}
                    style={{ '--border-radius': '6px' }}
                  />
                  <IonLabel style={{
                    opacity: (task.completed === 1 || task.isExpired) ? 0.5 : 1
                  }}>
                    <div className="task-title-container" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {task.isRitual && <IonIcon icon={trophy} color="primary" style={{ fontSize: '1rem' }} />}
                      {task.id === masterTaskId && <IonIcon icon={star} color="warning" style={{ fontSize: '1.1rem' }} />}
                      <div className="task-title" style={{
                        fontSize: '1.15rem',
                        fontWeight: (task.isRitual || task.id === masterTaskId) ? 800 : 600,
                        textDecoration: task.completed === 1 ? 'line-through' : 'none',
                        color: task.isExpired ? 'var(--ion-color-danger)' : 'inherit',
                        letterSpacing: (task.isRitual || task.id === masterTaskId) ? '0.3px' : 'normal'
                      }}>
                        {task.title}
                        {task.isRitual && <IonBadge color="primary" style={{ fontSize: '0.6rem', marginLeft: '8px', verticalAlign: 'middle', borderRadius: '4px' }}>RITUAL</IonBadge>}
                      </div>
                    </div>
                    {(task.due_time || task.isExpired) && (
                      <div className="task-time" style={{ marginTop: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}>
                        <IonIcon icon={task.isExpired ? alertCircleOutline : timeOutline} color={task.isExpired ? 'danger' : 'primary'} />
                        <IonText color={task.isExpired ? 'danger' : 'primary'} style={{ fontWeight: 700 }}>
                          {task.isExpired ? 'EXPIRADO' : `Límite: ${task.due_time}`}
                        </IonText>
                      </div>
                    )}
                  </IonLabel>
                  {task.category && !task.isRitual && (
                    <IonBadge slot="end" color="light" style={{ opacity: 0.6, fontSize: '0.65rem' }}>
                      {task.category}
                    </IonBadge>
                  )}
                </IonItem>
                {!task.isRitual && (
                  <IonItemOptions side="end">
                    <IonItemOption color="danger" onClick={() => deleteTask(task.id!)} style={{ borderRadius: '12px', margin: '0 4px 16px 0' }}>
                      <IonIcon slot="icon-only" icon={trash} />
                    </IonItemOption>
                  </IonItemOptions>
                )}
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

        <TaskPromptModal
          isOpen={showTaskPrompt}
          onDismiss={() => setShowTaskPrompt(false)}
          onAction={() => setIsAddTaskModalOpen(true)}
        />

        <MorningGreetingModal
          isOpen={showMorningRitual}
          onDismiss={() => {
            setShowMorningRitual(false);
            localStorage.setItem('last_morning_ritual_date', today);
          }}
          tasks={tasks}
          onMasterTaskSelected={(id) => setMasterTaskId(id)}
        />
      </IonContent>
      <VarkoRoaming state={varkoState} />
    </IonPage>
  );
};

export default Home;
