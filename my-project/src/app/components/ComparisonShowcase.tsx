'use client';

import React from 'react';

interface ComparisonShowcaseProps {
    beforeComponent: React.ReactNode;
    afterComponent: React.ReactNode;
    beforeHeading?: string;
    afterHeading?: string;
    beforeFooter?: string;
    afterFooter?: string;
    title?: string;
    description?: string;
}

function ComparisonShowcase({
    beforeComponent,
    afterComponent,
    beforeHeading = "Without Motion",
    afterHeading = "With Motion",
    beforeFooter = "Static interactions",
    afterFooter = "Smooth animations",
    title = "Before → After Transformation",
    description
}: ComparisonShowcaseProps) {
    return (
        <div className='w-full min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 py-12 px-4'>
            {/* Header Section */}
            {/* <div className='max-w-7xl mx-auto mb-12 text-center'>
                <h1 className='text-4xl md:text-5xl font-bold text-neutral-900 mb-4'>
                    {title}
                </h1>
                {description && (
                    <p className='text-lg text-neutral-600 max-w-2xl mx-auto'>
                        {description}
                    </p>
                )}
            </div> */}

            {/* Comparison Container */}
            <div className='max-w-7xl mx-auto flex flex-row gap-24 items-center justify-center'>
                
                {/* Before Section */}
                <div className='flex flex-col items-center'>
                    {/* Badge */}
                    {/* <div className='mb-4 px-4 py-2 bg-neutral-200 rounded-full'>
                        <span className='text-sm font-semibold text-neutral-700 uppercase tracking-wide'>
                            Before
                        </span>
                    </div> */}
                    
                    {/* Heading */}
                    <h2 className='text-lg text-neutral-800 mb-2 bg-neutral-200 rounded-full px-8 py-1'>
                        {beforeHeading}
                    </h2>
                    
                    {/* Footer Label */}
                    <p className='text-neutral-500 mb-6 text-center'>
                        {beforeFooter}
                    </p>
                    
                    {/* Component Container */}
                    <div className=''>
                        {beforeComponent}
                    </div>
                </div>

                {/* After Section */}
                <div className='flex flex-col items-center'>
                    {/* Badge */}
                    {/* <div className='mb-4 px-4 py-2 bg-neutral-200 rounded-full'>
                        <span className='text-sm font-semibold text-neutral-800 uppercase tracking-wide'>
                            After
                        </span>
                    </div> */}
                    
                    {/* Heading */}
                    <h2 className='text-lg text-neutral-800 mb-2 bg-neutral-200 rounded-full px-8 py-1'>
                        {afterHeading}
                    </h2>
                    
                    {/* Footer Label */}
                    <p className='text-neutral-800 mb-6 text-center'>
                        {afterFooter}
                    </p>
                    
                    {/* Component Container */}
                    <div className=''>
                        {afterComponent}
                    </div>
                </div>

            </div>

        </div>
    );
}

export default ComparisonShowcase;