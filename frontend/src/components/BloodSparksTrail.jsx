import React, { useEffect, useRef } from 'react';

/**
 * Hyper-Realistic Large Bowie Knife & 60FPS Blood Particle Engine
 * Features:
 * - Real-time rendered large tactical combat knife with Damascus steel blade, blood gutter, brass guard & leather hilt
 * - Dynamic knife slash tilt on click and motion velocity
 * - Dripping blood droplets & glowing sparks from razor tip
 * - Zero latency GPU-accelerated canvas overlay
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
    const bloodDrips = [];
    const MAX_PARTICLES = 200;

    let mouseX = -100;
    let mouseY = -100;
    let smoothMouseX = -100;
    let smoothMouseY = -100;
    let isMouseDown = false;
    let slashAngle = 0;
    let slashPower = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseVelocity = 0;

    // Particle class for explosive blood sparks and mist
    class SparkParticle {
      constructor(x, y, isBurst = false) {
        this.x = x;
        this.y = y;
        this.isBurst = isBurst;
        
        const angle = isBurst ? Math.random() * Math.PI * 2 : (Math.random() * Math.PI * 0.8) + Math.PI * 0.6;
        const speed = isBurst ? Math.random() * 6 + 2 : Math.random() * 2.5 + 0.5;
        
        this.vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 2;
        this.vy = Math.sin(angle) * speed + (isBurst ? (Math.random() - 0.5) * 3 : Math.random() * 2);
        
        this.radius = isBurst ? Math.random() * 3.5 + 1.5 : Math.random() * 2.5 + 0.8;
        this.alpha = 1;
        this.decay = isBurst ? Math.random() * 0.025 + 0.015 : Math.random() * 0.035 + 0.02;
        this.gravity = 0.1;

        const colors = [
          '#ff1e27', // Hot arterial red
          '#e31b23', // Rockstar red
          '#b91c1c', // Dark crimson
          '#7f1d1d', // Coagulated blood
          '#ff6b6b', // Glowing ember
          '#fcd34d'  // Rare gold friction spark
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
        context.shadowBlur = this.isBurst ? 12 : 6;
        context.shadowColor = this.color;
        context.fillStyle = this.color;
        
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
    }

    // Dripping liquid blood droplet
    class BloodDrip {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vy = Math.random() * 1.5 + 1;
        this.radius = Math.random() * 2 + 1.2;
        this.alpha = 0.95;
        this.decay = 0.018;
      }

      update() {
        this.y += this.vy;
        this.vy += 0.12;
        this.alpha -= this.decay;
      }

      draw(context) {
        if (this.alpha <= 0) return;
        context.save();
        context.globalAlpha = Math.max(0, this.alpha);
        context.fillStyle = '#b91c1c';
        context.shadowBlur = 4;
        context.shadowColor = '#e31b23';
        
        context.beginPath();
        // Teardrop drip shape
        context.arc(this.x, this.y, this.radius, 0, Math.PI);
        context.lineTo(this.x, this.y - this.radius * 2);
        context.closePath();
        context.fill();
        context.restore();
      }
    }

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const dist = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
      mouseVelocity = dist;

      // Spawn blood sparks and drips as knife cuts through air
      if (dist > 4) {
        const count = dist > 20 ? 3 : 1;
        for (let i = 0; i < count; i++) {
          if (particles.length < MAX_PARTICLES) {
            particles.push(new SparkParticle(mouseX + (Math.random() - 0.5) * 6, mouseY + (Math.random() - 0.5) * 6, false));
          }
        }

        if (Math.random() > 0.6 && bloodDrips.length < 50) {
          bloodDrips.push(new BloodDrip(mouseX, mouseY + 2));
        }
      }

      lastMouseX = mouseX;
      lastMouseY = mouseY;
    };

    const handleMouseDown = (e) => {
      isMouseDown = true;
      slashPower = 1.0;

      // Explosive blood burst on slash
      for (let i = 0; i < 24; i++) {
        if (particles.length < MAX_PARTICLES + 40) {
          particles.push(new SparkParticle(e.clientX, e.clientY, true));
        }
      }

      for (let i = 0; i < 6; i++) {
        bloodDrips.push(new BloodDrip(e.clientX + (Math.random() - 0.5) * 10, e.clientY + (Math.random() - 0.5) * 10));
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });

    // Draw Real Knife Function
    const drawRealKnife = (context, x, y, angle, isSlashing) => {
      if (x < 0 || y < 0) return;

      context.save();
      context.translate(x, y);
      context.rotate(angle);

      // Slash scale bounce
      const scale = isSlashing ? 1.15 : 1.0;
      context.scale(scale, scale);

      // ==========================================
      // 1. BLADE (Steel with realistic sheen & bevel)
      // ==========================================
      context.beginPath();
      context.moveTo(0, 0); // Razor sharp tip
      context.bezierCurveTo(8, 2, 28, 8, 38, 14); // Curved razor cutting edge
      context.lineTo(34, 20); // Blade base
      context.lineTo(6, 12); // Back spine
      context.lineTo(0, 0); // Tip
      context.closePath();

      // Damascus / Carbon Steel Metallic Gradient
      const bladeGrad = context.createLinearGradient(0, 0, 35, 18);
      bladeGrad.addColorStop(0, '#ffffff'); // Glint at razor tip
      bladeGrad.addColorStop(0.2, '#e2e8f0'); // Polished steel
      bladeGrad.addColorStop(0.5, '#94a3b8'); // Dark steel
      bladeGrad.addColorStop(0.8, '#475569'); // Carbon steel shadow
      bladeGrad.addColorStop(1, '#1e293b');
      context.fillStyle = bladeGrad;
      context.shadowBlur = isSlashing ? 15 : 8;
      context.shadowColor = '#e31b23';
      context.fill();

      // Blade Edge Highlight
      context.lineWidth = 1.2;
      context.strokeStyle = '#f8fafc';
      context.stroke();

      // Blood Groove / Fuller (center channel)
      context.beginPath();
      context.moveTo(6, 4);
      context.lineTo(28, 13);
      context.lineWidth = 1.5;
      context.strokeStyle = '#0f172a';
      context.stroke();

      // ==========================================
      // 2. FRESH BLOOD ON BLADE TIP
      // ==========================================
      context.beginPath();
      context.moveTo(0, 0);
      context.bezierCurveTo(4, 1.5, 14, 4, 18, 8);
      context.lineTo(12, 11);
      context.lineTo(3, 4);
      context.closePath();

      const bloodGrad = context.createLinearGradient(0, 0, 18, 8);
      bloodGrad.addColorStop(0, '#ff1e27');
      bloodGrad.addColorStop(0.6, '#b91c1c');
      bloodGrad.addColorStop(1, '#7f1d1d');
      context.fillStyle = bloodGrad;
      context.shadowBlur = 10;
      context.shadowColor = '#ff1e27';
      context.fill();

      // ==========================================
      // 3. BRASS CROSSGUARD
      // ==========================================
      context.save();
      context.translate(34, 16);
      context.rotate(Math.PI / 4);
      
      const guardGrad = context.createLinearGradient(-6, -2, 6, 2);
      guardGrad.addColorStop(0, '#fef08a');
      guardGrad.addColorStop(0.5, '#d97706');
      guardGrad.addColorStop(1, '#78350f');
      context.fillStyle = guardGrad;
      context.strokeStyle = '#451a03';
      context.lineWidth = 0.8;

      context.beginPath();
      context.roundRect(-4, -10, 8, 20, 2);
      context.fill();
      context.stroke();
      context.restore();

      // ==========================================
      // 4. OUTLAW LEATHER-WRAPPED HANDLE (HILT)
      // ==========================================
      context.save();
      context.translate(36, 18);
      
      // Handle Core
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(22, 22);
      context.lineWidth = 7.5;
      context.lineCap = 'round';
      context.strokeStyle = '#18181b';
      context.stroke();

      // Leather Grip Wraps / Ribs
      context.lineWidth = 1.8;
      context.strokeStyle = '#d97706';
      for (let i = 4; i < 20; i += 4) {
        context.beginPath();
        context.moveTo(i - 3, i + 3);
        context.lineTo(i + 3, i - 3);
        context.stroke();
      }

      // Brass Skull / Ring Pommel
      context.beginPath();
      context.arc(24, 24, 4, 0, Math.PI * 2);
      const pommelGrad = context.createRadialGradient(23, 23, 1, 24, 24, 4);
      pommelGrad.addColorStop(0, '#fef08a');
      pommelGrad.addColorStop(0.7, '#d97706');
      pommelGrad.addColorStop(1, '#451a03');
      context.fillStyle = pommelGrad;
      context.fill();
      context.strokeStyle = '#78350f';
      context.lineWidth = 1;
      context.stroke();

      context.restore();
      context.restore();
    };

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      smoothMouseX += (mouseX - smoothMouseX) * 0.45;
      smoothMouseY += (mouseY - smoothMouseY) * 0.45;

      // Slash power decay
      if (slashPower > 0) {
        slashPower -= 0.05;
        slashAngle = Math.sin(slashPower * Math.PI) * -0.35;
      } else {
        slashAngle = Math.sin(Date.now() * 0.003) * 0.03;
      }

      // 1. Draw blood particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0 || p.y > height + 20) {
          particles.splice(i, 1);
        }
      }

      // 2. Draw blood drips
      for (let i = bloodDrips.length - 1; i >= 0; i--) {
        const d = bloodDrips[i];
        d.update();
        d.draw(ctx);
        if (d.alpha <= 0 || d.y > height + 20) {
          bloodDrips.splice(i, 1);
        }
      }

      // 3. Draw Real HD Knife at mouse tip
      drawRealKnife(ctx, smoothMouseX, smoothMouseY, slashAngle, isMouseDown || slashPower > 0.1);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
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
