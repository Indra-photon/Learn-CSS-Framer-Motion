import React from 'react';
import './styles.css';

interface CurrentTimeProps {
    time: number;
}

export function CurrentTime({ time }: CurrentTimeProps): React.JSX.Element {
    return (
        <p className='timer-text'>{formatTime(time)}</p>
    );
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
}