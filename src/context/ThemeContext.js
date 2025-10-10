// src/context/ThemeContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';

const colorPalettes = {
  // ===================================================================
  // LIGHT MODE THEME
  // ===================================================================
  light: {
    textColor: '#1F2937',
    gridColor: '#E5E7EB',
    alerts: '#2563EB',
    protocolDistribution: ['#2563EB', '#10B981', '#F59E0B', '#9333EA', '#0EA5E9', '#14B8A6'],
    liveThroughput: ['#2563EB', '#14B8A6'],
    highlight: '#2563EB',
    status: { good: '#10B981', medium: '#F59E0B', bad: '#EF4444' },

    // --- ADDED THIS 'GAUGE' OBJECT FOR THE LIGHT THEME (BLUE) ---
    gauge: {
      gradientStart: '#3b82f6', // A professional Blue
      gradientEnd: '#22d3ee',   // Fading to a vibrant Cyan
      track: '#e5e7eb',        // A subtle gray track to match your grid color
      valueText: '#2563EB',    // The score text matches your main theme blue
    },
  },

  // ===================================================================
  // DARK MODE THEME
  // ===================================================================
  dark: {
    textColor: '#A998BC',
    gridColor: 'rgba(174, 160, 248, 0.15)',
    alerts: '#EE7200',
    protocolDistribution: ['#EE7200', '#FE9000', '#FACC15', '#4F46E5', '#7C3AED', '#38BDF8', '#FE5000'],
    liveThroughput: ['#EE7200', '#FE5000'],
    highlight: '#EE7200',
    status: { good: '#EE7200', medium: '#FACC15', bad: '#F43F5E' },
    
    // --- ADDED THIS 'GAUGE' OBJECT FOR THE DARK THEME (ORANGE) ---
    gauge: {
      gradientStart: '#FE5000', // Your vibrant secondary orange
      gradientEnd: '#EE7200',   // Your main theme orange
      track: 'rgba(174, 160, 248, 0.1)', // A very subtle background track
      valueText: '#EE7200',     // The score text perfectly matches your theme orange
    },
  },

  // ===================================================================
  // CUSTOM THEME
  // ===================================================================
  custom: {
    textColor: '#D1D5DB',
    gridColor: 'rgba(37, 99, 235, 0.15)',
    alerts: '#2563EB',
    protocolDistribution: ['#2563EB', '#3B82F6', '#60A5FA', '#1E40AF', '#34D399'],
    liveThroughput: ['#2563EB', '#1E40AF'],
    highlight: '#2563EB',
    status: { good: '#22C55E', medium: '#F59E0B', bad: '#EF4444' },
    
    // --- ADDED THIS 'GAUGE' OBJECT FOR THE CUSTOM THEME (BLUE) ---
    gauge: {
      gradientStart: '#60A5FA',   // A nice vibrant blue matching your protocol colors
      gradientEnd: '#2563EB',   // The main blue from your custom theme
      track: 'rgba(37, 99, 235, 0.1)', // Based on your custom grid color
      valueText: '#2563EB',   // The score text matches your main custom theme blue
    },
  }
};

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'custom');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const isDarkMode = theme === 'dark';
  const chartColors = colorPalettes[theme] || colorPalettes.light;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDarkMode, chartColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;