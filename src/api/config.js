// src/api/config.js


export const API_BASE_URL = window.location.origin;


const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';


export const WS_BASE_URL = `${wsProtocol}//${window.location.host}`;
