"use client";

import React from "react";

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function AuthLayout({
  title = "Log in to your Account",
  subtitle = "Welcome back! Select method to log in:",
  children,
}: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-6">
      <div className="w-full max-w-6xl bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        {/* Left: form area */}

        <div className="space-y-4">{children}</div>

        {/* Right: illustration area */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-500 text-white p-10">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="bg-white/10 rounded-full p-6 mb-6">
              {/* simple illustrative SVG */}
              <svg
                width="160"
                height="120"
                viewBox="0 0 160 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
              >
                <rect
                  x="6"
                  y="10"
                  width="100"
                  height="70"
                  rx="8"
                  fill="white"
                  opacity="0.12"
                />
                <circle cx="130" cy="30" r="14" fill="#fff" opacity="0.16" />
                <circle cx="130" cy="64" r="10" fill="#fff" opacity="0.12" />
                <path
                  d="M40 40H120"
                  stroke="white"
                  strokeOpacity="0.16"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M40 56H90"
                  stroke="white"
                  strokeOpacity="0.12"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold">
              Connect with every application.
            </h3>
            <p className="text-sm text-white/90 mt-2 max-w-xs text-center">
              Everything you need in an easily customizable dashboard.
            </p>

            <div className="flex items-center gap-2 mt-6">
              <span className="h-2 w-2 rounded-full bg-white/80" />
              <span className="h-2 w-2 rounded-full bg-white/40" />
              <span className="h-2 w-2 rounded-full bg-white/40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
