import { useEffect, useMemo, useRef, useState } from 'react';

type Point = {
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function midpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

function buildSmoothPath(points: Point[]) {
  if (points.length < 2) {
    return '';
  }

  const start = midpoint(points[0], points[1]);
  let path = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`;

  for (let index = 1; index < points.length; index += 1) {
    const next = points[(index + 1) % points.length];
    const mid = midpoint(points[index], next);
    path += ` Q ${points[index].x.toFixed(2)} ${points[index].y.toFixed(2)} ${mid.x.toFixed(2)} ${mid.y.toFixed(2)}`;
  }

  path += ` Q ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)} ${start.x.toFixed(2)} ${start.y.toFixed(2)} Z`;
  return path;
}

function wave(t: number, phase: number, amplitude: number, freqA: number, freqB: number) {
  return (
    Math.sin((t * Math.PI * 2 * freqA) + phase) * amplitude * 0.72 +
    Math.sin((t * Math.PI * 2 * freqB) - (phase * 0.85)) * amplitude * 0.28
  );
}

function buildFramePath(width: number, height: number, phase: number, inset: number, amplitude: number) {
  const left = inset;
  const right = width - inset;
  const top = inset;
  const bottom = height - inset;
  const horizontalSteps = 18;
  const verticalSteps = 14;
  const points: Point[] = [];

  for (let index = 0; index <= horizontalSteps; index += 1) {
    const t = index / horizontalSteps;
    points.push({
      x: left + ((right - left) * t),
      y: top + wave(t, phase, amplitude, 1.5, 4.5),
    });
  }

  for (let index = 1; index <= verticalSteps; index += 1) {
    const t = index / verticalSteps;
    points.push({
      x: right + wave(t, phase + 0.9, amplitude * 0.95, 1.8, 4.2),
      y: top + ((bottom - top) * t),
    });
  }

  for (let index = 1; index <= horizontalSteps; index += 1) {
    const t = index / horizontalSteps;
    points.push({
      x: right - ((right - left) * t),
      y: bottom + wave(t, phase + 1.8, amplitude * 1.1, 1.4, 4.8),
    });
  }

  for (let index = 1; index < verticalSteps; index += 1) {
    const t = index / verticalSteps;
    points.push({
      x: left + wave(t, phase + 2.7, amplitude, 1.7, 4.1),
      y: bottom - ((bottom - top) * t),
    });
  }

  return buildSmoothPath(points);
}

function OrganicFrameBorder() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1200, height: 900 });
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize({
        width: Math.max(320, rect.width),
        height: Math.max(320, rect.height),
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    window.addEventListener('resize', updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  useEffect(() => {
    let frameId = 0;

    const tick = () => {
      setPhase((performance.now() / 2400) % (Math.PI * 2));
      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const outerPath = useMemo(() => {
    const inset = clamp(Math.min(size.width, size.height) * 0.032, 18, 34);
    const amplitude = clamp(Math.min(size.width, size.height) * 0.016, 7, 16);
    return buildFramePath(size.width, size.height, phase, inset, amplitude);
  }, [phase, size.height, size.width]);

  const innerPath = useMemo(() => {
    const inset = clamp(Math.min(size.width, size.height) * 0.05, 28, 46);
    const amplitude = clamp(Math.min(size.width, size.height) * 0.01, 4, 10);
    return buildFramePath(size.width, size.height, phase + 0.55, inset, amplitude);
  }, [phase, size.height, size.width]);

  return (
    <div ref={ref} className="page-frame-border" aria-hidden="true">
      <svg className="page-frame-svg" viewBox={`0 0 ${size.width} ${size.height}`} preserveAspectRatio="none">
        <path
          d={`M 0 0 H ${size.width} V ${size.height} H 0 Z ${outerPath}`}
          fillRule="evenodd"
          className="page-frame-mask"
        />
        <path d={outerPath} className="page-frame-path page-frame-path-underlay" />
        <path d={outerPath} className="page-frame-path page-frame-path-outer" />
        <path d={innerPath} className="page-frame-path page-frame-path-inner" />
      </svg>
    </div>
  );
}

export default function OrganicPageFrame({ children }: { children: React.ReactNode }) {
  return (
    <section className="page-frame-shell">
      <div className="site-atmosphere" />
      <OrganicFrameBorder />
      <div className="page-frame-surface">
        {children}
      </div>
    </section>
  );
}