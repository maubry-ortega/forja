import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MorningGreeting from '../MorningGreeting';
import React from 'react';

describe('MorningGreeting', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.useFakeTimers();
    });

    it('should show greeting between 5AM and 12PM if not shown today', () => {
        // Mock time to 8:00 AM
        const date = new Date(2026, 1, 19, 8, 0, 0);
        vi.setSystemTime(date);

        render(<MorningGreeting />);

        // Advance timers for typewriter
        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(screen.getByText(/BUENOS DÍAS/i)).toBeInTheDocument();
        expect(localStorage.getItem('last_morning_greeting')).toBe('2026-02-19');
    });

    it('should NOT show greeting after 12PM', () => {
        // Mock time to 2:00 PM
        const date = new Date(2026, 1, 19, 14, 0, 0);
        vi.setSystemTime(date);

        const { container } = render(<MorningGreeting />);

        expect(container.innerHTML).toBe("");
    });

    it('should NOT show greeting before 5AM', () => {
        // Mock time to 4:00 AM
        const date = new Date(2026, 1, 19, 4, 0, 0);
        vi.setSystemTime(date);

        const { container } = render(<MorningGreeting />);

        expect(container.innerHTML).toBe("");
    });

    it('should NOT show greeting if already shown today', () => {
        const date = new Date(2026, 1, 19, 8, 0, 0);
        vi.setSystemTime(date);
        localStorage.setItem('last_morning_greeting', '2026-02-19');

        const { container } = render(<MorningGreeting />);

        expect(container.innerHTML).toBe("");
    });
});
