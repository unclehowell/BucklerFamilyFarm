import React from 'react';
import { OutcomeType } from '../types';

interface AppleIconProps {
  outcome: OutcomeType;
  size?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  showTooltip?: boolean;
  tooltipText?: string;
  interactive?: boolean;
  pulsing?: boolean;
}

export const AppleIcon: React.FC<AppleIconProps> = ({
  outcome,
  size = 36,
  className = '',
  onClick,
  showTooltip = false,
  tooltipText,
  interactive = true,
  pulsing = false,
}) => {
  const isGreen = outcome === 'green';
  const isRed = outcome === 'red';
  const isOpen = outcome === null;

  if (isOpen) {
    // Open branch tip: A delicate natural bud / sprouting leaf tip
    return (
      <div
        className={`relative inline-flex items-center justify-center group ${
          interactive ? 'cursor-pointer' : ''
        } ${className}`}
        onClick={onClick}
        title={tooltipText || 'Open Pursuit – Outcome in progress'}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm transition-transform duration-200 group-hover:scale-115"
        >
          {/* Branch node terminus */}
          <circle
            cx="20"
            cy="20"
            r="11"
            fill="#f8fafc"
            stroke="#0284c7"
            strokeWidth="2.5"
            strokeDasharray="3 2"
          />
          <circle
            cx="20"
            cy="20"
            r="5"
            fill="#38bdf8"
            className={pulsing ? 'animate-pulse' : ''}
          />
          {/* Gentle sprout stem */}
          <path
            d="M20 9C20 9 22 5 26 6C26 9 23 12 20 12"
            fill="#10b981"
            opacity="0.85"
          />
        </svg>

        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex items-center whitespace-nowrap bg-slate-900/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md shadow-lg z-50 pointer-events-none border border-slate-700">
            {tooltipText || 'Outcome In Progress (Open Thread)'}
          </div>
        )}
      </div>
    );
  }

  // Realistic tangible glossy apple with 3D gradients, specular sheen, realistic curved stem, and leaf
  const gradientId = isGreen ? 'greenAppleGrad' : 'redAppleGrad';
  const specularId = isGreen ? 'greenAppleSpec' : 'redAppleSpec';

  return (
    <div
      className={`relative inline-flex items-center justify-center group ${
        interactive ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
      title={
        tooltipText ||
        (isGreen
          ? 'Evidence Obtained & Verified'
          : 'Evidence Destroyed / Missing')
      }
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 54 54"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-md transition-all duration-200 group-hover:scale-120 group-hover:drop-shadow-lg"
      >
        <defs>
          {/* Green Apple 3D Spherical Volume */}
          <radialGradient
            id="greenAppleGrad"
            cx="35%"
            cy="35%"
            r="65%"
            fx="30%"
            fy="30%"
          >
            <stop offset="0%" stopColor="#bbf7d0" />
            <stop offset="25%" stopColor="#4ade80" />
            <stop offset="60%" stopColor="#16a34a" />
            <stop offset="85%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#14532d" />
          </radialGradient>

          {/* Red Apple 3D Spherical Volume */}
          <radialGradient
            id="redAppleGrad"
            cx="35%"
            cy="35%"
            r="65%"
            fx="30%"
            fy="30%"
          >
            <stop offset="0%" stopColor="#fecdd3" />
            <stop offset="22%" stopColor="#fb7185" />
            <stop offset="55%" stopColor="#e11d48" />
            <stop offset="80%" stopColor="#be123c" />
            <stop offset="100%" stopColor="#881337" />
          </radialGradient>

          {/* Glossy Top Specular Highlight */}
          <linearGradient id="specularGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Leaf gradient */}
          <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#15803d" />
          </linearGradient>

          {/* Stem gradient */}
          <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a16207" />
            <stop offset="100%" stopColor="#713f12" />
          </linearGradient>
        </defs>

        {/* Ambient shadow beneath the apple */}
        <ellipse
          cx="27"
          cy="48"
          rx="15"
          ry="3.5"
          fill="#0f172a"
          opacity="0.22"
        />

        {/* Apple Stem */}
        <path
          d="M27 18C26.5 12 28 8 33 4C32.2 4.6 30 7 29.5 12C29.2 14.5 28.5 17 28.5 18"
          stroke="url(#stemGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Glossy Green Leaf */}
        <path
          d="M29 9C34 7 41 8 43 14C38 16 31 14 29 9Z"
          fill="url(#leafGrad)"
          stroke="#166534"
          strokeWidth="0.75"
        />
        {/* Leaf vein */}
        <path
          d="M29 9C34 11 38 12.5 43 14"
          stroke="#bbf7d0"
          strokeWidth="0.6"
          strokeLinecap="round"
          opacity="0.8"
        />

        {/* Apple Body (Distinctive double-lobed top & bottom indentation) */}
        <path
          d="M27 19C24 16.5 17 16.5 13 21C8 26.5 8 36 12 42C15.5 47 22 47.5 27 45.5C32 47.5 38.5 47 42 42C46 36 46 26.5 41 21C37 16.5 30 16.5 27 19Z"
          fill={`url(#${gradientId})`}
          stroke={isGreen ? '#14532d' : '#881337'}
          strokeWidth="0.8"
        />

        {/* Primary Gloss Specular Reflection (Upper Left Crescent) */}
        <path
          d="M17 21C22 18.5 26 19 26 21C26 23 20 25 15.5 29C13 31.5 12.5 35 12 36C11 32 11.5 26 17 21Z"
          fill="url(#specularGlow)"
          opacity="0.75"
        />

        {/* Secondary Glint / Star Reflection */}
        <ellipse
          cx="20"
          cy="23"
          rx="3.5"
          ry="2"
          transform="rotate(-25 20 23)"
          fill="#ffffff"
          opacity="0.9"
        />

        {/* Bottom Rim Reflection / Ambient Bounce */}
        <path
          d="M16 41C21 44.5 33 44.5 38 41"
          stroke="#ffffff"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity={isGreen ? 0.35 : 0.3}
        />
      </svg>

      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex items-center whitespace-nowrap bg-slate-900/90 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-md shadow-lg z-50 pointer-events-none border border-slate-700">
          <span className="font-semibold mr-1.5">
            {isGreen ? '🍏 Verified Obtained' : '🍎 Missing / Destroyed'}
          </span>
          <span className="text-slate-300">Click for dossier</span>
        </div>
      )}
    </div>
  );
};
