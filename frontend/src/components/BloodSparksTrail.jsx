import React, { useEffect, useRef } from 'react';

/**
 * High-Performance 60FPS Blood Sparks & Knife Cursor Particle Canvas
 * Features:
 * - Emits glowing crimson blood droplets and fiery sparks from the knife tip on mouse move
 * - Explosive blood splash burst on mouse click / press
 * - Hardware accelerated canvas with zero performance impact on UI
 */
export default function BloodSparksTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = [];
    const MAX_PARTICLES = 160;

    // Particle class for blood droplets & glowing sparks
    class Particle {
      constructor(x, y, isBurst = false) {
        this.x = x;
        this.y = y;
        this.isBurst = isBurst;
        
        const angle = isBurst ? Math.random() * Math.PI * 2 : Math.random() * Math.PI - Math.PI / 2;
        const speed = isBurst ? Math.random() * 5 + 2 : Math.random() * 2 + 0.5;
        
        this.vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 1.5;
        this.vy = Math.sin(angle) * speed + (isBurst ? (Math.random() - 0.5) * 3 : Math.random() * 1.5);
        
        this.radius = isBurst ? Math.random() * 3 + 1.5 : Math.random() * 2.2 + 0.8;
        this.alpha = 1;
        this.decay = isBurst ? Math.random() * 0.025 + 0.015 : Math.random() * 0.035 + 0.02;
        this.gravity = 0.08;

        // Variety of blood shades: bright crimson spark, deep venous blood, ember glow
        const colors = [
          '#ff1e27', // Bright arterial red spark
          '#e31b23', // Rockstar red
          '#b91c1c', // Dark crimson
          '#880808', // Deep blood
          '#ff6b6b', // Glowing hot red spark
          '#ffd700'  // Occasional gold spark
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.vx *= 0.98;
        this.alpha -= this.decay;
      }

      draw(context) {
        if (this.alpha <= 0) return;
        context.save();
        context.globalAlpha = Math.max(0, this.alpha);
        context.shadowBlur = this.isBurst ? 10 : 6;
        context.shadowColor = this.color;
        context.fillStyle = this.color;
        
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
    }

    let lastMouseX = 0;
    let lastMouseY = 0;
    let throttleCounter = 0;

    const handleMouseMove = (e) => {
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const dist = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
      throttleCounter++;

      // Spawn blood sparks on motion
      if (dist > 3 || throttleCounter % 2 === 0) {
        const spawnCount = dist > 20 ? 3 : 1;
        for (let i = 0; i < spawnCount; i++) {
          if (particles.length < MAX_PARTICLES) {
            // Offset slightly to align with the knife tip
            particles.push(new Particle(mouseX + (Math.random() - 0.5) * 4, mouseY + (Math.random() - 0.5) * 4, false));
          }
        }
        lastMouseX = mouseX;
        lastMouseY = mouseY;
      }
    };

    const handleMouseDown = (e) => {
      // Blood splash burst on click
      const count = 18;
      for (let i = 0; i < count; i++) {
        if (particles.length < MAX_PARTICLES + 30) {
          particles.push(new Particle(e.clientX, e.clientY, true));
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0 || p.y > height + 20) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
