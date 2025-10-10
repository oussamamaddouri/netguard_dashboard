// src/pages/WelcomePage.js

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Users, Shield, Clock } from 'lucide-react';

// --- ASSETS FOR HERO SECTION ---
import siteLogo from '../assets/logo__.png';
import pcIllustration from '../assets/pc.png';
import lockIllustration from '../assets/lock.png';
import ronIllustration from '../assets/ron.png';

// --- ASSETS FOR SERVICES SECTION ---
import cloudSecurityIcon from '../assets/cloud-security.png';
import networkProtectionIcon from '../assets/network-protection.png';
import dataSecurityIcon from '../assets/data-security.png';
import malwarePreventionIcon from '../assets/malware-prevention.png';

// --- ASSET FOR ABOUT US SECTION ---
import pc2Illustration from '../assets/pc2.png';

// --- ASSETS FOR USER IMAGES (USED IN HERO & CASE STUDIES) ---
import user1 from '../assets/user1.png';
import user2 from '../assets/user2.png';
import user3 from '../assets/user3.png';

// Animation variants for sections
const sectionVariants = {
  offscreen: {
    y: 50,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8
    }
  }
};


const HeroSection = () => {
    const accentBlue = '#2563EB';

    // Animation variants for the hero section elements
    const heroContainerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
        },
      },
    };

    const heroItemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: "easeInOut",
        },
      },
    };

    return (
        <div className="bg-black relative z-10">
            {/* Diagonal / diamond-pattern background applied only to HeroSection */}
            <div className="absolute inset-0 z-0 opacity-40"
                 style={{
                     backgroundImage: `
                        repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 40px),
                        repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03) 1px, transparent 1px, transparent 40px)
                     `
                 }}
            />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10"> {/* Added relative z-10 here to ensure content is above the background */}
                <header className="py-6 flex justify-between items-center">
                    <Link to="/login" className="flex items-center gap-3">
                        <img src={siteLogo} alt="Netguard Logo" className="h-8 w-auto" />
                    </Link>
                    <nav className="hidden lg:flex items-center gap-8 font-medium text-neutral-300">
                        <a href="#home" className="hover:text-white transition-colors">[ Home ]</a>
                        <a href="#about" className="hover:text-white transition-colors">[ About ]</a>
                        <a href="#pages" className="hover:text-white transition-colors">[ Pages ]</a>
                        <a href="#cart" className="hover:text-white transition-colors">Cart [0]</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        {/* --- CHANGE IS HERE --- */}
                        {/* I changed the <a> tag to a <Link> tag and href to to="/login" */}
                        <Link to="/login" className="font-medium text-neutral-300 hover:text-white transition-colors flex items-center gap-2">Login <ArrowRight size={16}/></Link>
                        {/* --- END OF CHANGE --- */}
                        <Link to="/contact" className="bg-white text-black font-semibold px-5 py-2.5 rounded-md hover:bg-neutral-200 transition-colors">Get in touch</Link>
                    </div>
                </header>
                <motion.main 
                  className="grid lg:grid-cols-2 gap-16 items-center pt-16 pb-24"
                  initial="hidden"
                  animate="visible"
                  variants={heroContainerVariants}
                >
                    <div>
                        <motion.div variants={heroItemVariants} className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-black object-cover" src={user1} alt="User 1" />
                                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-black object-cover" src={user2} alt="User 2" />
                                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-black object-cover" src={user3} alt="User 3" />
                            </div>
                            <span className="text-sm text-neutral-400">Trusted by <b className="text-white font-semibold">150M+</b> users</span>
                        </motion.div>
                        <motion.h1 variants={heroItemVariants} className="text-5xl lg:text-7xl font-bold mt-6 leading-tight text-white">Start protecting<br/>your <span style={{ color: accentBlue }}>online</span><br/><span style={{ color: accentBlue }}>presence</span> today</motion.h1>
                        <motion.p variants={heroItemVariants} className="mt-6 text-neutral-400 max-w-md">Cybersecurity X provides comprehensive, enterprise-grade security solutions that are simple to manage. We defend your digital life against viruses, ransomware, and identity theft with 24/7 intelligent monitoring, so you can operate with confidence.</motion.p>
                        <motion.div variants={heroItemVariants} className="mt-8 flex items-center gap-6">
                          <Link to="/contact" className="bg-white text-black font-semibold px-6 py-3 rounded-md hover:bg-neutral-200 transition-colors">Get in touch</Link>
                          <a href="#learn-more" className="font-semibold text-white flex items-center gap-2 group">Learn more <ArrowRight size={16} className="transition-transform group-hover:translate-x-1"/></a>
                        </motion.div>
                        <div className="mt-16 pt-8 border-t border-white/10 flex items-start gap-12">
                            <motion.div variants={heroItemVariants}>
                                <p className="text-5xl font-bold text-white flex items-center">575<span style={{ color: accentBlue }}>+</span></p>
                                <div className="mt-2 flex items-center gap-2 text-sm text-neutral-400"><CheckCircle size={16} className="text-green-500"/><span>Successful Projects</span></div>
                            </motion.div>
                            <motion.div variants={heroItemVariants}>
                                <p className="text-5xl font-bold text-white">99<span className="text-white">%</span></p>
                                <div className="mt-2 flex items-center gap-2 text-sm text-neutral-400"><Users size={16} className="text-neutral-400"/><span>Customer satisfaction</span></div>
                            </motion.div>
                        </div>
                    </div>
                    <div className="relative flex items-center justify-center pt-10">
                        <motion.img 
                          src={pcIllustration} 
                          alt="Isometric PC illustration" 
                          className="w-full h-auto max-w-lg z-10" 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.7, delay: 0.5 }}
                        />
                        <motion.img 
                          src={lockIllustration} 
                          alt="Security lock icon" 
                          className="absolute w-1/3 max-w-[70px] h-auto top-20 left-0 -translate-x-1/4 z-20"
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.7, delay: 0.8 }}
                        />
                        {/* Modified ronIllustration for bottom-left placement */}
                        <motion.img 
                          src={ronIllustration} 
                          alt="Gear icon" 
                          className="absolute w-1/3 max-w-[150px] h-auto bottom-0 left-0 -translate-x-1/4 translate-y-1/4 z-0" // Changed translate-x to -translate-x
                          initial={{ opacity: 0, x: -50, rotate: -90 }} // Changed initial x to -50
                          animate={{ opacity: 1, x: 0, rotate: 0 }}
                          transition={{ duration: 0.7, delay: 1 }}
                        />
                    </div>
                </motion.main>
            </div>
        </div>
    );
};

