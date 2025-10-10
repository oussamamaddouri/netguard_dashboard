// src/hooks/useWebSocket.js

import { useState, useEffect, useRef, useCallback } from 'react';
// --- START OF FINAL FIX: Import the base URL from our config file ---
import { WS_BASE_URL } from '../api/config';
// --- END OF FINAL FIX ---

export const useWebSocket = () => {
    const [lastJsonMessage, setLastJsonMessage] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const websocketRef = useRef(null);

    const connect = useCallback(() => {
        // --- START OF FINAL FIX: Construct the full, correct URL dynamically ---
        const wsUrl = `${WS_BASE_URL}/api/ws/ws`;
        // --- END OF FINAL FIX ---

        console.log("Attempting to connect to WebSocket (No Auth):", wsUrl);
        websocketRef.current = new WebSocket(wsUrl);

        websocketRef.current.onopen = () => { console.log("✅ WebSocket Connected"); setIsConnected(true); };
        websocketRef.current.onclose = () => { console.log("🔌 WebSocket Disconnected"); setIsConnected(false); };
        websocketRef.current.onerror = (error) => { console.error("❌ WebSocket Error:", error); };
        websocketRef.current.onmessage = (event) => {
            try {
                setLastJsonMessage(JSON.parse(event.data));
            } catch (error) {
                console.error("Failed to parse WebSocket message:", error);
            }
        };
    }, []);

    useEffect(() => {
        connect();
        return () => {
            if (websocketRef.current) {
                websocketRef.current.close();
            }
        };
    }, [connect]);

    return { lastJsonMessage, isConnected };
};