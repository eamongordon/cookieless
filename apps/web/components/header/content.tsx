"use client";

import React, { useState } from 'react';
import { Button, buttonVariants } from '../ui/button';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import UserMenu from './user-menu';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function HeaderComp({
  userData
}: {
  userData?: {
    name: string,
    image?: string | null,
    email: string,
  }
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const loggedIn = !!userData;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="shrink-0 flex flex-row space-x-2">
          <Image height={32} width={32} src="/cookielogo.svg" alt="Logo" />
          <p className="font-semibold text-xl">Cookieless</p>
        </Link>
        {/* Menu items and button */}
        <div className="flex-1 flex items-center justify-end">
          <div className="hidden md:flex space-x-4 justify-center items-center">
            <Link href="/docs" className="px-3 py-2 text-sm font-semibold">Docs</Link>
            <Link href="/pricing" className="text-neutral-700 hover:text-dough-500 px-3 py-2 text-sm font-semibold">Pricing</Link>
            <Link href="#contact" className="text-neutral-700 hover:text-dough-500 px-3 py-2 text-sm font-semibold">Contact</Link>
            <div className='ml-4 space-x-2'>
              {loggedIn ? (
                <UserMenu name={userData.name} email={userData.email} imageSrc={userData.image} />
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
          <Link href="/docs" className="text-neutral-700 hover:text-dough-500 block px-3 py-2 rounded-md text-base font-medium">Docs</Link>
          <Link href="/pricing" className="text-neutral-700 hover:text-dough-500 block px-3 py-2 rounded-md text-base font-medium">Pricing</Link>
          <Link href="#contact" className="text-neutral-700 hover:text-dough-500 block px-3 py-2 rounded-md text-base font-medium">Contact</Link>
          <Link href="/login" className={cn(buttonVariants({ variant: "secondary" }), "rounded-full w-28")}>Log In</Link>
          <Link href="/signup" className={cn(buttonVariants({ variant: "secondary" }), "rounded-full w-28")}>Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}