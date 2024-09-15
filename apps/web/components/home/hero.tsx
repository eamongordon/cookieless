import React from 'react';
import { Button } from '../ui/button';

export default function Hero() {
    return (
        <section className="flex flex-col items-center justify-center text-center py-20 h-dvh gap-8">
            <h1 className="text-6xl font-semibold">Go Cookieless!</h1>
            <p className="text-3xl">Robust. Privacy-Focused. No Compromise.</p>
            <Button variant="cookie" size="lg" rounded="full">Get Started</Button>
        </section>
    );
};