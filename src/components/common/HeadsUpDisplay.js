// src/components/common/HeadsUpDisplay.js (FINAL CORRECTED VERSION)

import React, { useContext } from 'react';     // 1. IMPORT useContext
import DataContext from '../../context/DataContext'; // 2. IMPORT the DataContext

import Card from './Card';
import SecurityPostureGauge from '../charts/SecurityPostureGauge';
import OSDistributionChart from '../charts/OSDistributionChart';
import AlertsTrendChart from '../charts/AlertsTrendChart';
import RiskSourceChart from '../charts/RiskSourceChart';

const HeadsUpDisplay = () => {
    // 3. PULL the live data from the DataContext
    const { securityPosture } = useContext(DataContext);

    // Provide a fallback in case the data is still loading
    const score = securityPosture ? securityPosture.health_score : 100;

    return (
        <Card className="lg:col-span-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 h-full">
                
                {/* 4. PASS the LIVE score to the gauge component */}
                <div className="h-48">
                    <SecurityPostureGauge value={score} />
                </div>
                
                <div className="h-48"><AlertsTrendChart /></div>
                <div className="h-48"><RiskSourceChart /></div>
                <div className="h-48"><OSDistributionChart /></div>
            </div>
        </Card>
    );
};

export default HeadsUpDisplay;