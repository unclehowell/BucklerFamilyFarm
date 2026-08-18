import React, { useEffect, useRef } from 'react';

export const MoneyAndConfettiRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle types: 'money50', 'money20', 'coin', 'confetti'
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      rotation: number;
      vRotation: number;
      width: number;
      height: number;
      type: 'money50' | 'money20' | 'coin' | 'confetti';
      color: string;
      wobble: number;
      wobbleSpeed: number;
      scale: number;
    }

    const confettiColors = ['#E63946', '#F4A261', '#2A9D8F', '#E76F51', '#457B9D', '#D08856', '#10B981', '#FBBF24', '#A78BFA'];
    const particles: Particle[] = [];
    const particleCount = 75;

    for (let i = 0; i < particleCount; i++) {
      const isMoney = Math.random() > 0.4;
      const isCoin = Math.random() > 0.7;

      let type: 'money50' | 'money20' | 'coin' | 'confetti' = 'confetti';
      if (isCoin) {
        type = 'coin';
      } else if (isMoney) {
        type = Math.random() > 0.5 ? 'money50' : 'money20';
      }

      particles.push({
        x: Math.random() * width,
        y: Math.random() * -height - Math.random() * 200,
        vx: (Math.random() - 0.5) * 1.5,
        vy: type === 'coin' ? 2.5 + Math.random() * 2.5 : 1.8 + Math.random() * 2.2,
        rotation: Math.random() * Math.PI * 2,
        vRotation: (Math.random() - 0.5) * 0.08,
        width: type === 'coin' ? 18 : type === 'confetti' ? 8 + Math.random() * 6 : 46 + Math.random() * 10,
        height: type === 'coin' ? 18 : type === 'confetti' ? 12 + Math.random() * 8 : 24 + Math.random() * 6,
        type,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.03 + Math.random() * 0.05,
        scale: 0.8 + Math.random() * 0.4,
      });
    }

    const drawMoneyBill = (
      ctx: CanvasRenderingContext2D,
      p: Particle
    ) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.cos(p.wobble) * p.scale, p.scale);

      const w = p.width;
      const h = p.height;

      // Bill base color
      if (p.type === 'money50') {
        // £50 Note (Red / Ochre)
        ctx.fillStyle = '#A32929';
        ctx.strokeStyle = '#D97706';
      } else {
        // £20 Note (Purple / Blue)
        ctx.fillStyle = '#4C307A';
        ctx.strokeStyle = '#60A5FA';
      }

      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 3);
      ctx.fill();
      ctx.stroke();

      // Inner ornate border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-w / 2 + 3, -h / 2 + 2, w - 6, h - 4);

      // Symbol
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.type === 'money50' ? '£50' : '£20', 0, 0);

      // Security seal sparkle
      ctx.fillStyle = '#FDE047';
      ctx.beginPath();
      ctx.arc(w / 2 - 7, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawCoin = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.cos(p.wobble) * p.scale, p.scale);

      // Gold Coin
      ctx.fillStyle = '#EAB308';
      ctx.strokeStyle = '#CA8A04';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#78350F';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('£', 0, 0);

      ctx.restore();
    };

    const drawConfetti = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.sin(p.wobble) * p.scale, p.scale);

      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.rect(-p.width / 2, -p.height / 2, p.width, p.height);
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.y += p.vy;
        p.x += p.vx + Math.sin(p.wobble) * 0.8;
        p.rotation += p.vRotation;
        p.wobble += p.wobbleSpeed;

        if (p.type === 'money50' || p.type === 'money20') {
          drawMoneyBill(ctx, p);
        } else if (p.type === 'coin') {
          drawCoin(ctx, p);
        } else {
          drawConfetti(ctx, p);
        }

        // Loop around
        if (p.y > height + 50) {
          p.y = -40;
          p.x = Math.random() * width;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      style={{ overflow: 'hidden' }}
    />
  );
};
