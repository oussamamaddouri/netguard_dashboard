// src/components/charts/ConnectionStateChart.js (FINAL LAYOUT FIX)

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { API_BASE_URL } from '../../api/config';
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
            
        const value = payload[0].value.toLocaleString();
        return (
            <div className={tooltipClasses}>
                <p className={textClasses}>{`${payload[0].name}: ${value} connections`}</p>
            </div>
        );
    }
    return null;
};

const ConnectionStateChart = () => {
    const { theme, chartColors } = useTheme();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const isCustomTheme = theme === 'custom';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = `${API_BASE_URL}/api/v1/cockpit/conn-state-distribution`;
                const response = await axios.get(url);
                setData(response.data);
            } catch (error) {
                console.error("Failed to fetch connection state data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const intervalId = setInterval(fetchData, 30000);
        return () => clearInterval(intervalId);
    }, []);

    const secondaryTextClasses = isCustomTheme 
        ? "text-text-secondary" 
        : "text-light-text-secondary dark:text-dark-text-secondary";

    const chartData = data.length > 0 ? data : [{ name: 'No data', value: 1 }];

    return (
        <div className='h-full w-full flex flex-col'>
            <CardTitle>Connection States</CardTitle>
            <p className={`text-xs ${secondaryTextClasses} mb-2`}>Zeek logs from the last hour</p>
            <div className="w-full flex-grow">
                 {loading ? (
                    <div className={`flex items-center justify-center h-full text-sm ${secondaryTextClasses}`}>
                        Loading states...
                    </div>
                ) : chartData.length > 0 && chartData[0].name !== 'No data' ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius="50%"  // <<< CHANGE 1: Made the donut thicker and more compact
                                outerRadius="70%"  // <<< CHANGE 2: Significantly reduced outer size
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="name"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`}
                                        fill={chartColors.protocolDistribution[index % chartColors.protocolDistribution.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend 
                                // <<< CHANGE 3: ALL LEGEND PROPS ARE NOW CONFIGURED FOR BOTTOM ALIGNMENT
                                iconType="circle"
                                layout="horizontal"  // Places items in a row
                                verticalAlign="bottom" // Positions the row at the bottom
                                align="center"       // Centers the items within the row
                                wrapperStyle={{
                                    fontSize: '12px',
                                    color: chartColors.textColor,
                                    paddingTop: '15px' // Adds space above the legend
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className={`flex items-center justify-center h-full text-sm ${secondaryTextClasses}`}>
                        No connection state data available.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConnectionStateChart;