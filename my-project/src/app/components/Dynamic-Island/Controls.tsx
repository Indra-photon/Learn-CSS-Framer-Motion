import React from 'react';
import './styles.css';

type ControlsProps = {
    timeLeft: number;
    isRunning: boolean;
    onTimeChange: (time: number) => void;
    onPlay: () => void;
};

export function Controls ({timeLeft, isRunning, onTimeChange, onPlay}: ControlsProps): React.JSX.Element {
    return (
        <div className='controls'>
            <button
                disabled={isRunning}
                onClick={() => {
                    const nextTime = Math.max(0, timeLeft - 10);
                    onTimeChange(nextTime);
                }}
            >
                -10s
            </button>

            <button id="play" disabled={isRunning} onClick={onPlay}>
                Play
            </button>

            <button
                disabled={isRunning}
                onClick={() => {
                    const nextTime = timeLeft + 10;
                    onTimeChange(nextTime);
                }}
            >
                +10s
            </button>

        </div>
    )
} 