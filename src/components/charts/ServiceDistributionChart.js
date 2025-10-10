// src/components/charts/ServiceDistributionChart.js

import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { CardTitle } from '../common/Card';

const formatBytes = (bytes) => {
    if (!+bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const CustomTooltip = ({ active, payload, label }) => {
    const { theme } = useTheme();
    if (active && payload && payload.length) {
        const tooltipClasses = theme === 'custom'
            ? "p-3 bg-surface/90 backdrop-blur-sm border border-ui-border rounded-lg shadow-lg"
            : "p-3 bg-light-card/90 dark:bg-dark-card/90 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-lg shadow-lg";
        const secondaryTextClasses = theme === 'custom'
            ? "text-text-secondary"
            : "text-light-text-secondary dark:text-dark-text-secondary";

        return (
            <div className={tooltipClasses}>
                <p className={`text-sm ${secondaryTextClasses} mb-2`}>{new Date(label).toLocaleTimeString()}</p>
                {payload.map(pld => (
                     <div key={pld.dataKey} style={{color: pld.color}} className="flex justify-between text-sm">
                        <span>{pld.dataKey}:</span>
                        <span className="font-bold ml-4">{formatBytes(pld.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const ServiceDistributionChart = () => {
    const { protocolTrafficTimeline } = useData();
    const { theme, chartColors } = useTheme();
    const isCustomTheme = theme === 'custom';

    const { protocols, dynamicPalette } = useMemo(() => {
        if (!protocolTrafficTimeline.length) return { protocols: [], dynamicPalette: {} };
        const keys = new Set();
        protocolTrafficTimeline.forEach(item => {
            Object.keys(item).forEach(key => { if (key !== 'time') keys.add(key); });
        });
        const protoArray = Array.from(keys);
        const palette = protoArray.reduce((acc, proto, index) => {
            acc[proto] = chartColors.protocolDistribution[index % chartColors.protocolDistribution.length];
            return acc;
        }, {});
        return { protocols: protoArray, dynamicPalette: palette };
    }, [protocolTrafficTimeline, chartColors.protocolDistribution]);

    const secondaryTextClasses = isCustomTheme
        ? "text-text-secondary"
        : "text-light-text-secondary dark:text-dark-text-secondary";

    return (
        <div className="h-full w-full flex flex-col">
            <CardTitle>Traffic Over Time</CardTitle>
            <p className={`text-xs ${secondaryTextClasses} mb-2`}>Total bytes transferred per protocol</p>
            <div className="w-full flex-grow pt-2">
                {protocolTrafficTimeline && protocolTrafficTimeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={protocolTrafficTimeline}>
                            <defs>
                                {protocols.map(p => (
                                    <linearGradient key={p} id={`colorService${p}-${theme}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={dynamicPalette[p]} stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor={dynamicPalette[p]} stopOpacity={0}/>
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid stroke={chartColors.gridColor} strokeDasharray="3 3" />
                            <XAxis
                                dataKey="time"
                                tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                stroke={chartColors.textColor}
                                fontSize={12}
                            />
                            <YAxis tickFormatter={formatBytes} stroke={chartColors.textColor} fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: '12px', color: chartColors.textColor }} />
                            {protocols.map(proto => (
                                <Area
                                    key={proto}
                                    type="monotone"
                                    dataKey={proto}
                                    stackId="1"
                                    stroke={dynamicPalette[proto]}
                                    fillOpacity={1}
                                    fill={`url(#colorService${proto}-${theme})`}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                ) : ( <div className={`flex items-center justify-center h-full text-sm ${secondaryTextClasses}`}>Awaiting sufficient traffic data for timeline...</div> )}
            </div>
        </div>
    );
};

export default ServiceDistributionChart;