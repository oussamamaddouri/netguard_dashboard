import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { API_BASE_URL } from '../api/config';

const DataContext = createContext(null);
const MAX_PACKETS_IN_LIST = 100;
const POLLING_INTERVAL = 15000;

export const useData = () => {
    return useContext(DataContext);
};

export const DataProvider = ({ children }) => {
    const { lastJsonMessage, isConnected } = useWebSocket();
    const [packets, setPackets] = useState([]);
    const [hosts, setHosts] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [threatOrigins, setThreatOrigins] = useState([]);
    const [connections, setConnections] = useState([]);
    const [protocolDistribution, setProtocolDistribution] = useState([]);
    const [protocolTrafficTimeline, setProtocolTrafficTimeline] = useState([]);
    const [securityPosture, setSecurityPosture] = useState({ health_score: 100 });
    const [topTrafficCountries, setTopTrafficCountries] = useState([]);

    const fetchAndSet = async (endpoint, setter, name) => {
        try {
            const res = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!res.ok) throw new Error(`${name} fetch failed with status: ${res.status}`);
            const data = await res.json();
            setter(data);
            console.log(`[Frontend DEBUG] Fetched ${name}:`, data);
        } catch (error) {
            console.warn(`Could not load data for ${name}. This is recoverable. Error: ${error.message}`);
        }
    };

    useEffect(() => {
        const pollData = () => {
            fetchAndSet("/api/hosts/", setHosts, "Hosts");
            fetchAndSet("/api/security/alerts", setAlerts, "Alerts");
            fetchAndSet("/api/threat-intel/origins", setThreatOrigins, "Threats");
            fetchAndSet("/api/zeek/connections", setConnections, "Connections");
            fetchAndSet("/api/zeek/protocol-distribution", setProtocolDistribution, "Zeek Protocol Distribution");
            fetchAndSet("/api/v1/cockpit/security-posture", setSecurityPosture, "Security Posture");
            fetchAndSet("/api/zeek/traffic-timeline", setProtocolTrafficTimeline, "Traffic Timeline");
            fetchAndSet("/api/zeek/top-countries", setTopTrafficCountries, "Top Traffic Countries");
        }

        pollData(); // Initial fetch
        const interval = setInterval(pollData, POLLING_INTERVAL);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => { fetchAndSet("/api/packets?limit=50", setPackets, "Packets"); }, []);
    useEffect(() => {
        if (lastJsonMessage && lastJsonMessage.type === 'packet_data') {
            const newPacket = lastJsonMessage.data;
            setPackets(p => [newPacket, ...p].slice(0, MAX_PACKETS_IN_LIST));
        }
    }, [lastJsonMessage]);
    
    const derivedVulnerabilities = useMemo(() => hosts.flatMap(host => host.vulnerabilities || []), [hosts]);


    const value = {
        packets, hosts, vulnerabilities: derivedVulnerabilities, alerts,
        threatOrigins, protocolTrafficTimeline, isConnected, protocolDistribution,
        securityPosture,
        topTrafficCountries
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};