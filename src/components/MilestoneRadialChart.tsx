import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface MilestoneRadialChartProps {
  completedCount: number;
  totalCount: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const MilestoneRadialChart: React.FC<MilestoneRadialChartProps> = React.memo(({
  completedCount,
  totalCount,
  size = 180,
  strokeWidth = 14,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<'completed' | 'pending' | null>(null);
  const [displayPct, setDisplayPct] = useState(0);

  const safeTotal = Math.max(1, totalCount);
  const safeCompleted = Math.min(safeTotal, Math.max(0, completedCount));
  const pendingCount = Math.max(0, safeTotal - safeCompleted);
  const targetPct = Math.round((safeCompleted / safeTotal) * 100);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 200;
    const height = 200;
    const center = width / 2;
    const outerRadius = 82;
    const innerRadius = outerRadius - strokeWidth;
    const padAngle = safeTotal > 1 && safeCompleted > 0 && pendingCount > 0 ? 0.04 : 0;

    // Defs for gradients and glow filters
    const defs = svg.append('defs');

    // Gradient for Completed Arc (Cyan -> Emerald -> Gold)
    const completedGradient = defs.append('linearGradient')
      .attr('id', 'completedArcGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    completedGradient.append('stop').attr('offset', '0%').attr('stop-color', '#00F5D4');
    completedGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10B981');

    // Gradient for Pending Arc (Coral -> Amber -> Violet)
    const pendingGradient = defs.append('linearGradient')
      .attr('id', 'pendingArcGrad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');
    pendingGradient.append('stop').attr('offset', '0%').attr('stop-color', '#FF5E3A');
    pendingGradient.append('stop').attr('offset', '100%').attr('stop-color', '#FFD200');

    // Drop-shadow / Glow filter
    const filter = defs.append('filter')
      .attr('id', 'radialGlow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3')
      .attr('result', 'blur');
    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    const g = svg.append('g')
      .attr('transform', `translate(${center}, ${center})`);

    // 1. Background full circle track
    const trackArc = d3.arc<d3.DefaultArcObject>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(0)
      .endAngle(2 * Math.PI);

    g.append('path')
      .attr('d', trackArc({
        innerRadius,
        outerRadius,
        startAngle: 0,
        endAngle: 2 * Math.PI
      }) || '')
      .attr('fill', 'rgba(255, 255, 255, 0.07)')
      .attr('stroke', 'rgba(255, 255, 255, 0.05)')
      .attr('stroke-width', 1);

    // Minor decorative tick marks around track
    const ticksCount = 20;
    const tickGroup = g.append('g').attr('class', 'ticks');
    for (let i = 0; i < ticksCount; i++) {
      const angle = (i / ticksCount) * 2 * Math.PI;
      const x1 = Math.cos(angle - Math.PI / 2) * (outerRadius + 3);
      const y1 = Math.sin(angle - Math.PI / 2) * (outerRadius + 3);
      const x2 = Math.cos(angle - Math.PI / 2) * (outerRadius + 6);
      const y2 = Math.sin(angle - Math.PI / 2) * (outerRadius + 6);

      tickGroup.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', 'rgba(255, 255, 255, 0.15)')
        .attr('stroke-width', 1);
    }

    const completedRatio = safeCompleted / safeTotal;
    const completedEndAngle = completedRatio * 2 * Math.PI;

    // Arc Generator
    const arcGen = d3.arc<d3.DefaultArcObject>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(5)
      .padAngle(padAngle);

    // 2. Completed Arc with smooth entry animation
    if (safeCompleted > 0) {
      const completedPath = g.append('path')
        .attr('class', 'completed-arc')
        .attr('fill', 'url(#completedArcGrad)')
        .style('cursor', 'pointer')
        .style('filter', 'drop-shadow(0 0 6px rgba(0, 245, 212, 0.4))')
        .on('mouseenter', () => setHoveredSegment('completed'))
        .on('mouseleave', () => setHoveredSegment(null));

      completedPath.transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attrTween('d', () => {
          const interpolate = d3.interpolate(0, completedEndAngle);
          return (t: number) => {
            return arcGen({
              innerRadius,
              outerRadius,
              startAngle: 0,
              endAngle: interpolate(t)
            }) || '';
          };
        });
    }

    // 3. Pending Arc with smooth entry animation
    if (pendingCount > 0) {
      const pendingStartAngle = safeCompleted > 0 ? completedEndAngle : 0;
      const pendingPath = g.append('path')
        .attr('class', 'pending-arc')
        .attr('fill', 'url(#pendingArcGrad)')
        .style('cursor', 'pointer')
        .style('opacity', 0.85)
        .on('mouseenter', () => setHoveredSegment('pending'))
        .on('mouseleave', () => setHoveredSegment(null));

      pendingPath.transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attrTween('d', () => {
          const interpolate = d3.interpolate(pendingStartAngle, 2 * Math.PI);
          return (t: number) => {
            return arcGen({
              innerRadius,
              outerRadius,
              startAngle: pendingStartAngle,
              endAngle: interpolate(t)
            }) || '';
          };
        });
    }

    // Smooth counter animation for center percentage
    const startVal = 0;
    const startTime = performance.now();
    const duration = 1200;
    let rafId: number | null = null;

    const animateCounter = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayPct(Math.round(startVal + (targetPct - startVal) * eased));

      if (progress < 1) {
        rafId = requestAnimationFrame(animateCounter);
      }
    };

    rafId = requestAnimationFrame(animateCounter);

    // Resource & Memory Optimization: Cancel pending animation frames and D3 transitions
    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('*').interrupt();
      }
    };
  }, [safeCompleted, safeTotal, targetPct, pendingCount, strokeWidth]);

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* SVG Container */}
      <div className="relative flex items-center justify-center">
        <svg
          ref={svgRef}
          viewBox="0 0 200 200"
          width={size}
          height={size}
          className="overflow-visible"
          role="img"
          aria-label={`Milestone execution progress gauge: ${safeCompleted} of ${safeTotal} milestones completed, ${targetPct} percent`}
        />

        {/* Center Readout HUD */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {hoveredSegment === 'completed' ? (
            <div className="animate-in fade-in duration-150">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
                Done
              </span>
              <span className="text-2xl font-black text-white">
                {safeCompleted}
              </span>
              <span className="text-[10px] text-emerald-300 font-semibold block">
                {targetPct}% achieved
              </span>
            </div>
          ) : hoveredSegment === 'pending' ? (
            <div className="animate-in fade-in duration-150">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 block">
                Pending
              </span>
              <span className="text-2xl font-black text-white">
                {pendingCount}
              </span>
              <span className="text-[10px] text-amber-300 font-semibold block">
                {100 - targetPct}% remaining
              </span>
            </div>
          ) : (
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">
                Execution
              </span>
              <span className="text-2xl font-black tracking-tight text-white font-mono">
                {displayPct}%
              </span>
              <span className="text-[10px] text-teal-300 font-bold block">
                {safeCompleted}/{safeTotal} Done
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Radial Interactive Legend with full keyboard accessibility */}
      <div className="flex items-center gap-4 mt-2 text-xs" role="group" aria-label="Milestone breakdown legend">
        <button
          type="button"
          onClick={() => setHoveredSegment(prev => prev === 'completed' ? null : 'completed')}
          onMouseEnter={() => setHoveredSegment('completed')}
          onMouseLeave={() => setHoveredSegment(null)}
          onFocus={() => setHoveredSegment('completed')}
          onBlur={() => setHoveredSegment(null)}
          aria-pressed={hoveredSegment === 'completed'}
          className={`flex items-center gap-1.5 transition-all cursor-pointer rounded-lg px-2 py-1 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-hidden ${
            hoveredSegment === 'completed' ? 'scale-105 opacity-100 bg-white/10' : 'opacity-85 hover:opacity-100'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#00F5D4] to-[#10B981] shadow-xs" aria-hidden="true" />
          <span className="text-slate-300 text-[11px] font-medium">
            Completed <strong className="text-white font-bold">({safeCompleted})</strong>
          </span>
        </button>

        <button
          type="button"
          onClick={() => setHoveredSegment(prev => prev === 'pending' ? null : 'pending')}
          onMouseEnter={() => setHoveredSegment('pending')}
          onMouseLeave={() => setHoveredSegment(null)}
          onFocus={() => setHoveredSegment('pending')}
          onBlur={() => setHoveredSegment(null)}
          aria-pressed={hoveredSegment === 'pending'}
          className={`flex items-center gap-1.5 transition-all cursor-pointer rounded-lg px-2 py-1 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-hidden ${
            hoveredSegment === 'pending' ? 'scale-105 opacity-100 bg-white/10' : 'opacity-85 hover:opacity-100'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#FF5E3A] to-[#FFD200] shadow-xs" aria-hidden="true" />
          <span className="text-slate-300 text-[11px] font-medium">
            Pending <strong className="text-white font-bold">({pendingCount})</strong>
          </span>
        </button>
      </div>
    </div>
  );
});

MilestoneRadialChart.displayName = 'MilestoneRadialChart';
