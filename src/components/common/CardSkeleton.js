// src/components/common/CardSkeleton.js

import React from 'react';

const CardSkeleton = ({ className }) => {
    return (
        <div className={`
            bg-surface
            border border-ui-border
            p-4 sm:p-6
            rounded-xl
            shadow-md
            animate-pulse-subtle
            ${className}
        `}>
            <div className="h-4 bg-ui-border/50 rounded-md w-1/3 mb-4"></div>
            <div className="space-y-3 mt-6">
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-2 bg-ui-border/50 rounded col-span-2"></div>
                    <div className="h-2 bg-ui-border/50 rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-ui-border/50 rounded"></div>
                 <div className="h-16 bg-ui-border/50 rounded-lg mt-4"></div>
            </div>
        </div>
    );
};

export default CardSkeleton;
