// src/components/tables/HostDiscoveryTable.js
import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { CardTitle } from '../common/Card'; // 1. IMPORT THEME-AWARE TITLE

const getStatusColor = (status) => (status === 'up' ? 'bg-green-500' : 'bg-red-500');

const HostDiscoveryTable = ({ hosts }) => {
    const { theme } = useTheme(); // 2. GET THE CURRENT THEME
    const isCustomTheme = theme === 'custom';

    // 3. CONDITIONALLY SET CLASSES FOR EVERY ELEMENT
    const tableClasses = isCustomTheme
        ? "min-w-full text-sm text-left text-text-primary"
        : "min-w-full text-sm text-left text-gray-500 dark:text-gray-400";
    
    const theadClasses = isCustomTheme
        ? "text-xs text-text-primary uppercase sticky top-0 bg-surface"
        : "text-xs text-gray-700 uppercase dark:text-gray-300 sticky top-0";

    const tbodyClasses = isCustomTheme
        ? "divide-y divide-ui-border"
        : "divide-y divide-gray-200 dark:divide-gray-700";
    
    const trClasses = isCustomTheme
        ? "hover:bg-accent-muted/50"
        : "hover:bg-black/5 dark:hover:bg-white/5";

    const tdHostnameClasses = isCustomTheme
        ? "px-6 py-4 font-medium" // No color specified, inherits white text
        : "px-6 py-4 font-medium text-gray-900 dark:text-white";

    return (
        <>
            {/* 4. REPLACE THE OLD H2 WITH THE THEME-AWARE CARDTITLE */}
            <CardTitle>Asset Intel: Host Discovery</CardTitle>
            
            <div className="h-full overflow-y-auto flex-grow min-h-0">
                <table className={tableClasses}>
                    <thead className={theadClasses}>
                        <tr>
                            <th scope="col" className="px-6 py-3">Hostname</th>
                            <th scope="col" className="px-6 py-3">IP Address</th>
                            <th scope="col" className="px-6 py-3">OS</th>
                            <th scope="col" className="px-6 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className={tbodyClasses}>
                        {hosts && hosts.length > 0 ? (
                            hosts.map((host) => (
                                <tr key={host.id || host.ip_address} className={trClasses}>
                                    <td className={tdHostnameClasses}>{host.hostname || 'N/A'}</td>
                                    <td className="px-6 py-4">{host.ip_address}</td>
                                    <td className="px-6 py-4 text-xs italic">{host.os_name || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center">
                                            <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(host.status)} mr-2`}></span>
                                            <span className="capitalize">{host.status}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center py-8 text-gray-400">
                                    Awaiting host scan results from backend...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};
export default HostDiscoveryTable;