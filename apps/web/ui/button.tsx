"use client";

import { ReactNode } from "react";
import { useTrackEvent } from '@repo/next';

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName: string;
}

export const Button = ({ children, className, appName }: ButtonProps) => {
  const trackEvent = useTrackEvent();
  return (
    <button
      className={className}
      onClick={() => {
        console.log(`Hello from your ${appName} app!`);
        //alert(`Hello from your ${appName} app!`);
        trackEvent('button_click', { action: 'click', label: 'button' });
      }}
    >
      {children}
    </button>
  );
};
