'use client'

import React from 'react'
import { useState, useRef } from 'react';
import useInterval from '@use-it/interval';
import { Controls } from './Controls';
import { CurrentTime } from './CurrentTime';
import './styles.css';

function DynamicIslandClock() {
    const [startTime, setStartTime] = useState<number>(0);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(0); 
    const animateRef = useRef<SVGCircleElement>(null);

    useInterval(
    () => {
      if (timeLeft === 0) {
        setIsRunning(false);
        return;
      }
      animateRef.current?.setAttribute('dur', `${startTime}s`);
      setTimeLeft((prev) => Math.max(0, prev - 1));
    },
    isRunning ? 1000 : null
  );
  return (
    <div>
      <div className="timer">
        <svg viewBox="0 0 24 24" width="64" strokeWidth="1.5">
          <g fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="6" opacity="0.2" />
            <circle
              cx="12"
              cy="12"
              r="6"
              strokeLinecap="round"
              strokeDasharray={38}
              strokeDashoffset={0}
              transform="rotate(-90 12 12)"
            >
              <animate
                ref={animateRef}
                attributeName="stroke-dashoffset"
                from="0"
                to="38"
                dur={`${startTime}s`}
                begin="play.click"
                fill="freeze"
              />

            </circle>
          </g>
          <line
            x1="12"
            y1="8"
            x2="12"
            y2="10"
            stroke="currentColor"
            strokeLinecap="round"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 12 12"
              to="-360 12 12"
              dur={`${startTime}s`}
              begin="play.click"
            />
          </line>
        </svg>
        <CurrentTime time={timeLeft} />
      </div>
      <Controls
        timeLeft={timeLeft}
        isRunning={isRunning}
        onTimeChange={(nextTime) => {
          setTimeLeft(nextTime);
          setStartTime(nextTime);
        }}
        onPlay={() => {
          if (timeLeft !== startTime) {
            setTimeLeft(startTime);
          }
          setIsRunning(!isRunning);
        }}
      />
    </div>
  )
}

export default DynamicIslandClock