// src/components/modals/ConnectionStateDetailModal.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { API_BASE_URL } from '../../api/config';

// --- DICTIONARY & HELPER COMPONENTS (no changes) ---
const stateExplanations = { 'SF': { name: 'Normal (SYN-FIN)', description: 'A normal, complete TCP connection. It was established, data was transferred, and it was closed gracefully.', implication: 'This is the baseline for healthy network traffic. A high percentage of SF is expected.', severity: 'normal' }, 'S0': { name: 'SYN Scan / Unanswered Request', description: 'A SYN packet was sent to a server, but no SYN-ACK reply was ever received.', implication: 'This is a classic indicator of a port scan (specifically a SYN or "half-open" scan) trying to discover open ports without establishing a full connection.', severity: 'high' }, 'REJ': { name: 'Rejected', description: 'The server actively rejected the connection attempt by sending a TCP Reset (RST) packet.', implication: 'Indicates port scanning against closed ports or that a firewall is actively blocking the connection. The target host is online but the port is not open.', severity: 'medium' }, 'RSTO': { name: 'Reset by Originator', description: 'The connection was established, but the client (originator) abruptly closed it with a Reset packet.', implication: 'Can indicate a client-side application crash, a user canceling an operation, or network issues causing the client to time out.', severity: 'low' }, 'RSTR': { name: 'Reset by Responder', description: 'The connection was established, but the server (responder) abruptly closed it with a Reset packet.', implication: 'Suggests a server-side problem. The service might have crashed, become overloaded, or is misconfigured.', severity: 'low' }, 'S1': { name: 'SYN-ACK Sent, No Final ACK', description: 'The handshake is incomplete. The server replied with a SYN-ACK, but the client never sent the final ACK.', implication: 'Highly suspicious. This can be an indicator of a SYN flood (DDoS) attack or IP address spoofing, as the attacker is trying to exhaust server resources with half-open connections.', severity: 'high' }, 'SH': { name: 'SYN, then Half-closed (by Originator)', description: 'The client sent a SYN and immediately followed it with a FIN packet, trying to close the connection before it was fully established.', implication: 'Anomalous behavior. This could be part of a specialized network scan or a misbehaving application.', severity: 'medium' }, 'OTH': { name: 'Other / Malformed', description: 'Zeek could not classify the connection into any of the standard states. This often involves unusual or non-standard flag combinations.', implication: 'A spike in "OTH" traffic is a red flag indicating highly unusual activity, possibly an attempt to evade detection or fingerprint network devices. Requires immediate investigation.', severity: 'high' }, 'RSTRH': { name: 'Reset by Responder (after handshake)', description: 'Similar to RSTR, but the Reset was sent after the initial TCP handshake was fully completed.', implication: 'Confirms the service was initially running and accepting connections before an error occurred, leading to the reset.', severity: 'low' }, 'SHR': { name: 'SYN, then Half-closed (by Responder)', description: 'Similar to SH, but the server sent the FIN packet. This is even more unusual than SH.', implication: 'Indicates a very specific service-level rejection or an advanced fingerprinting technique.', severity: 'medium' }, 'S2': { name: 'Half-closed by Originator, FIN-ACK from Responder', description: 'The connection was established, and the client closed its end, but the server may still be sending data.', implication: 'Often a normal part of certain application protocols, but a large number could indicate connections not being cleaned up properly.', severity: 'low' }, 'S3': { name: 'Half-closed by Responder, FIN-ACK from Originator', description: 'The server closed its end of the connection, but the client may still be sending data.', implication: 'Less common than S2, but generally indicates a normal, though not perfectly graceful, connection termination.', severity: 'low' } };
const defaultExplanation = { name: 'Unknown State', description: 'This connection state is not documented in the explanation dictionary.', implication: 'It may be a new or rare state. Consider updating the internal dictionary if it appears frequently.', severity: 'low' };
const SeverityBadge = ({ severity }) => { const severityClasses = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-blue-500', normal: 'bg-green-500' }; return <div className={`flex-shrink-0 h-3 w-3 rounded-full ${severityClasses[severity] || 'bg-gray-400'}`} />; };
const CloseIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> </svg> );
const TimeRangeButton = ({ label, value, activeValue, onClick }) => { const isActive = value === activeValue; const activeClasses = 'bg-accent text-white border-transparent'; const inactiveClasses = 'bg-surface hover:bg-background border-ui-border'; return ( <motion.button whileTap={{ scale: 0.95 }} onClick={() => onClick(value)} className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}> {label} </motion.button> ); };

// --- ANIMATION VARIANTS (no changes) ---
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 }, };
const modalVariants = { hidden: { opacity: 0, scale: 0.9, y: 50 }, visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } }, exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } } };

