import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { FOIBranch, FOIStep, OutcomeType } from '../types';
import {
  parseDate,
  getDaysBetween,
  formatDate,
  getDelayColor,
  getStepTypeConfig,
  getOutcomeMetadata,
  PreparedBranch,
  PreparedStep,
} from '../utils/treeLayout';
import { AppleIcon } from './AppleIcon';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
  Info,
  Calendar,
  Clock,
  CheckCircle,
  Building2,
  TreeDeciduous,
  Sliders,
} from 'lucide-react';

interface FOITreeCanvasProps {
  branches: FOIBranch[];
  expandedBranches: Record<string, boolean>;
  onToggleExpand: (branchId: string) => void;
  onSelectStep: (branch: FOIBranch, step: FOIStep, stepIndex: number) => void;
  onSelectBranchOutcome: (branch: FOIBranch) => void;
  searchQuery: string;
  outcomeFilter: 'all' | 'open' | 'green' | 'red';
  timeScale: number; // pixels per week (e.g., 12 to 40)
  onChangeTimeScale: (scale: number) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export const FOITreeCanvas: React.FC<FOITreeCanvasProps> = ({
  branches,
  expandedBranches,
  onToggleExpand,
  onSelectStep,
  onSelectBranchOutcome,
  searchQuery,
  outcomeFilter,
  timeScale,
  onChangeTimeScale,
  onExpandAll,
  onCollapseAll,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 50, y: 30 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredStep, setHoveredStep] = useState<{
    branch: FOIBranch;
    step: FOIStep;
    index: number;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<{
    days: number;
    label: string;
    x: number;
    y: number;
  } | null>(null);

  // Filter matching check
  const isBranchVisible = useCallback((b: FOIBranch) => {
    if (outcomeFilter !== 'all') {
      if (outcomeFilter === 'open' && b.outcome !== null) return false;
      if (outcomeFilter === 'green' && b.outcome !== 'green') return false;
      if (outcomeFilter === 'red' && b.outcome !== 'red') return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const inTitle = b.title.toLowerCase().includes(q);
    const inRef = b.reference.toLowerCase().includes(q);
    const inAuth = b.authority.toLowerCase().includes(q);
    const inNote = (b.outcome_note || '').toLowerCase().includes(q);
    const inSteps = b.steps.some(
      (s) =>
        s.summary.toLowerCase().includes(q) ||
        s.from.toLowerCase().includes(q) ||
        s.to.toLowerCase().includes(q)
    );
    return inTitle || inRef || inAuth || inNote || inSteps;
  }, [outcomeFilter, searchQuery]);

  // Layout calculation
  const layout = useMemo(() => {
    const trunkX = 180;
    const branchSpacing = 110; // Vertical spacing per branch
    const totalVisibleBranches = branches.length;
    const totalHeight = Math.max(900, totalVisibleBranches * branchSpacing + 200);
    const trunkCenterY = totalHeight / 2;

    let maxX = 800;

    const preparedBranches: PreparedBranch[] = branches.map((branch, bIdx) => {
      const isExpanded = expandedBranches[branch.id] !== false; // Default expanded
      const isVisible = isBranchVisible(branch);

      // Y position fans out evenly from trunkCenter
      const targetY = 120 + bIdx * branchSpacing;
      const trunkAttachY = trunkCenterY + (targetY - trunkCenterY) * 0.45;

      const branchStartX = trunkX + 90;
      const branchStartY = targetY;

      const totalDays = branch.steps.length > 1
        ? getDaysBetween(branch.steps[0].date, branch.steps[branch.steps.length - 1].date)
        : 0;

      let currentX = branchStartX + 200; // room for branch title node
      let maxDelay = 0;

      const preparedSteps: PreparedStep[] = [];

      if (isExpanded && branch.steps.length > 0) {
        branch.steps.forEach((step, sIdx) => {
          let daysFromPrev = 0;
          if (sIdx > 0) {
            daysFromPrev = getDaysBetween(branch.steps[sIdx - 1].date, step.date);
          }
          if (daysFromPrev > maxDelay) maxDelay = daysFromPrev;

          const daysFromStart = getDaysBetween(branch.steps[0].date, step.date);

          // Scaled distance: minimum base 60px + timeScale proportional length
          const segmentPx = sIdx === 0 ? 0 : Math.max(55, Math.min(260, (daysFromPrev / 7) * timeScale));
          currentX += segmentPx;

          // Add a subtle organic sine wave y-displacement for realistic natural branch curvature
          const waveY = targetY + Math.sin(sIdx * 0.9) * 8;

          preparedSteps.push({
            ...step,
            stepIndex: sIdx,
            x: currentX,
            y: waveY,
            daysFromPrevious: daysFromPrev,
            daysFromStart,
          });
        });
      }

      // Outcome tip (Apple position)
      const appleX = isExpanded
        ? (preparedSteps.length > 0 ? currentX + 70 : branchStartX + 260)
        : branchStartX + 260;
      const appleY = targetY;

      if (appleX > maxX) maxX = appleX;

      return {
        ...branch,
        trunkX,
        trunkY: trunkAttachY,
        startX: branchStartX,
        startY: branchStartY,
        appleX,
        appleY,
        totalDays,
        maxDelay,
        preparedSteps,
        isExpanded,
      };
    });

    return {
      trunkX,
      trunkCenterY,
      branches: preparedBranches,
      totalWidth: Math.max(1400, maxX + 250),
      totalHeight,
    };
  }, [branches, expandedBranches, isBranchVisible, timeScale]);

  // Pan & Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only left click drags canvas
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.08;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let newZoom = e.deltaY < 0 ? zoom * zoomFactor : zoom / zoomFactor;
    newZoom = Math.max(0.35, Math.min(2.5, newZoom));

    // Zoom centered around mouse pointer
    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Touch handlers for mobile pan & pinch zoom
  const touchStartRef = useRef<{ dist: number; panX: number; panY: number; touchX: number; touchY: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        dist: 0,
        panX: pan.x,
        panY: pan.y,
        touchX: e.touches[0].clientX,
        touchY: e.touches[0].clientY,
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = {
        dist,
        panX: pan.x,
        panY: pan.y,
        touchX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        touchY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - touchStartRef.current.touchX;
      const dy = e.touches[0].clientY - touchStartRef.current.touchY;
      setPan({
        x: touchStartRef.current.panX + dx,
        y: touchStartRef.current.panY + dy,
      });
    } else if (e.touches.length === 2 && touchStartRef.current.dist > 0) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = currentDist / touchStartRef.current.dist;
      const newZoom = Math.max(0.35, Math.min(2.5, zoom * factor));
      setZoom(newZoom);
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
  };

  // Reset View
  const resetView = () => {
    setZoom(0.85);
    setPan({ x: 60, y: 40 });
  };

  // Fit to screen
  const fitToScreen = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const scaleX = rect.width / layout.totalWidth;
    const scaleY = rect.height / layout.totalHeight;
    const bestZoom = Math.max(0.4, Math.min(1.2, Math.min(scaleX, scaleY) * 0.92));
    setZoom(bestZoom);
    setPan({ x: 30, y: 20 });
  };

  return (
    <div
      ref={containerRef}
      id="foi-tree-viewport"
      className="relative w-full h-full min-h-[620px] overflow-hidden bg-zinc-950 select-none cursor-grab active:cursor-grabbing border border-zinc-800 rounded-2xl shadow-2xl"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Subtle Dark Radial Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `radial-gradient(#52525b 1px, transparent 1px)`,
          backgroundSize: `${32 * zoom}px ${32 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Main SVG & HTML Canvas World */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: layout.totalWidth,
          height: layout.totalHeight,
        }}
        className="relative transition-transform duration-75"
      >
        <svg
          width={layout.totalWidth}
          height={layout.totalHeight}
          className="absolute inset-0 pointer-events-auto"
        >
          <defs>
            {/* Trunk Wood Grain Gradient */}
            <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#271406" />
              <stop offset="35%" stopColor="#451a03" />
              <stop offset="70%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#271406" />
            </linearGradient>

            {/* Branch Connector Gradient */}
            <linearGradient id="branchGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#3f3f46" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#52525b" />
            </linearGradient>

            {/* Glow Filter for Delay Alerts */}
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Drop Shadow Filter */}
            <filter id="branchShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="1" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Central Tree Trunk Visualization */}
          <g id="central-tree-trunk">
            {/* Organic main vertical trunk curve */}
            <path
              d={`M ${layout.trunkX - 50} 80
                  C ${layout.trunkX - 10} ${layout.trunkCenterY * 0.5},
                    ${layout.trunkX + 10} ${layout.trunkCenterY * 1.2},
                    ${layout.trunkX - 30} ${layout.totalHeight - 80}`}
              stroke="url(#trunkGrad)"
              strokeWidth="30"
              strokeLinecap="round"
              fill="none"
              filter="url(#branchShadow)"
            />
            {/* Inner trunk grain line */}
            <path
              d={`M ${layout.trunkX - 48} 95
                  C ${layout.trunkX - 8} ${layout.trunkCenterY * 0.5},
                    ${layout.trunkX + 8} ${layout.trunkCenterY * 1.2},
                    ${layout.trunkX - 28} ${layout.totalHeight - 95}`}
              stroke="#b45309"
              strokeWidth="4"
              strokeDasharray="18 12"
              fill="none"
              opacity="0.7"
            />

            {/* Roots at base */}
            <path
              d={`M ${layout.trunkX - 30} ${layout.totalHeight - 80}
                  C ${layout.trunkX - 90} ${layout.totalHeight - 30},
                    ${layout.trunkX - 130} ${layout.totalHeight},
                    ${layout.trunkX - 160} ${layout.totalHeight + 10}`}
              stroke="#1c0e04"
              strokeWidth="18"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={`M ${layout.trunkX - 25} ${layout.totalHeight - 80}
                  C ${layout.trunkX + 40} ${layout.totalHeight - 30},
                    ${layout.trunkX + 80} ${layout.totalHeight - 10},
                    ${layout.trunkX + 110} ${layout.totalHeight}`}
              stroke="#2e1005"
              strokeWidth="14"
              strokeLinecap="round"
              fill="none"
            />
          </g>

          {/* Primary Branches & Segment Paths */}
          {layout.branches.map((b) => {
            const isVisible = isBranchVisible(b);
            const opacity = isVisible ? 1 : 0.15;

            // Curved path from trunk to branch head
            const cp1X = b.trunkX + (b.startX - b.trunkX) * 0.5;
            const cp1Y = b.trunkY;
            const cp2X = b.trunkX + (b.startX - b.trunkX) * 0.8;
            const cp2Y = b.startY;

            const trunkToBranchPath = `M ${b.trunkX} ${b.trunkY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${b.startX} ${b.startY}`;

            return (
              <g key={b.id} id={`branch-group-${b.id}`} opacity={opacity} className="transition-opacity duration-300">
                {/* Connector from central trunk */}
                <path
                  d={trunkToBranchPath}
                  stroke="url(#branchGrad)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  fill="none"
                  filter="url(#branchShadow)"
                />

                {/* Expanded Branch Flow */}
                {b.isExpanded && b.preparedSteps.length > 0 ? (
                  <>
                    {/* Segment lines between elbow joints with delay color encoding */}
                    {b.preparedSteps.map((step, sIdx) => {
                      const prevPt = sIdx === 0
                        ? { x: b.startX + 195, y: b.startY }
                        : { x: b.preparedSteps[sIdx - 1].x, y: b.preparedSteps[sIdx - 1].y };
                      const currPt = { x: step.x, y: step.y };

                      const daysBetween = step.daysFromPrevious ?? 0;
                      const delayConfig = getDelayColor(daysBetween);

                      // Smooth cubic curve between nodes
                      const midX = (prevPt.x + currPt.x) / 2;
                      const segmentPath = `M ${prevPt.x} ${prevPt.y} C ${midX} ${prevPt.y}, ${midX} ${currPt.y}, ${currPt.x} ${currPt.y}`;

                      return (
                        <g key={sIdx} id={`segment-${b.id}-${sIdx}`}>
                          {/* Outer highlight / glow for delays */}
                          {daysBetween > 20 && (
                            <path
                              d={segmentPath}
                              stroke={delayConfig.stroke}
                              strokeWidth="8"
                              strokeOpacity="0.35"
                              strokeLinecap="round"
                              fill="none"
                            />
                          )}

                          {/* Primary Segment Stroke */}
                          <path
                            d={segmentPath}
                            stroke={delayConfig.stroke}
                            strokeWidth="4"
                            strokeLinecap="round"
                            fill="none"
                            className="transition-all duration-200 hover:stroke-width-6 cursor-pointer"
                            onMouseEnter={() => {
                              setHoveredSegment({
                                days: daysBetween,
                                label: delayConfig.label,
                                x: midX,
                                y: (prevPt.y + currPt.y) / 2 - 14,
                              });
                            }}
                            onMouseLeave={() => setHoveredSegment(null)}
                          />

                          {/* Days indicator tag on segment if delay > 5 days */}
                          {daysBetween >= 5 && (
                            <g
                              transform={`translate(${midX}, ${(prevPt.y + currPt.y) / 2 - 10})`}
                              className="cursor-pointer"
                              onClick={() => onSelectStep(b, step, sIdx)}
                            >
                              <rect
                                x="-22"
                                y="-10"
                                width="44"
                                height="18"
                                rx="9"
                                fill="#09090b"
                                stroke={delayConfig.stroke}
                                strokeWidth="1.5"
                                className="shadow-lg"
                              />
                              <text
                                x="0"
                                y="3"
                                textAnchor="middle"
                                fontSize="9.5"
                                fontWeight="700"
                                fill={delayConfig.stroke}
                                fontFamily="system-ui, sans-serif"
                              >
                                +{daysBetween}d
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}

                    {/* Path from last step to Apple outcome tip */}
                    {b.preparedSteps.length > 0 && (
                      <path
                        d={`M ${b.preparedSteps[b.preparedSteps.length - 1].x} ${
                          b.preparedSteps[b.preparedSteps.length - 1].y
                        } Q ${b.preparedSteps[b.preparedSteps.length - 1].x + 25} ${b.appleY}, ${
                          b.appleX
                        } ${b.appleY}`}
                        stroke="#52525b"
                        strokeWidth="3.5"
                        strokeDasharray={b.outcome === null ? '4 3' : 'none'}
                        strokeLinecap="round"
                        fill="none"
                      />
                    )}
                  </>
                ) : (
                  // Collapsed stub connector
                  <path
                    d={`M ${b.startX + 190} ${b.startY} Q ${b.startX + 220} ${b.startY}, ${b.appleX} ${b.appleY}`}
                    stroke="#52525b"
                    strokeWidth="3.5"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    fill="none"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* HTML Interactive Layer for Cards, Elbow Joint Circles, and Apples */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Central Trunk Label Pill (Root) */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto shadow-2xl z-20"
            style={{ left: layout.trunkX, top: layout.trunkCenterY }}
          >
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-950 via-zinc-900 to-amber-950 text-amber-50 border-2 border-amber-500/60 shadow-2xl backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-amber-800/60 flex items-center justify-center border border-amber-500">
                <TreeDeciduous className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                  Central Timeline Origin
                </div>
                <h1 className="text-base font-black tracking-tight text-white">
                  FOI Evidence Pursuits
                </h1>
                <div className="text-xs text-zinc-300 font-medium">
                  {branches.length} Case Pursuits • Chronological Tree
                </div>
              </div>
            </div>
          </div>

          {/* Branch Primary Nodes & Steps */}
          {layout.branches.map((b) => {
            const isVisible = isBranchVisible(b);
            const opacityClass = isVisible ? 'opacity-100' : 'opacity-20';

            return (
              <React.Fragment key={b.id}>
                {/* Primary Branch Node Card */}
                <div
                  className={`absolute pointer-events-auto z-10 transition-all duration-200 ${opacityClass}`}
                  style={{
                    left: b.startX,
                    top: b.startY - 22,
                  }}
                >
                  <div
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-zinc-900/95 border border-zinc-800 shadow-xl hover:border-amber-500/70 hover:shadow-2xl transition-all cursor-pointer group"
                    onClick={() => onToggleExpand(b.id)}
                    title="Click to expand/collapse branch"
                  >
                    {/* Expand/Collapse Chevron Button */}
                    <button
                      className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 group-hover:bg-amber-500 group-hover:text-zinc-950 flex items-center justify-center transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleExpand(b.id);
                      }}
                    >
                      {b.isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="max-w-[155px]">
                      <div className="text-[10px] font-mono font-bold text-amber-400 truncate">
                        {b.reference}
                      </div>
                      <div className="text-xs font-bold text-zinc-100 leading-tight truncate" title={b.title}>
                        {b.title.split('–')[0].split('-')[0].trim()}
                      </div>
                    </div>

                    {/* Step count badge */}
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {b.steps.length}
                    </span>
                  </div>
                </div>

                {/* Elbow Joints (Step Nodes) when expanded */}
                {b.isExpanded &&
                  b.preparedSteps.map((step, sIdx) => {
                    const typeConfig = getStepTypeConfig(step.type);
                    const isHovered = hoveredStep?.branch.id === b.id && hoveredStep?.index === sIdx;

                    return (
                      <div
                        key={sIdx}
                        id={`joint-${b.id}-${sIdx}`}
                        className={`absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer ${opacityClass}`}
                        style={{
                          left: step.x,
                          top: step.y,
                        }}
                        onClick={() => onSelectStep(b, step, sIdx)}
                        onMouseEnter={() =>
                          setHoveredStep({
                            branch: b,
                            step,
                            index: sIdx,
                            x: step.x,
                            y: step.y,
                          })
                        }
                        onMouseLeave={() => setHoveredStep(null)}
                      >
                        {/* Interactive Elbow Joint Node */}
                        <div
                          className={`w-6 h-6 rounded-full border-2 border-zinc-950 shadow-md flex items-center justify-center transition-all duration-200 hover:scale-135 hover:shadow-lg ${
                            isHovered ? 'scale-140 ring-3 ring-amber-400' : ''
                          }`}
                          style={{ backgroundColor: typeConfig.borderColor }}
                        >
                          <div className="w-2 h-2 rounded-full bg-zinc-950" />
                        </div>

                        {/* Step Type Mini Tag Beneath Node */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none mt-1">
                          <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-900/90 px-1.5 py-0.2 rounded border border-zinc-800 shadow-sm">
                            {formatDate(step.date).split(' ')[0]} {formatDate(step.date).split(' ')[1]}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                {/* Collapsed Hidden Steps Badge */}
                {!b.isExpanded && (
                  <div
                    className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
                    style={{ left: b.startX + 235, top: b.startY }}
                    onClick={() => onToggleExpand(b.id)}
                  >
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 hover:bg-amber-500 hover:text-zinc-950 border border-zinc-700 shadow-md transition-colors">
                      +{b.steps.length} hidden steps
                    </span>
                  </div>
                )}

                {/* Tip Outcome Apple / Open Blossom */}
                <div
                  className={`absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer ${opacityClass}`}
                  style={{
                    left: b.appleX,
                    top: b.appleY,
                  }}
                  onClick={() => onSelectBranchOutcome(b)}
                >
                  <AppleIcon
                    outcome={b.outcome}
                    size={42}
                    showTooltip={true}
                    tooltipText={
                      b.outcome === 'green'
                        ? '🍏 Evidence Obtained & Verified (Click dossier)'
                        : b.outcome === 'red'
                        ? '🍎 Evidence Destroyed / Not Held (Click dossier)'
                        : '🔵 Pursuit Open / In Progress (Click dossier)'
                    }
                    pulsing={b.outcome === null}
                  />
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Hovered Elbow Joint Floating Micro-Card */}
        {hoveredStep && (
          <div
            className="absolute pointer-events-none z-40 bg-zinc-900/95 backdrop-blur-md rounded-xl p-3 shadow-2xl border border-zinc-700 text-xs w-64 animate-in fade-in zoom-in-95 duration-150 text-zinc-200"
            style={{
              left: hoveredStep.x + 16,
              top: hoveredStep.y - 45,
            }}
          >
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-bold text-white">
                {formatDate(hoveredStep.step.date)}
              </span>
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                  getStepTypeConfig(hoveredStep.step.type).bgClass
                }`}
              >
                {getStepTypeConfig(hoveredStep.step.type).label}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 mb-1 truncate">
              From: {hoveredStep.step.from.split('<')[0]}
            </div>
            <div className="text-zinc-300 line-clamp-2 leading-relaxed text-[11px] bg-zinc-950 p-1.5 rounded border border-zinc-800">
              {hoveredStep.step.summary}
            </div>
            <div className="text-[10px] text-amber-400 font-semibold mt-1.5 flex items-center justify-between">
              <span>Click for correspondence modal</span>
              {hoveredStep.index > 0 && (
                <span className="text-zinc-400">
                  +{hoveredStep.step.daysFromPrevious}d wait
                </span>
              )}
            </div>
          </div>
        )}

        {/* Hovered Segment Delay Tooltip */}
        {hoveredSegment && (
          <div
            className="absolute pointer-events-none z-40 bg-zinc-950/95 text-white backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs shadow-2xl border border-zinc-700 font-medium animate-in fade-in duration-100"
            style={{
              left: hoveredSegment.x - 40,
              top: hoveredSegment.y - 25,
            }}
          >
            ⏱️ {hoveredSegment.days} days elapsed ({hoveredSegment.label})
          </div>
        )}
      </div>

      {/* Floating Canvas Action Controls */}
      <div
        id="tree-floating-controls"
        className="absolute bottom-5 left-5 z-30 flex items-center gap-1.5 p-1.5 bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-800"
      >
        <button
          onClick={() => setZoom((z) => Math.min(2.2, z + 0.15))}
          className="p-2 rounded-xl text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => setZoom((z) => Math.max(0.35, z - 0.15))}
          className="p-2 rounded-xl text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <span className="text-xs font-mono font-bold text-zinc-400 px-1">
          {Math.round(zoom * 100)}%
        </span>

        <div className="w-px h-5 bg-zinc-800 mx-0.5" />

        <button
          onClick={resetView}
          className="p-2 rounded-xl text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={fitToScreen}
          className="p-2 rounded-xl text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors"
          title="Fit to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-zinc-800 mx-0.5" />

        <button
          onClick={onExpandAll}
          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
          title="Expand All Branches"
        >
          Expand All
        </button>

        <button
          onClick={onCollapseAll}
          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-300 hover:bg-zinc-800 transition-colors"
          title="Collapse All Branches"
        >
          Collapse
        </button>
      </div>

      {/* Time-Scale Proportional Slider Controls (Bottom Center) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 hidden sm:flex items-center gap-3 px-4 py-2 bg-zinc-900/90 backdrop-blur-md rounded-2xl shadow-xl border border-zinc-800 text-xs">
        <Clock className="w-4 h-4 text-amber-400" />
        <span className="font-semibold text-zinc-300 whitespace-nowrap">
          Time Scale:
        </span>
        <input
          type="range"
          min="10"
          max="45"
          value={timeScale}
          onChange={(e) => onChangeTimeScale(Number(e.target.value))}
          className="w-24 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          title="Adjust distance between communications based on elapsed weeks"
        />
        <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">
          1 wk ≈ {timeScale}px
        </span>
      </div>

      {/* MiniMap in Bottom-Right Corner */}
      <div
        id="tree-minimap"
        className="absolute bottom-5 right-5 z-30 hidden md:block w-48 h-32 bg-zinc-950/90 backdrop-blur-md rounded-xl shadow-xl border border-zinc-800 overflow-hidden"
      >
        <div className="relative w-full h-full p-2 bg-zinc-950/50">
          <div className="text-[9px] font-bold text-zinc-500 uppercase mb-1">
            Minimap Navigation
          </div>

          {/* Scaled-down branches preview */}
          <svg className="w-full h-20 overflow-visible" viewBox={`0 0 ${layout.totalWidth} ${layout.totalHeight}`}>
            {/* Trunk */}
            <line
              x1={layout.trunkX}
              y1="50"
              x2={layout.trunkX}
              y2={layout.totalHeight - 50}
              stroke="#78350f"
              strokeWidth="30"
            />
            {/* Branches */}
            {layout.branches.map((b) => (
              <g key={b.id}>
                <line
                  x1={b.trunkX}
                  y1={b.trunkY}
                  x2={b.appleX}
                  y2={b.appleY}
                  stroke={b.outcome === 'green' ? '#10b981' : b.outcome === 'red' ? '#f43f5e' : '#38bdf8'}
                  strokeWidth="12"
                />
                <circle
                  cx={b.appleX}
                  cy={b.appleY}
                  r="24"
                  fill={b.outcome === 'green' ? '#10b981' : b.outcome === 'red' ? '#f43f5e' : '#38bdf8'}
                />
              </g>
            ))}
          </svg>

          {/* Viewport Indicator Rectangle */}
          <div
            className="absolute border-2 border-amber-500 bg-amber-500/15 pointer-events-none rounded"
            style={{
              left: `${Math.max(0, Math.min(80, (-pan.x / layout.totalWidth) * 100))}%`,
              top: `${Math.max(0, Math.min(80, (-pan.y / layout.totalHeight) * 100))}%`,
              width: `${Math.min(100, (800 / (layout.totalWidth * zoom)) * 100)}%`,
              height: `${Math.min(100, (500 / (layout.totalHeight * zoom)) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
