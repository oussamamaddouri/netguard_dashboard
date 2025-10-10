// src/pages/ContactPage.js

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion
import { ArrowRight, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import siteLogo from '../assets/logo__.png';

// Import assets
import megaphoneIcon from '../assets/megaphone.png';
import pressIcon from '../assets/press.png';
import supportIcon from '../assets/support.png';

//================================================================
// DIRECT CONTACT SECTION COMPONENT
//================================================================
const directContactData = [
    {
        icon: megaphoneIcon,
        title: 'Sales & enquiries',
        description: 'Ready to strengthen your security? Contact our sales team for product information, demos, and quotes.',
        email: 'sales@cybersecurity.com'
    },
    {
        icon: pressIcon,
        title: 'Press & media',
        description: 'For media inquiries, interview requests, or access to our press kits, please contact our communications team.',
        email: 'press@cybersecurity.com'
    },
    {
        icon: supportIcon,
        title: 'Help & support',
        description: 'If you are an existing customer needing technical assistance, our support specialists are here to help you 24/7.',
        email: 'support@cybersecurity.com'
    }
];

const DirectContactSection = () => {
    const accentBlue = '#2563EB';

    // Stagger animation for the grid of contacts
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
    };

    // Animation for each card item
    const itemVariants = {
        hidden: { y: 20, opacity: 0, scale: 0.95 },
        visible: {
            y: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <motion.section 
            className="bg-black text-white py-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
            }}
        >
             <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p style={{ color: accentBlue }} className="font-semibold">// Contact us directly //</p>
                <h2 className="text-4xl md:text-5xl font-bold mt-4">
                    Reach us out <span style={{ color: accentBlue }}>directly</span>
                </h2>
                <p className="mt-6 text-neutral-400 max-w-xl mx-auto">
                    For specific inquiries, please use the appropriate contact details below. This ensures your message gets to the right team as quickly as possible.
                </p>
            </div>
            <motion.div 
                className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 grid gap-8 md:grid-cols-3 text-center"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                {directContactData.map((item, index) => (
                    <motion.div key={index} className="flex flex-col items-center" variants={itemVariants}>
                        <img src={item.icon} alt={`${item.title} icon`} className="h-24 w-auto mb-6" />
                        <h3 className="text-2xl font-bold">{item.title}</h3>
                        <p className="text-neutral-400 mt-2 max-w-xs">{item.description}</p>
                        <a href={`mailto:${item.email}`} className="mt-4 font-semibold text-white flex items-center gap-2 group">
                            {item.email} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </a>
                    </motion.div>
                ))}
            </motion.div>
        </motion.section>
    );
};


//================================================================
// FOOTER SECTION
//================================================================
const FooterSection = () => {
    // Links data (kept for brevity)
    const mainPagesLinks = [ { name: "Home", href: "/welcome" }, { name: "Contact", href: "/contact" }, /* ... other links */ ];
    const utilityPagesLinks = [ { name: "Start here", href: "#" }, /* ... other links */ ];

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
              <Link to="/welcome" className="flex items-center">
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
                  <li key={link.name}><a href={link.href} className="text-neutral-400 hover:text-white transition-colors">{link.name}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.footer>
    );
};

//================================================================
// MAIN CONTACT PAGE COMPONENT
//================================================================
const ContactPage = () => {
    const accentBlue = '#2563EB';

    // Parent container variant for stagger effect
    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.2 } }
    };
    
    // Child item variant for animating columns
    const itemVariants = (direction = 'left') => ({
        hidden: {
            opacity: 0,
            x: direction === 'left' ? -100 : 100
        },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    });

    return (
        <div className="bg-black text-white font-sans">
            <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
                <Link to="/welcome" className="flex items-center gap-3">
                    <img src={siteLogo} alt="Netguard Logo" className="h-8 w-auto" />
                </Link>
                <nav className="hidden lg:flex items-center gap-8 font-medium text-neutral-300">
                    <Link to="/welcome" className="hover:text-white transition-colors">[ Home ]</Link>
                    {/* ... other nav links */}
                </nav>
                <div className="flex items-center gap-4">
                    <Link to="/login" className="font-medium text-neutral-300 hover:text-white transition-colors flex items-center gap-2">Login <ArrowRight size={16}/></Link>
                    <Link to="/contact" className="bg-white text-black font-semibold px-5 py-2.5 rounded-md hover:bg-neutral-200 transition-colors">Get in touch</Link>
                </div>
            </header>

            <motion.main 
                className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    {/* Left Column: Text Content */}
                    <motion.div className="space-y-8" variants={itemVariants('left')}>
                        <p style={{ color: accentBlue }} className="font-semibold">// Get in touch //</p>
                        <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                            Get in touch with us <span style={{ color: accentBlue }}>today</span>
                        </h1>
                        <p className="text-neutral-400 max-w-md">
                            Whether you have a question about our services, need a custom security quote, or want to discuss a partnership, we’re ready to help. Fill out the form and our team will get back to you shortly.
                        </p>
                        <div className="space-y-4 pt-4">
                            <div>
                                <p className="text-neutral-400 text-sm">Email address</p>
                                <a href="mailto:info@cybersecurity.com" className="font-semibold hover:text-neutral-300 transition-colors">info@cybersecurity.com</a>
                            </div>
                            <div>
                                <p className="text-neutral-400 text-sm">Phone number</p>
                                <a href="tel:123-456-7890" className="font-semibold hover:text-neutral-300 transition-colors">(123) 456 - 7890</a>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Form */}
                    <motion.form 
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        variants={itemVariants('right')}
                    >
                        {/* Form fields remain the same */}
                        <div>
                            <label htmlFor="full-name" className="block text-sm font-medium text-neutral-300 mb-2">Full name</label>
                            <input type="text" id="full-name" placeholder="John Carter" className="w-full bg-[#111] border border-neutral-800 rounded-md px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">Email address</label>
                            <input type="email" id="email" placeholder="example@email.com" className="w-full bg-[#111] border border-neutral-800 rounded-md px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-neutral-300 mb-2">Phone number</label>
                            <input type="tel" id="phone" placeholder="(123) 456 - 7890" className="w-full bg-[#111] border border-neutral-800 rounded-md px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-neutral-300 mb-2">Subject</label>
                            <input type="text" id="subject" placeholder="ex. Cloud Security" className="w-full bg-[#111] border border-neutral-800 rounded-md px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="message" className="block text-sm font-medium text-neutral-300 mb-2">Message</label>
                            <textarea id="message" rows="5" placeholder="Write your message here..." className="w-full bg-[#111] border border-neutral-800 rounded-md px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                        </div>
                        <div className="md:col-span-2 flex items-center justify-between">
                             <button type="submit" className="bg-white text-black font-semibold px-6 py-3 rounded-md hover:bg-neutral-200 transition-colors">Send message</button>
                             <div className="flex items-center gap-4 text-neutral-500">
                                <a href="#" className="hover:text-white transition-colors"><Facebook size={20}/></a>
                                <a href="#" className="hover:text-white transition-colors"><Twitter size={20}/></a>
                                <a href="#" className="hover:text-white transition-colors"><Instagram size={20}/></a>
                                <a href="#" className="hover:text-white transition-colors"><Linkedin size={20}/></a>
                             </div>
                        </div>
                    </motion.form>
                </div>
            </motion.main>

            {/* Sections */}
            <DirectContactSection />
            <FooterSection />
        </div>
    );
};

export default ContactPage;
