"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Shield, User, Lock, LayoutDashboard, MessageSquare } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">CyberTools Hub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/tools/port-scan" className="text-gray-700 hover:text-primary transition-colors">
              Port Scan
            </Link>
            <Link href="/tools/dns-lookup" className="text-gray-700 hover:text-primary transition-colors">
              DNS Lookup
            </Link>
            <Link href="/tools/whois" className="text-gray-700 hover:text-primary transition-colors">
              WHOIS
            </Link>
            <Link href="/tools/ping" className="text-gray-700 hover:text-primary transition-colors">
              Ping
            </Link>
            <Link href="/tools/geo-ip" className="text-gray-700 hover:text-primary transition-colors">
              GeoIP
            </Link>
            <Link href="/tools/ssl-check" className="text-gray-700 hover:text-primary transition-colors">
              SSL Check
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary transition-colors">
              Contact
            </Link>
            <Link href="/security-analysis" className="text-gray-700 hover:text-primary transition-colors">
              Security Analysis
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                <Link href="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <button className="text-gray-700 hover:text-primary transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex items-center space-x-1 text-gray-700 hover:text-primary transition-colors">
                  <Lock className="h-4 w-4" />
                  <span>Login</span>
                </Link>
                <Link href="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/tools/port-scan"
              className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Port Scan
            </Link>
            <Link
              href="/tools/dns-lookup"
              className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              DNS Lookup
            </Link>
            <Link
              href="/tools/whois"
              className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              WHOIS
            </Link>
            <Link
              href="/tools/ping"
              className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Ping
            </Link>
            <Link
              href="/tools/geo-ip"
              className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              GeoIP
            </Link>
            <Link
              href="/tools/ssl-check"
              className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              SSL Check
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/security-analysis"
              className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Security Analysis
            </Link>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              {isLoggedIn ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                      onClick={() => setIsOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile
                  </Link>
                  <button className="block w-full text-left px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
