// src/pages/AuthPage.js (Corrected)

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import siteLogo from '../assets/logo__.png';
import authIllustration from '../assets/auth-illustration.png';

// SVG components (remain the same)
const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.94 11.05A8.83 8.83 0 0 0 12.01 4C7.03 4 3 8.03 3 13s4.03 9 9.01 9a8.83 8.83 0 0 0 8.93-7.95h-8.93v-4.01h10.98a9.42 9.42 0 0 1-.22 3.01z" fill="#FFF"/>
    </svg>
);
const GitHubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.73c0 .27.18.58.69.48A10 10 0 0 0 22 12 10 10 0 0 0 12 2z" fill="#FFF"/>
    </svg>
);


const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const accentBlue = '#2563EB';

    const formContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };
    
    const formItemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };
    
    const titleVariants = {
      initial: { opacity: 0, y: -10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 10 },
    };


    return (
        <div className="bg-black text-white font-sans min-h-screen flex items-center justify-center">
            <div className="container mx-auto px-4 py-8">
                <motion.div 
                    className="grid lg:grid-cols-2 gap-12 items-center bg-[#090909] border border-neutral-800 rounded-xl overflow-hidden"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >

                    {/* Left Column: Illustration */}
                    <div className="hidden lg:flex items-center justify-center p-8 bg-black h-full">
                        <motion.img 
                            src={authIllustration} 
                            alt="Illustration of an email emerging from a laptop" 
                            className="w-full max-w-md object-contain"
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                        />
                    </div>

                    {/* Right Column: Form */}
                    <div className="p-8 sm:p-12">
                        <motion.div 
                            className="max-w-md w-full"
                            variants={formContainerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Link to="/welcome">
                                <motion.img variants={formItemVariants} src={siteLogo} alt="Netguard Logo" className="h-8 w-auto mb-8" />
                            </Link>
                            
                            <motion.h1 className="text-4xl font-bold" key={isLogin ? 'login-title' : 'signup-title'} variants={titleVariants} initial="initial" animate="animate" exit="exit">
                              {isLogin ? 'Welcome Back' : 'Create an Account'}
                            </motion.h1>

                            <motion.p variants={formItemVariants} className="mt-3 text-neutral-400">Please enter your details to proceed.</motion.p>

                            <motion.div variants={formItemVariants} className="flex items-center gap-4 mt-8">
                                <button className="flex-grow flex items-center justify-center gap-2 border border-neutral-700 rounded-md py-3 text-sm font-semibold hover:bg-neutral-800 transition-colors">
                                    <GoogleIcon />
                                    Google
                                </button>
                                <button className="flex-grow flex items-center justify-center gap-2 border border-neutral-700 rounded-md py-3 text-sm font-semibold hover:bg-neutral-800 transition-colors">
                                    <GitHubIcon />
                                    GitHub
                                </button>
                            </motion.div>
                            
                            <motion.div variants={formItemVariants} className="flex items-center gap-4 my-6">
                                <hr className="flex-grow border-neutral-700" />
                                <span className="text-neutral-500 text-xs">OR</span>
                                <hr className="flex-grow border-neutral-700" />
                            </motion.div>

                            <form className="space-y-5">
                                <motion.div variants={formItemVariants}>
                                    <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">Email address</label>
                                    <input type="email" id="email" required className="w-full bg-[#111] border border-neutral-700 rounded-md px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                </motion.div>
                                <motion.div variants={formItemVariants}>
                                    <label htmlFor="password"  className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
                                    <input type="password" id="password" required className="w-full bg-[#111] border border-neutral-700 rounded-md px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                </motion.div>
                                
                                <AnimatePresence>
                                {!isLogin && (
                                     <motion.div
                                        key="confirm-password"
                                        initial={{ opacity: 0, y: -20, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto', transition: { duration: 0.4, ease: 'easeOut' } }}
                                        exit={{ opacity: 0, y: -10, height: 0, transition: { duration: 0.3, ease: 'easeIn' } }}
                                     >
                                        <label htmlFor="confirm-password"  className="block text-sm font-medium text-neutral-300 mb-2">Confirm Password</label>
                                        <input type="password" id="confirm-password" required className="w-full bg-[#111] border border-neutral-700 rounded-md px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                                    </motion.div> 
                                )}
                                </AnimatePresence>
                                
                                <motion.button variants={formItemVariants} type="submit" className="w-full bg-white text-black font-semibold px-6 py-3 rounded-md hover:bg-neutral-200 transition-colors !mt-8">
                                    {isLogin ? 'Log In' : 'Sign Up'}
                                </motion.button>
                            </form>

                            <motion.p variants={formItemVariants} className="mt-6 text-center text-sm text-neutral-400">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <button onClick={() => setIsLogin(!isLogin)} className="ml-1 font-semibold" style={{color: accentBlue}}>
                                    {isLogin ? 'Sign up' : 'Log in'}
                                </button>
                            </motion.p>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;