// src/components/charts/TrafficOverTimeProtocolChart.js

import React from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { CardTitle } from '../common/Card';

const TrafficOverTimeProtocolChart = () => {
    const { theme, chartColors } = useTheme();
    const isCustomTheme = theme === 'custom';
    const isDarkMode = theme === 'dark';
    const { protocolDistribution } = useData();

    const totalCount = protocolDistribution.reduce((acc, item) => acc + item.count, 0);
    const series = totalCount > 0 ? protocolDistribution.map(item => Math.round((item.count / totalCount) * 100)) : [];
    const labels = protocolDistribution.map(item => item.protocol.toUpperCase());

    const options = {
        chart: { type: 'radialBar' },
        plotOptions: {
            radialBar: {
                // FIX: Pushed the chart DOWN to make room for the legend now at the top.
                offsetY: 2,
                // Restored the hollow size to a more balanced look.
                hollow: { margin: 5, size: '60%', background: 'transparent' },
                track: { background: isDarkMode || isCustomTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' },
                dataLabels: {
                    name: { show: false },
                    value: { show: false },
                },
            },
        },
        labels: labels,
        colors: chartColors.protocolDistribution,
        legend: {
            show: true,
            // THIS IS THE KEY FIX: Changed position from 'bottom' to 'top'.
            position: 'top',
            fontFamily: 'inherit',
            fontSize: '12px',
            labels: { colors: chartColors.textColor },
            markers: { width: 8, height: 8, radius: 4 },
            itemMargin: { horizontal: 8, vertical: 2 },
            onItemClick: {
                toggleDataSeries: false
            }
        },
        stroke: { lineCap: 'round' },
        tooltip: {
            enabled: true,
            theme: isDarkMode || isCustomTheme ? 'dark' : 'light',
            y: { formatter: (val) => `${val}% of traffic` }
        }
    };

    const awaitingTextClasses = isCustomTheme
        ? "text-text-secondary"
        : "text-gray-500";

    return (
        <div className="h-full flex flex-col justify-start">
            <CardTitle>Traffic by Protocol</CardTitle>
            {series.length > 0 ? (
                <div className="flex-grow min-h-0">
                     <Chart options={options} series={series} type="radialBar" height="100%" />
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center">
                    <p className={`text-sm ${awaitingTextClasses}`}>Waiting for protocol data...</p>
                </div>
            )}
        </div>
    );
};

export default TrafficOverTimeProtocolChart;