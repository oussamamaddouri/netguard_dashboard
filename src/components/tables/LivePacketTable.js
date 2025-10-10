// src/components/tables/LivePacketTable.js

import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { CardTitle } from '../common/Card';
import NetworkDetailModal from '../modals/NetworkDetailModal';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const LivePacketTable = () => {
    const { packets } = useData();
    const { theme } = useTheme();
    const isCustomTheme = theme === 'custom';
    
    const [isModalOpen, setIsModalOpen] = useState(false);

    const formatTimestamp = (iso) => iso ? new Date(iso).toLocaleTimeString() : 'LIVE';

    const tableClasses = isCustomTheme ? "min-w-full text-sm text-left text-text-primary" : "min-w-full text-sm text-left text-gray-500 dark:text-gray-400";
    const theadClasses = isCustomTheme ? "text-xs text-text-primary uppercase sticky top-0 bg-surface z-10" : "text-xs text-gray-700 uppercase dark:text-gray-300 sticky top-0 bg-light-bg dark:bg-dark-bg z-10";
    const tbodyClasses = isCustomTheme ? "divide-y divide-ui-border" : "divide-y divide-gray-200 dark:divide-gray-700";
    const trClasses = isCustomTheme ? "hover:bg-accent-muted/50" : "hover:bg-black/5 dark:hover:bg-white/5";
    const ipAddressClasses = isCustomTheme ? "px-6 py-3 font-semibold" : "px-6 py-3 font-semibold text-light-text dark:text-white";

    // --- We get only the last 10 packets for display ---
    const displayedPackets = packets ? packets.slice(-8) : [];

    return (
        // This flexbox structure is crucial for containing the table's height
        <div className="h-full w-full flex flex-col">
            <div className="flex justify-between items-center flex-shrink-0">
                <CardTitle>Live Network Packets</CardTitle>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="p-2 rounded-md hover:bg-surface text-text-secondary hover:text-text-primary transition-colors"
                    aria-label="Investigate IP"
                    title="Investigate IP"
                >
                    <SearchIcon />
                </button>
            </div>

            {/* This div grows to fill space and enables scrolling */}
            <div className="flex-grow overflow-y-auto mt-4">
                <table className={tableClasses}>
                    <thead className={theadClasses}>
                        <tr>
                            <th scope="col" className="px-4 py-3">Time</th>
                            <th scope="col" className="px-6 py-3">Source IP</th>
                            <th scope="col" className="px-4 py-3">Src Port</th>
                            <th scope="col" className="px-6 py-3">Destination IP</th>
                            <th scope="col" className="px-4 py-3">Dest Port</th>
                            <th scope="col" className="px-4 py-3">Protocol</th>
                            <th scope="col" className="px-4 py-3">Length</th>
                            <th scope="col" className="px-6 py-3">Info</th>
                        </tr>
                    </thead>
                    <tbody className={tbodyClasses}>
                        {displayedPackets.length > 0 ? (
                            // *** THE KEY CHANGE IS HERE: We map over displayedPackets, not the full 'packets' array ***
                            displayedPackets.map((p, i) => (
                                <tr key={`${i}-${p.id || p.timestamp}`} className={trClasses}>
                                    <td className="px-4 py-3 font-mono text-xs">{formatTimestamp(p.timestamp)}</td>
                                    <td className={ipAddressClasses}>{p.source_ip || ''}</td>
                                    <td className="px-4 py-3">{p.source_port}</td>
                                    <td className={ipAddressClasses}>{p.destination_ip || ''}</td>
                                    <td className="px-4 py-3">{p.destination_port}</td>
                                    <td className="px-4 py-3 text-center">{p.protocol || '?'}</td>
                                    <td className="px-4 py-3">{p.length} B</td>
                                    <td className="px-6 py-3 truncate max-w-xs" title={p.info || ''}>{p.info || (p.protocol && !p.source_port ? 'Live Protocol Update' : '')}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-16 text-gray-400">Loading packet data...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <NetworkDetailModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default LivePacketTable;