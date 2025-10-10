// src/components/modals/NetworkDetailModal.js

import React, { useState, useMemo, useEffect } from 'react'; // Imported useEffect
import { API_BASE_URL } from '../../api/config';
import { motion } from 'framer-motion';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell
} from 'recharts';

// --- ICONS (no changes) ---
const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const ExportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const SecurityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;
const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m-9 9a9 9 0 019-9" /></svg>;

// --- UI SUB-COMPONENTS (no changes) ---
const Section = ({ title, icon, children }) => ( <div className="bg-background/50 border border-ui-border rounded-lg p-4"><div className="flex items-center mb-3 text-text-secondary">{icon}<h3 className="text-sm font-bold ml-2 uppercase tracking-wider">{title}</h3></div>{children}</div>);
const DetailRow = ({ label, value }) => ( <div className="flex items-start justify-between py-1.5 text-xs"><span className="text-text-secondary w-1/3">{label}</span><span className="text-text-primary text-right font-mono flex-1 truncate" title={String(value)}>{String(value) || 'N/A'}</span></div>);
const StatCard = ({ title, value }) => ( <div className="bg-surface p-4 rounded-lg text-center shadow"><p className="text-2xl font-bold font-mono text-accent">{value}</p><p className="text-[10px] uppercase text-text-secondary mt-1">{title}</p></div>);
const ReputationBadge = ({ score }) => { const status = score > 75 ? {label: 'Malicious', color: 'bg-red-500'} : score > 40 ? {label: 'Suspicious', color: 'bg-yellow-500'} : {label: 'Clean', color: 'bg-green-500'}; return <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${status.color}`}>{status.label}</span>;}
const FlagBadge = ({ flag, count }) => ( <div className="flex items-center space-x-2 bg-gray-700/50 px-3 py-1.5 rounded-md"><span className="font-mono text-sm font-bold text-accent">{flag}</span><span className="text-xs text-text-secondary">{count}</span></div>);
const ChartContainer = ({ title, children }) => ( <div className="bg-background/50 p-3 rounded-md border border-ui-border h-60 flex flex-col"><h4 className="text-xs text-text-secondary mb-2 px-2 flex-shrink-0">{title}</h4><div className="flex-grow w-full h-full">{children}</div></div>);

// --- ANIMATION VARIANTS (no changes) ---
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } }
};


// --- MAIN MODAL COMPONENT ---
const NetworkPacketModal = ({ isOpen, onClose }) => {
    const [searchInput, setSearchInput] = useState('');
    const [searchedIp, setSearchedIp] = useState('');
    const [details, setDetails] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- NEW `useEffect` HOOK TO SCROLL TO TOP ---
    useEffect(() => {
        if (isOpen) {
            window.scrollTo(0, 0);
        }
    }, [isOpen]);

    // --- processedData Hook (no changes) ---
    const processedData = useMemo(() => {
        if (!details) return null;
        
        const zeekEvents = (details.zeek || []).map(z => { try { return JSON.parse(z.message); } catch { return z; } }).filter(Boolean);
        const suricataAlerts = (details.suricata || []).filter(s => s.event_type === 'alert');
        const suricataFlows = (details.suricata || []).filter(s => s.event_type === 'flow' && s.tcp);
        const postgresPackets = details.postgres_packets || [];

        const summary = {
            totalSessions: zeekEvents.length,
            bytesSent: zeekEvents.reduce((acc, z) => acc + (z.orig_bytes || 0), 0),
            bytesReceived: zeekEvents.reduce((acc, z) => acc + (z.resp_bytes || 0), 0),
            osDetected: details.zeek?.find(z => z.os?.name)?.os.name || 'N/A',
            userAgent: details.zeek?.find(z => z.http?.user_agent)?.http.user_agent || 'N/A'
        };
        const trafficDistribution = [ { name: 'Bytes Sent', value: summary.bytesSent }, { name: 'Bytes Received', value: summary.bytesReceived } ];
        
        const serviceCounts = zeekEvents.reduce((acc, z) => {
            const service = z.service || '(unknown)';
            acc[service] = (acc[service] || 0) + 1;
            return acc;
        }, {});
        const serviceDistribution = Object.entries(serviceCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

        const portCounts = zeekEvents.reduce((acc, z) => {
            const port = z.id_resp_p || 'N/A';
            if (port !== 'N/A') acc[port] = (acc[port] || 0) + 1;
            return acc;
        }, {});
        const topDestPorts = Object.entries(portCounts).map(([port, count]) => ({ name: port, count })).sort((a, b) => b.count - a.count).slice(0, 5);
            
        const sessionsTable = zeekEvents.map(z => ({
            timestamp: z['@timestamp'] ? new Date(z['@timestamp']).toLocaleString() : new Date().toLocaleString(),
            protocol: z.proto?.toUpperCase() || 'N/A',
            source: `${z.id_orig_h}:${z.id_orig_p}`,
            destination: `${z.id_resp_h}:${z.id_resp_p}`,
            method: 'N/A', uri: 'N/A', code: 'N/A',
            size: z.resp_bytes || 0,
        }));
        
        const tcpFlags = { SYN: 0, ACK: 0, FIN: 0, RST: 0, PSH: 0, URG: 0 };
        suricataFlows.forEach(f => { if(f.tcp.syn) tcpFlags.SYN++; if(f.tcp.ack) tcpFlags.ACK++; if(f.tcp.fin) tcpFlags.FIN++; if(f.tcp.rst) tcpFlags.RST++; if(f.tcp.psh) tcpFlags.PSH++; if(f.tcp.urg) tcpFlags.URG++; });
        postgresPackets.forEach(p => { if(p.flags?.includes('S')) tcpFlags.SYN++; if(p.flags?.includes('A')) tcpFlags.ACK++; if(p.flags?.includes('F')) tcpFlags.FIN++; if(p.flags?.includes('R')) tcpFlags.RST++; if(p.flags?.includes('P')) tcpFlags.PSH++; if(p.flags?.includes('U')) tcpFlags.URG++; });
        
        return { summary, trafficDistribution, serviceDistribution, topDestPorts, sessionsTable, suricataAlerts, tcpFlags };
    }, [details]);

    // --- Handler Functions (no changes) ---
    const handleSearch = async (e) => { e.preventDefault(); if (!searchInput) return; setIsLoading(true); setError(null); setDetails(null); setSearchedIp(searchInput); try { const res = await fetch(`${API_BASE_URL}/api/v1/cockpit/ip_details/${searchInput}`); if (!res.ok) throw new Error(`Server returned ${res.status}`); const data = await res.json(); setDetails(data); } catch (err) { setError(err.message); } finally { setIsLoading(false); } };
    const handleExport = () => { if(!details) return; const dataStr=JSON.stringify(details,null,2); const link=document.createElement('a'); link.href='data:application/json;charset=utf-8,'+encodeURIComponent(dataStr); link.download=`${searchedIp}_data.json`; link.click(); link.remove(); };
    const handleClose = () => { setSearchInput(''); setSearchedIp(''); setDetails(null); setError(null); setIsLoading(false); onClose(); };

    if (!isOpen) return null;
    
    return (
        <motion.div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={handleClose} variants={backdropVariants} initial="hidden" animate="visible" exit="hidden" >
            <motion.div className="bg-surface border border-ui-border rounded-xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col" onClick={e => e.stopPropagation()} variants={modalVariants} exit="exit">
                {/* --- HEADER --- */}
                <div className="flex justify-between items-center p-4 border-b border-ui-border flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <form onSubmit={handleSearch} className="flex items-center space-x-2">
                             <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Investigate IP Address..." className="w-96 px-3 py-1.5 rounded-md bg-background border border-ui-border focus:ring-1 focus:ring-accent outline-none text-sm"/>
                             <motion.button type="submit" disabled={isLoading || !searchInput} className="px-4 py-1.5 rounded-md bg-accent text-white text-sm font-semibold disabled:bg-accent/50 transition-colors" whileTap={{ scale: 0.95 }}>{isLoading ? 'Analyzing...' : 'Search'}</motion.button>
                        </form>
                        {searchedIp && <span className="text-sm font-mono bg-accent/20 text-accent px-2 py-0.5 rounded">{searchedIp}</span>}
                    </div>
                    <div className='flex items-center space-x-2'>{details && <button onClick={handleExport} className="flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors text-text-secondary hover:bg-surface"><ExportIcon/> Export PDF</button>}<button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><CloseIcon /></button></div>
                </div>
                
                {/* --- BODY / CONTENT --- */}
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {isLoading && <p className="text-center p-8">Analyzing events for {searchInput}...</p>}
                    {error && <p className="text-center p-8 text-red-400 bg-red-900/50 rounded-md">Error: {error}</p>}
                    {!details && !isLoading && !error && <p className="text-center p-8">Results will be displayed here.</p>}

                    {details && processedData && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="space-y-4">
                           {/* --- STATS & CHARTS (no changes) --- */}
                           <div className="grid grid-cols-5 gap-4">
                               <StatCard title="Total Sessions" value={processedData.summary.totalSessions} />
                               <StatCard title="Bytes Sent" value={`${(processedData.summary.bytesSent / 1024).toFixed(2)} KB`} />
                               <StatCard title="Bytes Received" value={`${(processedData.summary.bytesReceived / 1024).toFixed(2)} KB`} />
                               <StatCard title="OS Detected" value={processedData.summary.osDetected} />
                               <StatCard title="User Agent" value={processedData.summary.userAgent.substring(0, 20) || 'N/A'} />
                            </div>
                           <div className='grid grid-cols-3 gap-4'>
                                <ChartContainer title="Top Services">
                                     <ResponsiveContainer width="100%" height="100%"><BarChart data={processedData.serviceDistribution} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/><XAxis type="number" tick={{fontSize: 10}} stroke="#a0a0a0"/><YAxis dataKey="name" type="category" tick={{fontSize: 10}} stroke="#a0a0a0" width={50}/><Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} contentStyle={{backgroundColor:'#1f2937',border:'1px solid #374151',fontSize:'12px'}}/><Bar dataKey="count" fill="#06b6d4" /></BarChart></ResponsiveContainer>
                                </ChartContainer>
                                <ChartContainer title="Top Destination Ports">
                                     <ResponsiveContainer width="100%" height="100%"><BarChart data={processedData.topDestPorts} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/><XAxis type="number" tick={{fontSize: 10}} stroke="#a0a0a0"/><YAxis dataKey="name" type="category" tick={{fontSize: 10}} stroke="#a0a0a0" width={50}/><Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} contentStyle={{backgroundColor:'#1f2937',border:'1px solid #374151',fontSize:'12px'}}/><Bar dataKey="count" fill="#a78bfa" /></BarChart></ResponsiveContainer>
                                </ChartContainer>
                                <ChartContainer title="Sent vs. Received Traffic">
                                     <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={processedData.trafficDistribution} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={40} outerRadius={60}><Cell key="sent" fill="#8b5cf6" /><Cell key="received" fill="#d946ef" /></Pie><Tooltip contentStyle={{backgroundColor:'#1f2937',border:'1px solid #374151',fontSize:'12px'}}/><Legend wrapperStyle={{fontSize:"11px", paddingTop: "15px"}}/></PieChart></ResponsiveContainer>
                                </ChartContainer>
                           </div>
                           {/* --- SESSIONS TABLE & ANALYSIS SECTIONS (no changes) --- */}
                            <div className="bg-background/50 border border-ui-border rounded-lg max-h-96 overflow-y-auto">
                                <table className='w-full text-xs text-left'><thead className='sticky top-0 bg-surface'><tr>{['Timestamp', 'Protocol', 'Source', 'Destination', 'Method', 'URI', 'HTTP Code', 'Size (Bytes)'].map(h => <th key={h} className='p-2 font-semibold'>{h}</th>)}</tr></thead><tbody>{processedData.sessionsTable.slice(0, 200).map((s,i) => (<tr key={i} className='border-t border-ui-border hover:bg-surface/80'><td className='p-2 font-mono'>{s.timestamp}</td><td className='p-2'>{s.protocol}</td><td className='p-2 font-mono'>{s.source}</td><td className='p-2 font-mono'>{s.destination}</td><td>{s.method}</td><td className='truncate max-w-xs'>{s.uri}</td><td>{s.code}</td><td>{s.size}</td></tr>))}</tbody></table>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <Section title="Security Analysis" icon={<SecurityIcon/>}><div className='space-y-4'><div><h4 className="text-xs font-semibold mb-2">Alerts</h4><div className='space-y-1'>{processedData.suricataAlerts.length > 0 ? processedData.suricataAlerts.map((a,i) => <div key={i} className='bg-red-900/50 p-2 rounded-md text-xs font-mono border-l-2 border-red-500'>{`[${a.alert.severity}] ${a.alert.signature}`}</div>) : <p className='text-xs text-text-secondary'>No alerts found.</p>}</div></div><div><h4 className="text-xs font-semibold mb-2">TCP Flag Analysis</h4><div className='flex flex-wrap gap-2'>{Object.entries(processedData.tcpFlags).map(([flag, count]) => count > 0 && <FlagBadge key={flag} flag={flag} count={count} />)}</div></div><div><h4 className="text-xs font-semibold mb-2">Suspicious Behavior</h4><div className="flex gap-2"><span className="text-xs bg-yellow-400/20 text-yellow-300 px-2 py-0.5 rounded-full">Potential Flow Anomaly</span></div></div></div></Section>
                               <Section title="External Intelligence" icon={<GlobeIcon/>}><div className="grid grid-cols-2 gap-x-6"><div><h4 className="text-xs font-semibold mb-2">Reputation</h4><ReputationBadge score={45}/></div><div><h4 className="text-xs font-semibold mb-2">GeoIP Lookup (Placeholder)</h4> <DetailRow label="Country" value="United States"/> <DetailRow label="ASN" value="AS15169 GOOGLE"/></div></div><div className="mt-4"><h4 className="text-xs font-semibold mb-2">Threat Intelligence (Placeholder)</h4><p className="text-xs text-text-secondary">Lookups from VirusTotal, AbuseIPDB, etc. would appear here.</p></div></Section>
                           </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default NetworkPacketModal;