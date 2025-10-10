// src/App.js

import React, { useEffect, useState } from 'react';
// This import is changed to include 'Navigate' for redirection
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider, useData } from './context/DataContext';
import { AnimatePresence, motion } from 'framer-motion';

// --- COMMON COMPONENTS ---
import Card from './components/common/Card';
import Header from './components/common/Header';

// --- CHART & TABLE COMPONENTS ---
import SecurityPostureGauge from './components/charts/SecurityPostureGauge';
import OSDistributionChart from './components/charts/OSDistributionChart';
import LivePacketTable from './components/tables/LivePacketTable';
import ThreatOriginsChart from './components/charts/RiskSourceChart';
import HostDiscoveryTable from './components/tables/HostDiscoveryTable';
import LiveThroughputChart from './components/charts/LiveThroughputChart';
import HealthScoreBreakdown from './components/charts/HealthScoreBreakdown';
import ServiceDistributionChart from './components/charts/ServiceDistributionChart';
import VulnerabilityTable from './components/tables/VulnerabilityTable';
import TrafficOverTimeProtocolChart from './components/charts/TrafficOverTimeProtocolChart';
import ConnectionStateChart from './components/charts/ConnectionStateChart';

// --- MODAL COMPONENTS ---
import ConnectionStateDetailModal from './components/modals/ConnectionStateDetailModal';
import OSDetailModal from './components/modals/OSDetailModal';

// --- PAGES ---
import WelcomePage from './pages/WelcomePage';
import AuthPage from './pages/AuthPage';
import ContactPage from './pages/ContactPage';


const ScrollManager = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Container for staggered animations
const dashboardVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};


function Dashboard() {
  const { hosts, vulnerabilities, alerts, threatOrigins, securityPosture, topTrafficCountries } = useData();
  
  // --- STATE FOR MODALS ---
  const [isConnStateModalOpen, setConnStateModalOpen] = useState(false);
  const [isOSModalOpen, setOSModalOpen] = useState(false);

  const TOP_ROW_HEIGHT = 'h-80';
  const MIDDLE_ROW_HEIGHT = 'h-80';
  const LARGE_TABLE_HEIGHT = 'h-80';

  return (
    <main className="pt-4 px-4 sm:px-6 lg:px-8">
      
      {/* --- MODALS WRAPPED WITH ANIMATEPRESENCE FOR ANIMATED EXIT --- */}
      <AnimatePresence>
        {isConnStateModalOpen && (
            <ConnectionStateDetailModal 
                isOpen={isConnStateModalOpen}
                onClose={() => setConnStateModalOpen(false)}
            />
        )}
        {isOSModalOpen && (
            <OSDetailModal 
                isOpen={isOSModalOpen}
                onClose={() => setOSModalOpen(false)}
                hosts={hosts}
                vulnerabilities={vulnerabilities} 
                alerts={alerts}
            />
        )}
      </AnimatePresence>
      
      {/* All card grids are wrapped in motion containers for sequential loading */}
      <motion.div 
        variants={dashboardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6"
      >
        <Card className={TOP_ROW_HEIGHT}>
          <SecurityPostureGauge value={securityPosture.health_score} />
        </Card>
        <Card className={TOP_ROW_HEIGHT} onClick={() => setOSModalOpen(true)}> 
            <OSDistributionChart data={hosts} /> 
        </Card>
        <Card className={TOP_ROW_HEIGHT}> <TrafficOverTimeProtocolChart /> </Card>
        <Card className={TOP_ROW_HEIGHT}> <ServiceDistributionChart /> </Card>
        <Card className={TOP_ROW_HEIGHT}>
          <ThreatOriginsChart threatData={threatOrigins} trafficData={topTrafficCountries} />
        </Card>
      </motion.div>

      {/* --- MODIFIED ROW FOR LiveThroughputChart --- */}
      <motion.div 
        variants={dashboardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6"
      >
        <Card className="h-80 lg:col-span-7"> 
          <LiveThroughputChart /> 
        </Card>
        <Card className={`${MIDDLE_ROW_HEIGHT} lg:col-span-2`}> 
          <HealthScoreBreakdown /> 
        </Card>
        <Card 
          className={`${MIDDLE_ROW_HEIGHT} lg:col-span-3`}
          onClick={() => setConnStateModalOpen(true)}
        > 
          <ConnectionStateChart /> 
        </Card>
      </motion.div>

      <motion.div 
        variants={dashboardVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6"
      >
        <Card className={`${LARGE_TABLE_HEIGHT} lg:col-span-7`}> 
          <VulnerabilityTable vulnerabilities={vulnerabilities} /> 
        </Card>
        <Card className={`${LARGE_TABLE_HEIGHT} lg:col-span-5`}> 
          <HostDiscoveryTable hosts={hosts} /> 
        </Card>
      </motion.div>

      <motion.div variants={dashboardVariants} initial="hidden" animate="visible">
          <Card className="h-66"> 
              <LivePacketTable /> 
          </Card>
      </motion.div>
    </main>
  );
}

// Layout component to add transitions to
const pageVariants = {
    initial: { opacity: 0, x: -50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 50 },
};

const PageLayout = ({ children }) => (
    <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={{ type: 'tween', ease: 'anticipate', duration: 0.5 }}
    >
        {children}
    </motion.div>
);

const DashboardLayout = () => {
    return (
        <PageLayout>
            <div className="min-h-screen font-sans">
                <Header />
                <Dashboard />
            </div>
        </PageLayout>
    );
};

// --- This new component handles the animated routes ---
const AnimatedRoutes = () => {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                {/* 1. USERS LANDING AT "/" ARE REDIRECTED TO "/welcome" */}
                <Route path="/" element={<Navigate to="/welcome" replace />} />
                
                {/* 2. THE DASHBOARD NOW HAS ITS OWN DEDICATED PATH */}
                <Route path="/dashboard" element={<DashboardLayout />} />

                {/* --- Other pages remain unchanged --- */}
                <Route path="/welcome" element={<PageLayout><WelcomePage /></PageLayout>} />
                <Route path="/login" element={<PageLayout><AuthPage /></PageLayout>} />
                <Route path="/contact" element={<PageLayout><ContactPage /></PageLayout>} />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <ScrollManager />
          <AnimatedRoutes />
        </BrowserRouter>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;