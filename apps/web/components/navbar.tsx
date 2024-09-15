"use client";

import React, { useState } from 'react';
import { buttonVariants } from './ui/button';
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b-2">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex-shrink-0 flex flex-row space-x-2">
          <img className="h-8 w-8" src="/cookielogo.svg" alt="Logo" />
          <p className="font-semibold text-xl">Cookieless</p>
        </div>
        {/* Menu items and button */}
        <div className="flex-1 flex items-center justify-end">
          <div className="hidden md:flex space-x-4">
            <Link href="#home" className="text-neutral-700 hover:text-dough-500 px-3 py-2 text-sm font-semibold">Home</Link>
            <Link href="#features" className="text-neutral-700 hover:text-dough-500 px-3 py-2 text-sm font-semibold">Features</Link>
            <Link href="#contact" className="text-neutral-700 hover:text-dough-500 px-3 py-2 text-sm font-semibold">Contact</Link>
            <div className='ml-4 space-x-2'>
              <Link href="/login" className={buttonVariants({ variant: "secondary", rounded: "full", className: "w-28" })}>Log In</Link>
              <Link href="/signup" className={buttonVariants({ variant: "default", rounded: "full", className: "w-28" })}>Sign Up</Link>
            </div>
          </div>
        </div>
        {/* Mobile menu button */}
        <div className="absolute inset-y-0 right-0 flex items-center md:hidden">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {/* Icon when menu is closed. */}
            <svg className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            {/* Icon when menu is open. */}
            <svg className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <a href="#home" className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Home</a>
          <a href="#features" className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Features</a>
          <a href="#contact" className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Contact</a>
          <Link href="/login" className={buttonVariants({ variant: "secondary", rounded: "full", className: "w-full" })}>Log In</Link>
          <Link href="/signup" className={buttonVariants({ variant: "default", rounded: "full", className: "w-full" })}>Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}