import React from 'react';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { flash } from 'ionicons/icons';
import './TaskPromptModal.css';

interface TaskPromptModalProps {
    isOpen: boolean;
    onDismiss: () => void;
    onAction: () => void;
}

const TaskPromptModal: React.FC<TaskPromptModalProps> = ({ isOpen, onDismiss, onAction }) => {
    if (!isOpen) return null;

    return (
        <div className="task-prompt-overlay" onClick={onDismiss}>
            <div className="task-prompt-content" onClick={e => e.stopPropagation()}>
                <div className="prompt-icon-container">
                    <img src="/assets/VARKO.png" alt="Varko" className="prompt-icon" />
                </div>

                <h2 className="prompt-title">FORJA TU DESTINO</h2>

                <p className="prompt-text">
                    La voluntad se entrena cada día. <br />
                    No has forjado ningún desafío para hoy.
                </p>

                <IonButton
                    expand="block"
                    className="prompt-button"
                    onClick={() => {
                        onAction();
                        onDismiss();
                    }}
                >
                    <IonIcon icon={flash} slot="start" />
                    FORJAR AHORA
                </IonButton>

                <div className="prompt-close" onClick={onDismiss}>
                    DESPUÉS
                </div>
            </div>
        </div>
    );
};

export default TaskPromptModal;
