// src/components/modals/OSDetailModal.js

import React, { useState, useMemo, useEffect } from 'react';
import OSDistributionChart from '../charts/OSDistributionChart';
import { motion } from 'framer-motion';

// --- ICONS (no changes) ---
const ShieldIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const AlertIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const PropertiesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> );
const PortIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;


// --- HOST DETAIL COMPONENT (Right Panel - no changes) ---
const HostDetailView = ({ host, vulnerabilities = [], alerts = [] }) => {
    if (!host) return <div className="h-full flex items-center justify-center text-text-secondary"><p>Select a host from the list to view details.</p></div>;
    const hostVulnerabilities = vulnerabilities.filter(v => v.host_ip === host.ip_address);
    const hostAlerts = alerts.filter(a => a.source_ip === host.ip_address || a.destination_ip === host.ip_address);
    return (
      <div className="h-full overflow-y-auto space-y-4 pr-2">
            <div><h3 className="text-xl font-bold text-text-primary font-mono">{host.ip_address}</h3><p className="text-sm text-text-secondary">{host.hostname || 'No hostname discovered'}</p></div>
            <div className="bg-background p-4 rounded-lg"><h4 className="font-semibold text-text-primary flex items-center mb-2"><PropertiesIcon />Asset Properties</h4><div className="text-sm space-y-1"><div className="flex justify-between"><span>OS Details:</span><span className="text-text-primary text-right">{host.os_name || 'N/A'}</span></div><div className="flex justify-between"><span>MAC Address:</span><span className="text-text-primary font-mono">{host.mac_address || 'N/A'}</span></div><div className="flex justify-between"><span>Vendor:</span><span className="text-text-primary">{host.vendor || 'N/A'}</span></div><div className="flex justify-between"><span>Status:</span><span><span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-300">{host.status}</span></span></div></div></div>
            <div className="bg-background p-4 rounded-lg"><h4 className="font-semibold text-text-primary flex items-center mb-2"><PortIcon />Open Ports ({host.ports.length})</h4><div className="max-h-32 overflow-y-auto text-sm">{host.ports && host.ports.length > 0 ? (host.ports.map(port => (<p key={port.id} className="font-mono">{port.port_number}/{port.protocol} - <span className="text-text-secondary">{port.service_name || 'unknown service'}</span></p>))) : (<p className="text-text-secondary">No open ports discovered.</p>)}</div></div>
            <div className="bg-background p-4 rounded-lg"><h4 className="font-semibold text-text-primary flex items-center mb-2"><ShieldIcon />Security Posture</h4><div><h5 className="text-xs uppercase text-text-secondary mb-1">Vulnerabilities ({hostVulnerabilities.length})</h5>{hostVulnerabilities.length > 0 ? (hostVulnerabilities.map(vuln => (<div key={vuln.id} className="text-sm mb-1"><span className="font-semibold text-red-400 mr-2">{vuln.cve || 'ADV'}</span><span>{vuln.description}</span></div>))) : (<p className="text-sm text-text-secondary">No vulnerabilities found for this host.</p>)}</div></div>
            <div className="bg-background p-4 rounded-lg"><h4 className="font-semibold text-text-primary flex items-center mb-2"><AlertIcon />Recent Alerts ({hostAlerts.length})</h4>{hostAlerts.length > 0 ? (<div className="max-h-40 overflow-y-auto">{hostAlerts.map(alert => (<div key={alert.id} className="text-sm mb-2 border-l-2 border-yellow-500 pl-2"><p className="font-semibold text-yellow-400">{alert.signature}</p><p className="text-xs">Severity: {alert.severity} | Protocol: {alert.protocol}</p></div>))}</div>) : (<p className="text-sm text-text-secondary">No security alerts associated with this host.</p>)}</div>
      </div>
    );
};


// --- ANIMATION VARIANTS (no changes) ---
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } }
};


// --- MAIN MODAL COMPONENT ---
const OSDetailModal = ({ isOpen, onClose, hosts = [], vulnerabilities = [], alerts = [] }) => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedHost, setSelectedHost] = useState(null);

    // This effect hook still correctly locks the background scroll.
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const classifyOS = useMemo(() => (osName) => { if (!osName) return 'Unknown'; const lowerOsName = osName.toLowerCase(); if (lowerOsName.includes('linux')) return 'Linux'; if (lowerOsName.includes('vmware')) return 'Network Device'; if (lowerOsName.includes('windows')) return 'Windows'; return 'Unknown'; }, []);
    const osSummary = useMemo(() => { const counts = hosts.reduce((acc, host) => { const category = classifyOS(host.os_name); acc[category] = (acc[category] || 0) + 1; return acc; }, {}); return [{ name: 'All', count: hosts.length }, ...Object.entries(counts).map(([name, count]) => ({ name, count }))]; }, [hosts, classifyOS]);
    const filteredHosts = useMemo(() => hosts.filter(host => { const osCategory = classifyOS(host.os_name); return activeFilter === 'All' || osCategory === activeFilter; }), [hosts, activeFilter, classifyOS]);
    useEffect(() => { setSelectedHost(null); }, [activeFilter]);
    
    if (!isOpen) return null;

    return (
        <motion.div
            // --- FIX APPLIED HERE ---
            // Changed `items-center` to `items-start` to align the modal to the top.
            // Added `pt-20` to give it some padding from the top of the viewport.
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-start justify-center p-4 pt-20 backdrop-blur-sm"
            onClick={onClose}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            <motion.div
                className="bg-surface border border-ui-border rounded-xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col p-6"
                onClick={(e) => e.stopPropagation()}
                variants={modalVariants}
                exit="exit"
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-text-primary">Asset Explorer: Operating Systems</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><CloseIcon /></button>
                </div>

                <div className="flex flex-grow min-h-0 space-x-6">
                    <div className="w-1/4 h-full flex flex-col space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-text-primary mb-2">Filter by OS</h3>
                            {osSummary.map(({ name, count }) => (
                                <motion.button
                                    key={name}
                                    onClick={() => setActiveFilter(name)}
                                    className={`w-full flex justify-between items-center p-2 mb-2 rounded-md border text-left transition-colors duration-200 ${activeFilter === name ? 'bg-accent text-white border-transparent' : 'bg-background hover:bg-surface border-ui-border'}`}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <span className="font-semibold text-sm">{name}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeFilter === name ? 'bg-white/20' : 'bg-surface'}`}>{count}</span>
                                </motion.button>
                            ))}
                        </div>
                        <div className="flex-grow pt-4 border-t border-ui-border">
                            <OSDistributionChart data={hosts} />
                        </div>
                    </div>

                    <div className="w-1/3 h-full flex flex-col border-l border-r border-ui-border px-4">
                         <h3 className="text-lg font-semibold text-text-primary mb-2 flex-shrink-0">Filtered Endpoints ({filteredHosts.length})</h3>
                        <div className="overflow-y-auto">
                            {filteredHosts.map(host => (
                                <div key={host.ip_address} onClick={() => setSelectedHost(host)} className={`p-3 rounded-md mb-2 cursor-pointer transition-colors duration-200 ${selectedHost?.ip_address === host.ip_address ? 'bg-accent/20' : 'hover:bg-surface'}`}>
                                    <p className="font-semibold text-text-primary font-mono">{host.ip_address}</p>
                                    <p className="text-sm text-text-secondary">{classifyOS(host.os_name)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-2/5 h-full">
                        <HostDetailView host={selectedHost} vulnerabilities={vulnerabilities} alerts={alerts} />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default OSDetailModal;