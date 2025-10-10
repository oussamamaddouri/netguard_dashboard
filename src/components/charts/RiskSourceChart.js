// src/components/charts/RiskSourceChart.js

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { CardTitle } from '../common/Card';

const CustomTooltip = ({ active, payload, label, isThreatData }) => {
    const { theme } = useTheme();
    if (active && payload && payload.length) {
        const tooltipClasses = theme === 'custom'
            ? "p-2 bg-surface text-text-primary rounded-md border border-ui-border"
            : "bg-gray-700 dark:bg-gray-800 text-white p-2 rounded-md border border-gray-600";
        const labelText = isThreatData ? "High-Risk Events" : "Connections";
        return (
            <div className={tooltipClasses} style={{ fontSize: '12px' }}>
                <p className="font-semibold">{`Country: ${label}`}</p>
                <p>{`${labelText}: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

const RiskSourceChart = ({ threatData, trafficData }) => {
    const { theme, chartColors } = useTheme();
    const isCustomTheme = theme === 'custom';

    const hasThreats = threatData && threatData.length > 0;
    const dataToDisplay = hasThreats ? threatData : trafficData;
    const title = hasThreats ? "Threat Origins" : "Top Traffic by Country";
    const subtitle = hasThreats ? "High-Risk IPs by Country" : "Most Connections by Country";
    const dataKey = hasThreats ? "risk" : "count";

    const [color1, color2] = chartColors.protocolDistribution;
    const highlightColor = chartColors.highlight;
    const themeColors = [color1, color1, highlightColor, color2, color2];

    const secondaryTextClasses = isCustomTheme
        ? "text-text-secondary"
        : "text-light-text-secondary dark:text-dark-text-secondary";

    if (!dataToDisplay || dataToDisplay.length === 0) {
        return (
             <div className="h-full w-full">
               <CardTitle>Country Data</CardTitle>
               <div className={`flex items-center justify-center h-full text-sm ${secondaryTextClasses}`}>
                    Waiting for network data...
               </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full">
           <CardTitle>{title}</CardTitle>
           {/* THIS IS THE FIX: The variable is now correctly named 'secondaryTextClasses' */}
           <p className={`text-xs ${secondaryTextClasses} mb-2`}>{subtitle}</p>
           <div className="w-full h-36">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={dataToDisplay}
                        layout="vertical"
                        margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                        barCategoryGap="25%"
                    >
                        <XAxis type="number" hide />
                        <YAxis dataKey="country" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: chartColors.textColor }} width={30} />
                        <Tooltip
                            cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
                            content={<CustomTooltip isThreatData={hasThreats} />}
                        />
                        <Bar
                            dataKey={dataKey}
                            barSize={15}
                            background={{ fill: 'rgba(128, 128, 128, 0.1)' }}
                            radius={[0, 4, 4, 0]}
                        >
                           {dataToDisplay.map((entry, index) => (<Cell key={`cell-${index}`} fill={themeColors[index % themeColors.length]} />))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
           </div>
        </div>
    );
};

export default RiskSourceChart;