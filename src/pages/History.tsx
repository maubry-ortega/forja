import React, { useEffect, useState } from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    RefresherEventDetail,
    IonButtons,
    IonButton
} from '@ionic/react';
import { trophy, calendar, trendingUp, flash, ribbon, download } from 'ionicons/icons';
import { dayService, DailyLog } from '../services/DayService';
import achievementService, { Achievement } from '../services/AchievementService';
import databaseService from '../services/DatabaseService';
import streakService from '../services/StreakService';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './History.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const History: React.FC = () => {
    const [history, setHistory] = useState<DailyLog[]>([]);
    const [forjaIndex, setForjaIndex] = useState<{ index: number; avgCompletion: number; streakBonus: number } | null>(null);
    const [chartData, setChartData] = useState<{ labels: string[]; data: number[] } | null>(null);
    const [categoryStats, setCategoryStats] = useState<Record<string, { total: number; completed: number; percentage: number }> | null>(null);
    const [achievements, setAchievements] = useState<Achievement[]>([]);



    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const hist = await dayService.getHistory(15);
        const index = await dayService.getForjaIndex();
        const cData = await dayService.getChartData(7);
        const cStats = await dayService.getCategoryStats();
        const achs = await achievementService.getAchievements();

        setHistory(hist);
        setForjaIndex(index);
        setChartData(cData);
        setCategoryStats(cStats);
        setAchievements(achs);
    };

    const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
        await loadData();
        event.detail.complete();
    };

    const exportData = async () => {
        try {
            const db = await databaseService.getDb();
            const tasks = (await db.query('SELECT * FROM tasks')).values || [];
            const logs = (await db.query('SELECT * FROM daily_logs')).values || [];
            const streak = await streakService.getStreak();

            const fullData = {
                export_date: new Date().toISOString(),
                tasks,
                daily_logs: logs,
                streak
            };

            const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `forja_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed', error);
        }
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1a1a1a',
                padding: 12,
                titleFont: { size: 14, weight: 'bold' as const },
                bodyFont: { size: 13 },
                displayColors: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: 'var(--chart-grid)' },
                ticks: { color: 'var(--chart-tick)', font: { size: 10 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: 'var(--chart-tick)', font: { size: 10 } }
            }
        }
    };

    const lineChartData = {
        labels: chartData?.labels || [],
        datasets: [
            {
                label: 'Cumplimiento %',
                data: chartData?.data || [],
                borderColor: '#3880ff',
                backgroundColor: 'rgba(56, 128, 255, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#3880ff',
                pointRadius: 4
            }
        ]
    };

    return (
        <IonPage>
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonTitle style={{ fontWeight: 800, color: 'var(--header-text-color)' }}>MÉTRICAS</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={exportData}>
                            <IonIcon icon={download} slot="icon-only" />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="history-container">
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="ion-padding">
                    <IonGrid>
                        <IonRow>
                            <IonCol size="12">
                                <IonCard className="forja-index-card">
                                    <IonCardContent>
                                        <div className="index-header">
                                            <IonIcon icon={trophy} color="warning" className="index-icon" />
                                            <IonText color="light">
                                                <h2 className="index-title">ÍNDICE FORJA</h2>
                                            </IonText>
                                        </div>
                                        <div className="index-value">{forjaIndex?.index || 0}</div>
                                        <IonText color="medium">
                                            <p className="index-subtitle">De 100 puntos de maestría</p>
                                        </IonText>

                                        <div className="index-stats-grid">
                                            <div className="stat-item">
                                                <div className="stat-label">CUMPLIMIENTO (14D)</div>
                                                <div className="stat-num">{forjaIndex?.avgCompletion}%</div>
                                            </div>
                                            <div className="stat-item">
                                                <div className="stat-label">BONO RACHA</div>
                                                <div className="stat-num">+{forjaIndex?.streakBonus}</div>
                                            </div>
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>

                        <IonRow>
                            <IonCol size="12">
                                <IonCard className="analytics-card">
                                    <IonCardHeader>
                                        <IonCardTitle className="card-title-small">
                                            <IonIcon icon={trendingUp} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                            Tendencia Semanal
                                        </IonCardTitle>
                                    </IonCardHeader>
                                    <IonCardContent style={{ height: '180px' }}>
                                        {chartData && <Line options={lineChartOptions} data={lineChartData} />}
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>

                        {categoryStats && Object.keys(categoryStats).length > 0 && (
                            <IonRow>
                                <IonCol size="12">
                                    <IonCard className="analytics-card">
                                        <IonCardHeader>
                                            <IonCardTitle className="card-title-small">
                                                Cumplimiento por Área
                                            </IonCardTitle>
                                        </IonCardHeader>
                                        <IonCardContent>
                                            <div style={{ height: '200px' }}>
                                                <Bar
                                                    options={{
                                                        ...lineChartOptions,
                                                        plugins: { ...lineChartOptions.plugins, legend: { display: false } },
                                                        scales: { ...lineChartOptions.scales, x: { ...lineChartOptions.scales.x, grid: { display: false } } }
                                                    }}
                                                    data={{
                                                        labels: Object.keys(categoryStats),
                                                        datasets: [{
                                                            label: '% Cumplimiento',
                                                            data: Object.values(categoryStats).map(s => s.percentage),
                                                            backgroundColor: [
                                                                'rgba(56, 128, 255, 0.6)',
                                                                'rgba(45, 211, 111, 0.6)',
                                                                'rgba(82, 96, 255, 0.6)',
                                                                'rgba(255, 196, 9, 0.6)',
                                                                'rgba(146, 148, 156, 0.6)'
                                                            ],
                                                            borderRadius: 8
                                                        }]
                                                    }}
                                                />
                                            </div>
                                        </IonCardContent>
                                    </IonCard>
                                </IonCol>
                            </IonRow>
                        )}

                        {achievements.length > 0 && (
                            <IonRow>
                                <IonCol size="12">
                                    <IonText color="medium">
                                        <h3 style={{ marginLeft: '10px', marginTop: '20px', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            MEDALLAS DE HONOR
                                        </h3>
                                    </IonText>
                                    <div className="achievements-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px', padding: '10px' }}>
                                        {achievements.map(ach => (
                                            <div key={ach.id} className={`achievement-item ${ach.unlocked ? 'unlocked' : 'locked'}`} style={{
                                                background: ach.unlocked ? 'rgba(56, 128, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                                borderRadius: '16px',
                                                padding: '16px',
                                                textAlign: 'center',
                                                opacity: ach.unlocked ? 1 : 0.4,
                                                filter: ach.unlocked ? 'none' : 'grayscale(1)',
                                                border: ach.unlocked ? '1px solid rgba(56, 128, 255, 0.3)' : '1px solid transparent'
                                            }}>
                                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{ach.unlocked ? ach.icon : '❓'}</div>
                                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: ach.unlocked ? 'var(--ion-color-primary)' : 'inherit' }}>{ach.title}</div>
                                            </div>
                                        ))}
                                    </div>
                                </IonCol>
                            </IonRow>
                        )}

                        <IonRow>
                            <IonCol size="12">
                                <IonText color="medium">
                                    <h3 style={{ marginLeft: '10px', marginTop: '20px', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        Historial de Voluntad
                                    </h3>
                                </IonText>
                                <IonList lines="none" className="history-list">
                                    {history.length === 0 && (
                                        <div style={{ textAlign: 'center', padding: '40px' }}>
                                            <IonText color="medium">No hay registros aún.</IonText>
                                        </div>
                                    )}
                                    {history.map((log) => (
                                        <IonCard key={log.id} className="history-log-card">
                                            <IonItem lines="none" className="log-header-item">
                                                <IonLabel>
                                                    <h2 style={{ fontWeight: 800 }}>{new Date(log.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</h2>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                        <IonText color={log.completed_count === log.total_count ? 'success' : 'warning'} style={{ fontWeight: 700 }}>
                                                            {log.total_count > 0 ? ((log.completed_count / log.total_count) * 100).toFixed(0) : 100}%
                                                        </IonText>
                                                        <IonText color="medium" style={{ fontSize: '0.8rem' }}>
                                                            ({log.completed_count}/{log.total_count} tareas)
                                                        </IonText>
                                                    </div>
                                                </IonLabel>
                                                <IonIcon
                                                    icon={log.completed_count === log.total_count ? flash : calendar}
                                                    slot="end"
                                                    color={log.completed_count === log.total_count ? 'success' : 'medium'}
                                                />
                                            </IonItem>
                                            {log.reflection && (
                                                <IonCardContent className="log-reflection">
                                                    <IonText color="light">
                                                        <p style={{ fontStyle: 'italic', opacity: 0.9 }}>"{log.reflection}"</p>
                                                    </IonText>
                                                </IonCardContent>
                                            )}
                                        </IonCard>
                                    ))}
                                </IonList>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default History;
