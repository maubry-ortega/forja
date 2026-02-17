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
    RefresherEventDetail
} from '@ionic/react';
import { trophy, calendar, trendingUp, flash } from 'ionicons/icons';
import { dayService, DailyLog } from '../services/DayService';
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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const hist = await dayService.getHistory(15);
        const index = await dayService.getForjaIndex();
        const cData = await dayService.getChartData(7);

        setHistory(hist);
        setForjaIndex(index);
        setChartData(cData);
    };

    const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
        await loadData();
        event.detail.complete();
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
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#888', font: { size: 10 } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#888', font: { size: 10 } }
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
                <IonToolbar color="dark">
                    <IonTitle style={{ fontWeight: 800 }}>MÉTRICAS</IonTitle>
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
                                    <IonCardContent style={{ height: '200px' }}>
                                        {chartData && <Line options={lineChartOptions} data={lineChartData} />}
                                    </IonCardContent>
                                </IonCard>
                            </IonCol>
                        </IonRow>

                        <IonRow>
                            <IonCol size="12">
                                <IonText color="medium">
                                    <h3 style={{ marginLeft: '10px', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
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
