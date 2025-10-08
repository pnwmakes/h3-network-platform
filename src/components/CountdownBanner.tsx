'use client';

import { useState, useEffect } from 'react';

export default function CountdownBanner() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        // Set target date to January 1, 2026
        const targetDate = new Date('2026-01-01T00:00:00').getTime();

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor(
                        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                    ),
                    minutes: Math.floor(
                        (difference % (1000 * 60 * 60)) / (1000 * 60)
                    ),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000),
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className='bg-gradient-to-r from-blue-600 to-green-600 text-white py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
                <h2 className='text-3xl md:text-4xl font-black mb-4'>
                    PLATFORM LAUNCHES IN
                </h2>
                <div className='grid grid-cols-4 gap-4 max-w-md mx-auto'>
                    <div className='bg-white/20 backdrop-blur rounded-lg p-4'>
                        <div className='text-2xl md:text-3xl font-black'>
                            {timeLeft.days}
                        </div>
                        <div className='text-sm uppercase tracking-wide'>
                            Days
                        </div>
                    </div>
                    <div className='bg-white/20 backdrop-blur rounded-lg p-4'>
                        <div className='text-2xl md:text-3xl font-black'>
                            {timeLeft.hours}
                        </div>
                        <div className='text-sm uppercase tracking-wide'>
                            Hours
                        </div>
                    </div>
                    <div className='bg-white/20 backdrop-blur rounded-lg p-4'>
                        <div className='text-2xl md:text-3xl font-black'>
                            {timeLeft.minutes}
                        </div>
                        <div className='text-sm uppercase tracking-wide'>
                            Minutes
                        </div>
                    </div>
                    <div className='bg-white/20 backdrop-blur rounded-lg p-4'>
                        <div className='text-2xl md:text-3xl font-black'>
                            {timeLeft.seconds}
                        </div>
                        <div className='text-sm uppercase tracking-wide'>
                            Seconds
                        </div>
                    </div>
                </div>
                <p className='mt-6 text-lg font-medium opacity-90'>
                    Join our community and be part of the movement for Hope,
                    Help, and Humor
                </p>
            </div>
        </div>
    );
}
