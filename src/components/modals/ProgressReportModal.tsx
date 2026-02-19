import React from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonIcon,
    IonText,
    IonFooter
} from '@ionic/react';
import { close, trendingUp, trendingDown, remove, star, heart, chatboxEllipses, shieldCheckmark } from 'ionicons/icons';
import { WeeklyReport } from '../../services/AnalyticsService';
import './ProgressReportModal.css';

interface ProgressReportModalProps {
    isOpen: boolean;
    onDismiss: () => void;
    report: WeeklyReport | null;
}

const ProgressReportModal: React.FC<ProgressReportModalProps> = ({ isOpen, onDismiss, report }) => {
    if (!report) return null;

    const getTrendIcon = () => {
        if (report.trend === 'up') return trendingUp;
        if (report.trend === 'down') return trendingDown;
        return remove;
    };

    const getTrendLabel = () => {
        if (report.trend === 'up') return 'Mejorando';
        if (report.trend === 'down') return 'Bajando';
        return 'Estable';
    };

    return (
        <IonModal isOpen={isOpen} onDidDismiss={onDismiss} className="report-modal">
            <IonHeader className="ion-no-border">
                <IonToolbar>
                    <IonTitle style={{ fontWeight: 800 }}>REPORTE ESTRATÉGICO</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={onDismiss}>
                            <IonIcon icon={close} slot="icon-only" />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="report-container">
                <div className="report-header-section">
                    <IonText color="medium">
                        <p style={{ margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Semana del {new Date(report.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al {new Date(report.endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </p>
                    </IonText>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '8px 0', color: 'var(--ion-text-color)' }}>{report.avgCompletion}%</h1>
                    <div className={`trend-badge trend-${report.trend}`}>
                        <IonIcon icon={getTrendIcon()} />
                        {getTrendLabel()}
                    </div>
                </div>

                <div className="report-card-grid">
                    <div className="stat-card">
                        <div className="stat-value">{report.completedTasks}/{report.totalTasks}</div>
                        <div className="stat-label">Desafíos</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value" style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>
                            {report.peakDay}
                        </div>
                        <div className="stat-label">Día Pico</div>
                    </div>
                </div>

                <div className="analysis-section">
                    <div className="analysis-card">
                        <div className="section-title">
                            <IonIcon icon={chatboxEllipses} />
                            Análisis Emocional
                        </div>
                        <p className="sentiment-text">"{report.sentimentSummary}"</p>
                    </div>

                    <div className="analysis-card">
                        <div className="section-title">
                            <IonIcon icon={star} />
                            Punto Débil
                        </div>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                            Los <span style={{ color: 'var(--ion-color-danger)' }}>{report.weakDay}</span> muestran menor cumplimiento. Mantente alerta.
                        </p>
                    </div>
                </div>

                <div className="advice-card">
                    <div className="section-title" style={{ color: 'white' }}>
                        <IonIcon icon={shieldCheckmark} />
                        Guía de Varko
                    </div>
                    <p className="advice-text">"{report.varkoAdvice}"</p>
                </div>
            </IonContent>

            <IonFooter className="ion-no-border">
                <div className="report-footer">
                    <IonButton expand="block" onClick={onDismiss} style={{ height: '60px', '--border-radius': '16px', fontWeight: 800, fontSize: '1.1rem' }}>
                        CONTINUAR LA FORJA
                    </IonButton>
                </div>
            </IonFooter>
        </IonModal>
    );
};

export default ProgressReportModal;
