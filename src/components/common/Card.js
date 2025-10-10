import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer'; // Import the hook

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            when: "beforeChildren",
            staggerChildren: 0.1,
            duration: 0.4
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
};

const Card = ({ children, className, onClick }) => {
    const { ref, inView } = useInView({
        triggerOnce: true, // Animation will only trigger once
        threshold: 0.1,    // Trigger when 10% of the card is visible
    });

    const clickableClasses = onClick ? 'cursor-pointer' : '';

    return (
        <motion.div
            ref={ref} // Attach the ref to the motion component
            variants={cardVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"} // Animate only when inView is true
            onClick={onClick}
            whileHover={onClick ? { scale: 1.03, y: -5, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`
                bg-surface border border-ui-border p-4 sm:p-6 rounded-xl shadow-md
                flex flex-col ${clickableClasses} ${className}
            `}
        >
            {children}
        </motion.div>
    );
};

// No changes needed for CardTitle and CardContent
export const CardTitle = ({ children }) => (
    <motion.h2 variants={itemVariants} className="text-lg font-semibold mb-4 text-text-primary flex-shrink-0">
        {children}
    </motion.h2>
);

export const CardContent = ({ children, className }) => (
    <motion.div variants={itemVariants} className={`flex-grow h-full min-h-0 overflow-hidden ${className}`}>
        {children}
    </motion.div>
);

export default Card;