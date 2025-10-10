// src/components/charts/SecurityPostureGauge.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { CardTitle } from '../common/Card';
import { API_BASE_URL } from '../../api/config';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import CardSkeleton from '../common/CardSkeleton';

const AnimatedCounter = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

const SecurityPostureGauge = () => {
  const { chartColors } = useTheme();
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // This "defensive" code prevents crashes if the gauge object is missing.
  const { 
    gauge = { 
      gradientStart: '#cccccc', 
      gradientEnd: '#aaaaaa',
      track: '#e5e7eb',
      valueText: '#000000'
    } 
  } = chartColors || {}; 

  useEffect(() => {
    // ... fetch logic remains the same ...
    const fetchScore = async () => {
      try {
        const fullUrl = `${API_BASE_URL}/api/v1/cockpit/health-score`;
        const response = await axios.get(fullUrl);
        setScore(response.data.score);
      } catch (error) {
        console.error("Failed to fetch security posture score:", error);
        setScore(0);
      } finally {
        setLoading(false);
      }
    };
    fetchScore();
    const intervalId = setInterval(fetchScore, 30000);
    return () => clearInterval(intervalId);
  }, []);
  
  if (loading) {
    return <CardSkeleton className="h-full" />;
  }

  return (
    <div className="h-full w-full flex flex-col">
      <CardTitle>Security Posture</CardTitle>
      <div className="w-full flex-grow relative flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 200 180" style={{ position: 'absolute' }}>
          <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={gauge.gradientStart} />
                <stop offset="100%" stopColor={gauge.gradientEnd} />
              </linearGradient>
          </defs>
          <motion.path
            d="M 50 150 A 80 80 0 1 1 150 150"
            fill="none"
            strokeWidth="20"
            stroke={gauge.track}
            strokeLinecap="round"
          />
          <motion.path
            d="M 50 150 A 80 80 0 1 1 150 150"
            fill="none"
            strokeWidth="20"
            stroke="url(#scoreGradient)"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: score / 100, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        <div className="absolute flex flex-col items-center">
            <span 
              className="text-4xl font-bold tracking-tighter"
              style={{ color: gauge.valueText }} 
            >
              <AnimatedCounter value={score} />%
            </span>
            <span 
              className="text-xs -mt-1" 
              style={{ color: chartColors.textColor }}
            >
                HEALTH SCORE
            </span>
        </div>
      </div>
    </div>
  );
};

export default SecurityPostureGauge;