import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

import loggo from '../../assets/loggo.png';
import logoCyber from '../../assets/logo_cyber.png';
import logoDarkTheme from '../../assets/logo_darktheme.png'; // ADDED: Import the new dark theme logo

const Header = () => {
    const { theme, setTheme } = useTheme();
    const navItems = ['Overview', 'Threat Intel', 'Endpoints', 'Packet Stream', 'Reports'];
    const [activeItem, setActiveItem] = useState('Overview');
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const themeMenuRef = useRef(null);

    // CHANGED: Logic for logo selection
    const netguardLogoSrc = theme === 'dark' ? logoDarkTheme : loggo;
    const cyberLogoFilter = theme === 'light' ? 'invert' : '';
    // REMOVED: The old `netguardLogoFilter` is no longer needed

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        setIsThemeMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (themeMenuRef.current && !themeMenuRef.current.contains(event.target)) {
                setIsThemeMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const baseButtonClasses = "flex items-center justify-start gap-3 w-full px-3 py-2 text-sm font-medium rounded-md transition-colors outline-none";
    const activeClasses = "bg-accent-muted text-text-primary";
    const inactiveClasses = "text-text-secondary hover:bg-accent-muted/50 hover:text-text-primary";

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-background/95 backdrop-blur-lg shadow-md w-full">
            <div className="flex items-center gap-3 group cursor-pointer">
                {/* CHANGED: Updated the img tag to use the new source and removed the filter class */}
                <img src={netguardLogoSrc} alt="Netguard Logo" className="h-6 w-auto transition-transform duration-300 group-hover:scale-110" />
                <img src={logoCyber} alt="Cyber Logo" className={`h-6 w-auto transition-transform duration-300 group-hover:scale-110 ${cyberLogoFilter}`} />
            </div>

            <nav className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                    <motion.a
                        key={item}
                        href="#"
                        onClick={() => setActiveItem(item)}
                        className={`relative px-4 py-2 text-sm font-medium rounded-lg outline-none
                                    focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent
                                    ${activeItem === item
                                        ? 'text-accent font-semibold'
                                        : 'text-text-secondary'
                                    }`}
                        whileHover={{ y: -2, color: 'hsl(var(--color-text-primary))' }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {item}
                        {activeItem === item && (
                           <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                                layoutId="underline"
                                initial={false}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                           />
                        )}
                    </motion.a>
                ))}
            </nav>

            <div className="relative" ref={themeMenuRef}>
                <motion.button
                    onClick={() => setIsThemeMenuOpen(prev => !prev)}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-accent-muted/50 transition-colors"
                    aria-label="Select theme"
                >
                    <Palette size={18} />
                </motion.button>
                
                <AnimatePresence>
                    {isThemeMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full right-0 mt-2 w-40 origin-top-right"
                        >
                            <div className="bg-surface rounded-lg shadow-2xl border border-ui-border p-2 flex flex-col gap-1">
                                <button onClick={() => handleThemeChange('light')} className={`${baseButtonClasses} ${theme === 'light' ? activeClasses : inactiveClasses}`}><Sun size={16} /><span>Light</span></button>
                                <button onClick={() => handleThemeChange('dark')} className={`${baseButtonClasses} ${theme === 'dark' ? activeClasses : inactiveClasses}`}><Moon size={16} /><span>Dark</span></button>
                                <button onClick={() => handleThemeChange('custom')} className={`${baseButtonClasses} ${theme === 'custom' ? activeClasses : inactiveClasses}`}><Palette size={16} /><span>Custom</span></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};

export default Header;