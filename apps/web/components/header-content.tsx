"use client";

import React, { useState } from 'react';
import { Button, buttonVariants } from './ui/button';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import UserMenu from './user-menu';
import { cn } from '@/lib/utils';

export default function HeaderComp({
  userData
}: {
  userData?: {
    name?: string | null,
    image?: string | null,
    email?: string | null
  }
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const loggedIn = !!userData;

  return (
    <nav className="sticky top-0 z-50 w-full border-b-2">
      <div className="max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center justify-between h-16">
        {/* Logo */}
        <div className="shrink-0 flex flex-row space-x-2">
          <img className="h-8 w-8" src="/cookielogo.svg" alt="Logo" />
          <p className="font-semibold text-xl">Cookieless</p>
        </div>
        {/* Menu items and button */}
        <div className="flex-1 flex items-center justify-end">
          <div className="hidden md:flex space-x-4">
            <Link href="#home" className=" px-3 py-2 text-sm font-semibold">Home</Link>
            <Link href="#features" className="text-neutral-700 hover:text-dough-500 px-3 py-2 text-sm font-semibold">Features</Link>
            <Link href="#contact" className="text-neutral-700 hover:text-dough-500 px-3 py-2 text-sm font-semibold">Contact</Link>
            <div className='ml-4 space-x-2'>
              {loggedIn ? (
                <UserMenu name="Eamon G" email="ekeokigordon@icloud.com" />
              ) : (
                <>
                  <Link href="/login" className={cn(buttonVariants({ variant: "secondary" }), "rounded-full w-28")}>Log In</Link>
                  <Link href="/signup" className={cn(buttonVariants({ variant: "default" }), "rounded-full w-28")}>Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Mobile menu button */}
        <div className="absolute inset-y-0 right-0 flex items-center md:hidden">
          <Button
            type="button"
            variant="ghost"
            aria-controls="mobile-menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {/* Icon when menu is closed. */}
            <Menu className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`} />
            {/* Icon when menu is open. */}
            <X className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`} />
          </Button>
        </div>
      </div>
      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden absolute w-full`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link href="#home" className="text-neutral-700 hover:text-dough-500 block px-3 py-2 rounded-md text-base font-medium">Home</Link>
          <Link href="#features" className="text-neutral-700 hover:text-dough-500 block px-3 py-2 rounded-md text-base font-medium">Features</Link>
          <Link href="#contact" className="text-neutral-700 hover:text-dough-500 block px-3 py-2 rounded-md text-base font-medium">Contact</Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "secondary" }), "rounded-full w-28")}>Log In</Link>
          <Link href="/signup" className={cn(buttonVariants({ variant: "secondary" }), "rounded-full w-28")}>Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}