// --- MAIN MODAL COMPONENT ---
const ConnectionStateDetailModal = ({ isOpen, onClose }) => {
    const { chartColors } = useTheme();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRangeHours, setTimeRangeHours] = useState(24);

    // Effect for fetching data (no changes)
    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            const fetchData = async () => {
                try {
                    const url = `${API_BASE_URL}/api/zeek/conn-state-distribution/detailed?hours=${timeRangeHours}`;
                    const response = await axios.get(url);
                    setData(response.data);
                } catch (error) {
                    console.error("Failed to fetch detailed connection state data:", error);
                    setData([]);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen, timeRangeHours]);

    // --- FIX APPLIED HERE: SCROLL LOCK ---
    // This effect hook correctly locks the background scroll when the modal is open.
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const stateKeys = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'time') : [];

    return (
        <motion.div
            // --- FIX APPLIED HERE: POSITIONING ---
            // Changed `items-center` to `items-start` and added top padding (`pt-20`).
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-start justify-center p-4 pt-20 backdrop-blur-sm"
            onClick={onClose}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
        >
            <motion.div
                className="bg-surface border border-ui-border rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[85vh] flex flex-col p-6"
                onClick={(e) => e.stopPropagation()}
                variants={modalVariants}
                exit="exit"
            >
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-xl font-semibold text-text-primary">Connection State Deep Dive (Last {timeRangeHours < 24 ? timeRangeHours : timeRangeHours/24} {timeRangeHours < 24 ? "Hour(s)" : "Day(s)"})</h2>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><CloseIcon /></button>
                </div>

                <div className="flex flex-grow min-h-0 space-x-6">
                    {/* --- LEFT PANEL & RIGHT PANEL (no changes) --- */}
                    <div className="w-2/3 h-full flex flex-col">
                        <div className="flex items-center space-x-2 mb-2">
                            <p className="text-sm text-text-secondary">Time Range:</p>
                            <TimeRangeButton label="1H" value={1} activeValue={timeRangeHours} onClick={setTimeRangeHours} />
                            <TimeRangeButton label="6H" value={6} activeValue={timeRangeHours} onClick={setTimeRangeHours} />
                            <TimeRangeButton label="24H" value={24} activeValue={timeRangeHours} onClick={setTimeRangeHours} />
                            <TimeRangeButton label="7D" value={168} activeValue={timeRangeHours} onClick={setTimeRangeHours} />
                        </div>
                        <div className="flex-grow">
                             {loading ? (
                                <div className="flex items-center justify-center h-full text-text-secondary">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Loading Timeline...
                                </div>
                             ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data}>
                                        <defs>
                                            {stateKeys.map((key, index) => (
                                                 <linearGradient key={key} id={`color${key}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={chartColors.protocolDistribution[index % chartColors.protocolDistribution.length]} stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor={chartColors.protocolDistribution[index % chartColors.protocolDistribution.length]} stopOpacity={0}/>
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.gridColor} />
                                        <XAxis dataKey="time" tick={{ fontSize: 12, fill: chartColors.textColor }} tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}/>
                                        <YAxis tick={{ fontSize: 12, fill: chartColors.textColor }} />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(var(--color-surface-rgb), 0.9)', border: '1px solid var(--color-ui-border)', borderRadius: '0.5rem', color: 'var(--color-text-primary)'}}/>
                                        <Legend wrapperStyle={{fontSize: '12px', color: chartColors.textColor}} />
                                        {stateKeys.map((key, index) => (
                                            <Area key={key} type="monotone" dataKey={key} stroke={chartColors.protocolDistribution[index % chartColors.protocolDistribution.length]} fillOpacity={1} fill={`url(#color${key})`} stackId="1"/>
                                        ))}
                                    </AreaChart>
                                </ResponsiveContainer>
                             )}
                        </div>
                    </div>
                    
                    <div className="w-1/3 h-full flex flex-col">
                        <h3 className="text-lg font-semibold text-text-primary mb-2 flex-shrink-0">What These States Mean</h3>
                        <div className="overflow-y-auto pr-2 space-y-4">
                            {stateKeys.map((key) => {
                                const explanation = stateExplanations[key] || defaultExplanation;
                                return (
                                    <div key={key} className="p-3 rounded-lg border border-ui-border bg-background">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <SeverityBadge severity={explanation.severity} />
                                            <div className="text-base font-bold text-text-primary">{key}</div>
                                            <div className="text-sm text-text-secondary">{explanation.name}</div>
                                        </div>
                                        <p className="text-xs text-text-secondary mb-1"><strong>Description:</strong> {explanation.description}</p>
                                        <p className="text-xs text-accent"><strong>Security Implication:</strong> {explanation.implication}</p>
                                    </div>
                                );
                            })}
                            {stateKeys.length === 0 && !loading && (
                                <p className="text-sm text-text-secondary">No connection states were found in the selected time range.</p>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ConnectionStateDetailModal;