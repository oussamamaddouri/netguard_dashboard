// src/components/charts/HealthScoreBreakdown.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';
import { API_BASE_URL } from '../../api/config';
import { CardTitle } from '../common/Card';
import CardSkeleton from '../common/CardSkeleton'; // Import the skeleton
import { motion } from 'framer-motion';

const HealthScoreBreakdown = () => {
    const { theme } = useTheme();
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHealthDetails = async () => {
            // Set loading to true only for the first fetch
            if (!healthData) setLoading(true); 
            try {
                const fullUrl = `${API_BASE_URL}/api/v1/cockpit/health-score`;
                const response = await axios.get(fullUrl);
                setHealthData(response.data);
            } catch (error) {
                console.error("Failed to fetch health score details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHealthDetails();
        const intervalId = setInterval(fetchHealthDetails, 30000);
        return () => clearInterval(intervalId);
    }, [healthData]); // Added healthData dependency to avoid constant state sets

    const textColor = theme === 'dark' ? 'text-dark-text-primary' : 'text-light-text-primary';
    const secondaryText = theme === 'dark' ? 'text-dark-text-secondary' : 'text-light-text-secondary';
    const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
    const deductionClass = 'text-red-500 font-mono';
    const ipColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

    if (loading) {
        return (
             <div className='h-full w-full'>
                {/* Use CardSkeleton with appropriate height */}
                <CardSkeleton className="h-full" />
            </div>
        );
    }
    
    if (!healthData) return null;

    const activeDeductions = healthData.details.filter(item => item.deduction > 0);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className='h-full w-full flex flex-col text-sm'
        >
            <CardTitle>Health Score Breakdown</CardTitle>
            <p className={`text-xs ${secondaryText} mb-2`}>Based on events in the last hour</p>
            <div className="w-full flex-grow flex flex-col space-y-1 pr-2">
                <div className={`flex justify-between items-center py-1 border-b ${borderColor}`}>
                    <span className={textColor}>Base Score</span>
                    <span className={`${textColor} font-mono`}>{healthData.base_score}</span>
                </div>

                {activeDeductions.length > 0 ? (
                    activeDeductions.map((item, index) => (
                      <React.Fragment key={index}>
                        <div className={`flex justify-between items-center py-1`}>
                          <span className={secondaryText}>{item.reason} ({item.count})</span>
                          <span className={deductionClass}>-{item.deduction}</span>
                        </div>
                        {item.items && item.items.length > 0 && (
                          <div className="pl-4 -mt-1 mb-2 text-xs">
                            {item.items.map((ip, ipIndex) => (
                              <div key={ipIndex} className={`${ipColor} font-mono`}>
                                {ip}
                              </div>
                            ))}
                          </div>
                        )}
                      </React.Fragment>
                    ))
                ) : (
                    <div className="flex-grow flex items-center justify-center text-green-500 text-xs">
                        No recent negative events detected.
                    </div>
                )}
                
                <div className={`flex justify-between items-center pt-2 font-bold ${textColor} border-t ${borderColor}`}>
                    <span>Final Score</span>
                    <span className="font-mono">{healthData.score}%</span>
                </div>
            </div>
        </motion.div>
    );
};

export default HealthScoreBreakdown;