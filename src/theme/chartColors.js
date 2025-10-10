// src/theme/chartColors.js

/**
 * A centralized, professional color palette for the dashboard.
 * Each theme has a full set of colors for every chart type.
 */

// Key accent colors from your theme
const accentPrimary = '#EE7200'; // Main orange
const accentSecondary = '#FE5000'; // Brighter orange
const accentRed = '#F43F5E';      // Vibrant red for critical items
const darkTextSecondary = '#A998BC'; // Muted text for labels

export const chartColors = {
  // --- THEME FOR 'custom' MODE ---
  custom: {
    textColor: 'hsl(var(--color-text-primary))',
    gridColor: 'rgba(var(--color-ui-border), 0.5)',
    alerts: 'hsl(var(--color-accent))', 
    protocolDistribution: [
        'hsl(var(--color-accent))', '#8B5CF6', '#38BDF8', '#F43F5E', '#22C55E'
    ],
    gauge: {
      gradientStart: '#a78bfa', // A nice vibrant violet
      gradientEnd: 'hsl(var(--color-accent))', // Fading to your custom accent color
      track: 'rgba(var(--color-ui-border), 0.3)', // Uses your custom border color
      valueText: 'hsl(var(--color-accent))', // Score text uses your custom accent color
    },
    liveThroughput: ['hsl(var(--color-accent))', '#a78bfa'],
  },
  
  // --- THEME FOR 'light' MODE ---
  light: {
    textColor: '#475569',
    gridColor: '#E5E7EB',
    alerts: '#C51383', 
    protocolDistribution: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    gauge: {
      gradientStart: '#3b82f6', // A professional Blue
      gradientEnd: '#22d3ee',   // Fading to a vibrant Cyan
      track: '#e5e7eb',        // A subtle gray track
      valueText: '#3b82f6',    // Score text matches the gauge color
    },
    liveThroughput: ['#3b82f6', '#22d3ee'], // Required for LiveThroughputChart
  },

  // --- THEME FOR 'dark' MODE ---
  dark: {
    textColor: darkTextSecondary,
    gridColor: 'rgba(174, 160, 248, 0.15)',
    alerts: accentPrimary, 
    protocolDistribution: [
        accentPrimary, '#8B5CF6', '#38BDF8', accentRed, '#22C55E'
    ],
    gauge: {
      gradientStart: accentSecondary, // Uses your BRIGHTER ORANGE
      gradientEnd: accentPrimary,     // Uses your MAIN ORANGE
      track: 'rgba(174, 160, 248, 0.1)', // A very subtle background track
      valueText: accentPrimary,       // Score text perfectly matches your theme
    },
    liveThroughput: [accentSecondary, '#8B5CF6'], // Required for LiveThroughputChart
  }
};