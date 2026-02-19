import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskPromptModal from '../TaskPromptModal';
import React from 'react';

describe('TaskPromptModal', () => {
    it('should call onDismiss when "DESPUÉS" is clicked', () => {
        const onDismiss = vi.fn();
        const onAction = vi.fn();

        render(<TaskPromptModal isOpen={true} onDismiss={onDismiss} onAction={onAction} />);

        fireEvent.click(screen.getByText(/DESPUÉS/i));
        expect(onDismiss).toHaveBeenCalled();
    });

    it('should call onAction and onDismiss when "FORJAR AHORA" is clicked', () => {
        const onDismiss = vi.fn();
        const onAction = vi.fn();

        render(<TaskPromptModal isOpen={true} onDismiss={onDismiss} onAction={onAction} />);

        fireEvent.click(screen.getByText(/FORJAR AHORA/i));
        expect(onAction).toHaveBeenCalled();
        expect(onDismiss).toHaveBeenCalled();
    });

    it('should NOT render when isOpen is false', () => {
        const { container } = render(<TaskPromptModal isOpen={false} onDismiss={() => { }} onAction={() => { }} />);
        expect(container.firstChild).toBeNull();
    });
});
