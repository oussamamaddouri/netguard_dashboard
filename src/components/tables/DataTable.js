import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { gsap } from 'gsap';
import { useInView } from 'react-intersection-observer'; // Import the hook

const getNestedProperty = (obj, path) => {
    if (!path) return 'N/A';
    return path.split('.').reduce((o, i) => (o ? o[i] : undefined), obj);
};

const DataTable = ({ data, columns, headers }) => {
    const { theme } = useTheme();
    const tableHeaders = headers || columns;
    const isCustomTheme = theme === 'custom';
    const tbodyRef = useRef(null);

    // Setup the intersection observer
    const { ref, inView } = useInView({
        triggerOnce: true, // Animation will only trigger once
        threshold: 0.2,    // Trigger when 20% of the table is visible
    });

    // Animate table rows with GSAP when the component is in view and data is present
    useEffect(() => {
        if (inView && tbodyRef.current && data && data.length > 0) {
            const rows = tbodyRef.current.children;
            gsap.from(rows, {
                opacity: 0,
                y: -15,
                duration: 0.5,
                stagger: 0.05,
                ease: 'power3.out',
            });
        }
    }, [inView, data]); // Rerun the effect if inView or data changes

    // Style classes...
    const tableClasses = isCustomTheme ? 'min-w-full text-sm text-left text-text-primary' : 'min-w-full text-sm text-left text-gray-500 dark:text-gray-400';
    const theadClasses = isCustomTheme ? 'text-xs text-text-primary uppercase bg-surface sticky top-0' : 'text-xs text-gray-700 uppercase dark:text-gray-300 sticky top-0';
    const tbodyClasses = isCustomTheme ? 'divide-y divide-ui-border' : 'divide-y divide-gray-200 dark:divide-gray-700';
    const trClasses = isCustomTheme ? 'hover:bg-accent-muted/50' : 'hover:bg-black/5 dark:hover:bg-white/5';

    return (
        <div ref={ref} className="h-full overflow-y-auto flex-grow min-h-0">
            <table className={tableClasses}>
                <thead className={theadClasses}>
                    <tr>
                        {tableHeaders.map((header, index) => (
                            <th key={index} scope="col" className="px-6 py-3">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody ref={tbodyRef} className={tbodyClasses}>
                    {data && data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex} className={trClasses}>
                                {columns.map((col, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4">
                                        {getNestedProperty(row, col) || 'N/A'}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="text-center py-8 text-gray-400">
                                No data available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;