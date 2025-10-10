// src/components/charts/OSDistributionChart.js

import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { CardTitle } from '../common/Card';

const CustomTooltip = ({ active, payload }) => {
    const { theme } = useTheme();
    if (active && payload && payload.length) {
        const tooltipClasses = theme === 'custom'
            ? "p-2 bg-surface/90 backdrop-blur-sm border border-ui-border rounded-lg"
            : "p-2 bg-light-card/90 dark:bg-dark-card/90 backdrop-blur-sm border border-light-border dark:border-dark-border rounded-lg";
        const textClasses = theme === 'custom'
            ? "text-sm text-text-primary"
            : "text-sm text-light-text dark:text-dark-text";
        return (
            <div className={tooltipClasses}>
                <p className={textClasses}>{`${payload[0].name}: ${payload[0].value} endpoints`}</p>
            </div>
        );
    }
    return null;
};

const OSDistributionChart = ({ data }) => {
    const { theme, chartColors } = useTheme();
    const isCustomTheme = theme === 'custom';

    // FIX: Define a specific color for the 'online' status in the custom theme.
    const onlineStatusColor = isCustomTheme ? '#3B82F6' : chartColors.status.good;

    const { osData, onlineCount, totalCount } = useMemo(() => {
        // ... (data processing logic is unchanged)
        if (!data || data.length === 0) return { osData: [], onlineCount: 0, totalCount: 0 };
        const counts = data.reduce((acc, host) => {
            let osName = 'Unknown';
            const rawOs = host.os_name || 'Unknown';
            if (rawOs.toLowerCase().includes('windows')) osName = 'Windows';
            else if (rawOs.toLowerCase().includes('linux')) osName = 'Linux';
            else if (rawOs.toLowerCase().includes('mac')) osName = 'macOS';
            else if (rawOs !== 'Unknown' && !rawOs.toLowerCase().includes('vmware')) osName = 'Other';
            acc.os[osName] = (acc.os[osName] || 0) + 1;
            if (host.status === 'up') acc.online += 1;
            return acc;
        }, { os: {}, online: 0 });
        const osEntries = Object.entries(counts.os).map(([name, value]) => ({ name, value }));
        return { osData: osEntries, onlineCount: counts.online, totalCount: data.length };
    }, [data]);

    const secondaryTextClasses = isCustomTheme ? "text-text-secondary" : "text-light-text-secondary dark:text-dark-text-secondary";
    const statusTextClasses = isCustomTheme ? "text-text-primary" : "text-light-text-secondary dark:text-dark-text-secondary";

    return (
        <div className="h-full w-full flex flex-col">
            <CardTitle>Operating Systems</CardTitle>
            <p className={`text-xs mb-2 ${secondaryTextClasses}`}>Endpoint Distribution</p>
            <div className="flex flex-col items-center justify-center my-3">
                <div className={`flex items-center space-x-2 text-sm ${statusTextClasses}`}>
                    <span className="relative flex h-2.5 w-2.5">
                        {/* Use the new color variable here */}
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: onlineStatusColor }}></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: onlineStatusColor }}></span>
                    </span>
                    <span>Live Endpoints</span>
                </div>
                <div className="font-bold p-1">
                    {/* And also here */}
                    <span className="text-4xl" style={{ color: onlineStatusColor }}>{onlineCount}</span>
                    <span className={`text-xl ${secondaryTextClasses}`}>{totalCount > 0 ? `/${totalCount}` : ''}</span>
                </div>
            </div>
            <div className="w-full flex-grow">
                {osData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={osData} cx="50%" cy="50%" innerRadius="60%" outerRadius="80%" fill="#8884d8" paddingAngle={5} dataKey="value">
                                {osData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors.protocolDistribution[index % chartColors.protocolDistribution.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" height={80} wrapperStyle={{ fontSize: '12px', color: chartColors.textColor, paddingLeft: '10px' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className={`flex items-center justify-center h-full text-sm ${secondaryTextClasses}`}>
                        Awaiting OS data from hosts...
                    </div>
                )}
            </div>
        </div>
    );
};

export default OSDistributionChart;