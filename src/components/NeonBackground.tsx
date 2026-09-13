import React, { useEffect, useRef } from 'react';

interface NeonBackgroundProps {
  theme?: 'cyber' | 'synthwave' | 'matrix' | 'solar';
  enabled?: boolean;
  reducedMotion?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  glow: number;
}

export const NeonBackground: React.FC<NeonBackgroundProps> = ({
  theme = 'cyber',
  enabled = true,
  reducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Color palettes based on theme
    const themeColors: Record<string, { primary: string; secondary: string; glow: string; grid: string }> = {
      cyber: {
        primary: 'rgba(6, 182, 212, 0.7)', // Cyan
        secondary: 'rgba(168, 85, 247, 0.7)', // Purple
        glow: '#06b6d4',
        grid: 'rgba(6, 182, 212, 0.15)',
      },
      synthwave: {
        primary: 'rgba(236, 72, 153, 0.7)', // Hot pink
        secondary: 'rgba(147, 51, 234, 0.7)', // Violet
        glow: '#ec4899',
        grid: 'rgba(236, 72, 153, 0.18)',
      },
      matrix: {
        primary: 'rgba(34, 197, 94, 0.7)', // Green
        secondary: 'rgba(16, 185, 129, 0.7)', // Emerald
        glow: '#22c55e',
        grid: 'rgba(34, 197, 94, 0.15)',
      },
      solar: {
        primary: 'rgba(245, 158, 11, 0.7)', // Amber
        secondary: 'rgba(239, 68, 68, 0.7)', // Crimson
        glow: '#f59e0b',
        grid: 'rgba(245, 158, 11, 0.15)',
      },
    };

    const currentTheme = themeColors[theme] || themeColors.cyber;

    // Initialize floating glowing particles
    const particleCount = reducedMotion ? 20 : 50;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (reducedMotion ? 0.2 : 0.6),
        vy: (Math.random() - 0.5) * (reducedMotion ? 0.2 : 0.6),
        size: Math.random() * 2.5 + 1,
        color: Math.random() > 0.5 ? currentTheme.primary : currentTheme.secondary,
        alpha: Math.random() * 0.7 + 0.3,
        glow: Math.random() * 10 + 5,
      });
    }

    let gridOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep radial cosmic glow background
      const grad = ctx.createRadialGradient(
        width * 0.5,
        height * 0.45,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      grad.addColorStop(0, '#090d1a');
      grad.addColorStop(0.5, '#040711');
      grad.addColorStop(1, '#02040a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Perspective Grid Floor at bottom
      const horizonY = height * 0.58;
      ctx.save();
      ctx.strokeStyle = currentTheme.grid;
      ctx.lineWidth = 1;

      // Moving horizontal perspective lines
      const totalH = height - horizonY;
      const hLines = 14;
      if (!reducedMotion) {
        gridOffset = (gridOffset + 0.3) % 30;
      }

      for (let i = 0; i < hLines; i++) {
        // Exponential spacing for 3D perspective effect
        const progress = (i * 24 + gridOffset) / (hLines * 24);
        if (progress > 1) continue;
        const y = horizonY + Math.pow(progress, 1.8) * totalH;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vanishing point perspective lines
      const vLines = 22;
      const vpX = width * 0.5;
      for (let i = -vLines / 2; i <= vLines / 2; i++) {
        const xBottom = vpX + i * (width / 14);
        ctx.beginPath();
        ctx.moveTo(vpX, horizonY);
        ctx.lineTo(xBottom, height);
        ctx.stroke();
      }
      ctx.restore();

      // Ambient glowing nebula circles
      ctx.save();
      const circleGrad = ctx.createRadialGradient(vpX, horizonY, 5, vpX, horizonY, 260);
      circleGrad.addColorStop(0, currentTheme.glow + '25');
      circleGrad.addColorStop(0.6, currentTheme.glow + '08');
      circleGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = circleGrad;
      ctx.beginPath();
      ctx.arc(vpX, horizonY, 260, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Floating ambient particles
      particles.forEach((p) => {
        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        ctx.save();
        ctx.shadowBlur = p.glow;
        ctx.shadowColor = currentTheme.glow;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme, enabled, reducedMotion]);

  if (!enabled) {
    return <div className="fixed inset-0 pointer-events-none bg-slate-950 -z-20" />;
  }

  return (
    <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/70" />
    </div>
  );
};