// ... the rest of your WelcomePage.js file remains exactly the same ...

const servicesData = [ { title: 'Cloud security', description: 'We secure your cloud infrastructure, applications, and data. Our solutions ensure compliance and prevent breaches in environments like AWS, Azure, and Google Cloud.', icon: cloudSecurityIcon }, { title: 'Network protection', description: 'Our advanced firewalls and intrusion detection systems shield your network perimeter, blocking malicious traffic and unauthorized access before they cause harm.', icon: networkProtectionIcon }, { title: 'Data security', description: 'Protect your most valuable asset. We implement robust encryption and access controls to safeguard sensitive data from theft, corruption, and accidental leakage.', icon: dataSecurityIcon }, { title: 'Malware prevention', description: 'Stay ahead of evolving threats with our proactive anti-malware engine. It detects and neutralizes viruses, ransomware, and spyware in real-time across all your devices.', icon: malwarePreventionIcon },];

const ServicesSection = () => {
    const accentBlue = '#2563EB';
    const extendedServices = [...servicesData, ...servicesData];

    return (
        <motion.section 
          className="bg-black text-white py-24 relative z-10"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p style={{ color: accentBlue }} className="font-semibold">// Our services //</p>
                <h2 className="text-4xl md:text-5xl font-bold mt-4">We are security experts on all<br/><span style={{ color: accentBlue }}>technologies</span> & <span style={{ color: accentBlue }}>platforms</span></h2>
            </div>
            <div className="w-full inline-flex flex-nowrap overflow-hidden mt-16" style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
                <ul className="flex items-center justify-center md:justify-start [&_li]:mx-4 animate-infinite-scroll">
                    {extendedServices.map((service, index) => (
                        <li key={index} className="flex-shrink-0 w-80 h-96 p-8 bg-[#090909] border border-neutral-800 rounded-lg flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold">{service.title}</h3>
                                <p className="text-neutral-400 mt-2">{service.description}</p>
                            </div>
                            <img src={service.icon} alt={`${service.title} icon`} className="w-full h-40 object-contain mt-4"/>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-16 flex justify-center items-center gap-6">
                 <Link to="/contact" className="bg-white text-black font-semibold px-6 py-3 rounded-md hover:bg-neutral-200 transition-colors">Get in touch</Link>
                 <a href="#browse-services" className="font-semibold text-white flex items-center gap-2 group">Browse all services <ArrowRight size={16} className="transition-transform group-hover:translate-x-1"/></a>
            </div>
        </motion.section>
    );
};

const AboutUsSection = () => {
    const accentBlue = '#2563EB';

    return (
        <motion.section 
            className="bg-black text-white py-24 relative z-10"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.2 }}
            variants={sectionVariants}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial={{ x: -100, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }}> 
                        <img src={pc2Illustration} alt="Isometric illustration of a secure computer monitor" className="w-3/4 h-auto mx-auto" /> 
                    </motion.div>
                    <motion.div initial={{ x: 100, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}>
                        <p style={{ color: accentBlue }} className="font-semibold">// About us //</p>
                        <h2 className="text-4xl md:text-5xl font-bold mt-4 leading-tight"> <span style={{ color: accentBlue }}>Empowering</span> users:<br /> Our cybersecurity<br /> commitment </h2>
                        <div className="mt-10 space-y-8">
                            <div className="flex items-start gap-4">
                                <Shield size={24} className="mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold">Proven protection</h3>
                                    <p className="text-neutral-400 mt-2"> Leveraging award-winning technology and years of front-line expertise, our solutions are trusted by millions to deliver reliable and effective threat defense. </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Clock size={24} className="mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="text-xl font-bold">24/7 monitoring</h3>
                                    <p className="text-neutral-400 mt-2"> Our Security Operations Center (SOC) works around the clock, using AI-driven tools to monitor your systems for any signs of compromise and ensure an immediate response. </p>
                                </div>
                            </div>
                        </div>
                        <Link to="/contact" className="mt-10 inline-block bg-white text-black font-semibold px-6 py-3 rounded-md hover:bg-neutral-200 transition-colors"> Get in touch </Link>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
};

const caseStudiesData = [ { title: 'Financial institution thwarts sophisticated phishing attack successfully', description: 'Learn how our multi-layered defense system identified and neutralized a zero-day phishing threat, saving the client from significant financial loss and reputational damage.', authorName: 'by John Carter', authorImage: user2, }, { title: 'Healthcare provider prevents data breach with advanced encryption measures', description: 'Discover the strategy we deployed to secure protected health information (PHI) with end-to-end encryption, meeting HIPAA compliance and preventing a costly data breach.', authorName: 'by Sophie Moore', authorImage: user1, }, { title: 'Retailer enhances network security amid rising cyber threats', description: 'Explore how we hardened their network infrastructure to defend against DDoS attacks and secure point-of-sale systems during their busiest shopping seasons.', authorName: 'by Lilly Woods', authorImage: user3, } ];

const CaseStudiesSection = () => {
    const accentBlue = '#2563EB';

    const gridVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.2,
        },
      },
    };

    const cardVariants = {
      hidden: { y: 50, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        },
      },
    };

    return (
        <motion.section 
            className="bg-black text-white py-24 relative z-10"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.1 }}
            variants={sectionVariants}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p style={{ color: accentBlue }} className="font-semibold">// Case studies //</p>
                <h2 className="text-4xl md:text-5xl font-bold mt-4 max-w-4xl mx-auto leading-tight"> Discover how we had helped <span style={{ color: accentBlue }}>world class companies</span> in the past </h2>
                <p className="mt-6 text-neutral-400 max-w-xl mx-auto"> Don't just take our word for it. See how we've partnered with leading organizations to solve their most complex security challenges and protect their critical assets. </p>
            </div>
            <motion.div 
                className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                variants={gridVariants}
            >
                {caseStudiesData.map((study, index) => (
                    <motion.div 
                        key={index} 
                        className="border border-neutral-800 rounded-lg p-8 flex flex-col justify-between text-left space-y-8"
                        variants={cardVariants}
                    >
                        <div>
                            <h3 className="text-xl font-bold leading-snug">{study.title}</h3>
                            <p className="text-neutral-400 mt-4">{study.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <img src={study.authorImage} alt={study.authorName} className="h-10 w-10 rounded-full object-cover" />
                            <p className="text-neutral-300 font-medium">{study.authorName}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
            <div className="mt-16 text-center">
                <a href="#browse-all-case-studies" className="font-semibold text-white inline-flex items-center justify-center gap-2 group"> Browse all case studies <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /> </a>
            </div>
        </motion.section>
    );
};

const FooterSection = () => {

    const mainPagesLinks = [
      { name: "Home", href: "/" },
      { name: "About", href: "#" },
      { name: "Services", href: "#" },
      { name: "Case Studies", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Contact", href: "/contact" },
    ];

    const utilityPagesLinks = [
      { name: "Start here", href: "#" },
      { name: "Style guide", href: "#" },
      { name: "Password protected", href: "#" },
      { name: "404 not found", href: "#" },
      { name: "Licenses", href: "#" },
      { name: "Changelog", href: "#" },
    ];

    return (
      <motion.footer 
        className="bg-black text-white relative z-10 border-t border-white/10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12">
            <div className="md:col-span-3 lg:col-span-2 space-y-8">
              <Link to="/" className="flex items-center">
                <img src={siteLogo} alt="Cybersecurity X Logo" className="h-8 w-auto" />
              </Link>
              <div className="space-y-4">
                <h3 className="font-bold text-lg">Contact us</h3>
                <div>
                  <p className="text-neutral-400 text-sm">Email address</p>
                  <a href="mailto:info@cybersecurity.com" className="font-semibold hover:text-neutral-300 transition-colors">info@cybersecurity.com</a>
                </div>
                <div>
                  <p className="text-neutral-400 text-sm">Phone number</p>
                  <a href="tel:123-456-7890" className="font-semibold hover:text-neutral-300 transition-colors">(123) 456 - 7890</a>
                </div>
              </div>
               <p className="text-neutral-500 text-sm pt-4">Copyright © Cybersecurity X | Designed by <a href="#" className="text-neutral-400 hover:text-white">Maddouri Oussama</a> - Powered by <a href="#" className="text-neutral-400 hover:text-white">Maddouri</a></p>
            </div>
            <div className="lg:col-start-4">
              <h3 className="font-bold text-lg">Main pages</h3>
              <ul className="mt-4 space-y-3">
                {mainPagesLinks.map(link => (
                  <li key={link.name}><Link to={link.href} className="text-neutral-400 hover:text-white transition-colors">{link.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg">Utility pages</h3>
              <ul className="mt-4 space-y-3">
                {utilityPagesLinks.map(link => (
                  <li key={link.name}><Link to={link.href} className="text-neutral-400 hover:text-white transition-colors">{link.name}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.footer>
    );
};

const WelcomePage = () => {
    return (
        <div className="bg-black font-sans relative min-h-screen">
            {/* The diagonal pattern background div was removed from here */}
            <div className="relative z-10">
                <HeroSection />
                <ServicesSection />
                <AboutUsSection />
                <CaseStudiesSection />
                <FooterSection />
            </div>
        </div>
    );
};

export default WelcomePage;
