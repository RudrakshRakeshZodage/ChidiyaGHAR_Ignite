import React, { useEffect, useRef } from 'react';

/**
 * Photorealistic Realistic Combat Bowie Knife & 60FPS Blood Particle Engine
 * Features:
 * - Photorealistic 3D tactical hunting knife with brushed stainless steel blade, surgical mirror edge, blood fuller, brass guard & walnut combat grip
 * - Dynamic weapon tilt physics with Iaijutsu combat slash on click
 * - Dripping arterial blood droplets & glowing friction sparks
 * - Hardware-accelerated 60FPS overlay
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
    const slashArcs = [];
    const MAX_PARTICLES = 220;

    let mouseX = -100;
    let mouseY = -100;
    let smoothMouseX = -100;
    let smoothMouseY = -100;
    let isMouseDown = false;
    let slashPower = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;

    // Blood Spark Particles
    class SparkParticle {
      constructor(x, y, isBurst = false) {
        this.x = x;
        this.y = y;
        this.isBurst = isBurst;
        
        const angle = isBurst ? Math.random() * Math.PI * 2 : (Math.random() * Math.PI * 0.9) + Math.PI * 0.55;
        const speed = isBurst ? Math.random() * 7 + 2.5 : Math.random() * 2.5 + 0.5;
        
        this.vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 2;
        this.vy = Math.sin(angle) * speed + (isBurst ? (Math.random() - 0.5) * 3 : Math.random() * 2);
        
        this.radius = isBurst ? Math.random() * 3.5 + 1.2 : Math.random() * 2.2 + 0.8;
        this.alpha = 1;
        this.decay = isBurst ? Math.random() * 0.025 + 0.015 : Math.random() * 0.035 + 0.02;
        this.gravity = 0.09;

        const colors = [
          '#ff1e27', // Hot arterial blood
          '#e31b23', // Rockstar red
          '#b91c1c', // Deep crimson
          '#7f1d1d', // Coagulated dark blood
          '#ffffff', // Steel glint
          '#fcd34d'  // Friction spark
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
    class BloodDroplet {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vy = Math.random() * 1.5 + 1;
        this.radius = Math.random() * 2.2 + 1.2;
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
        context.shadowBlur = 5;
        context.shadowColor = '#e31b23';
        
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI);
        context.lineTo(this.x, this.y - this.radius * 2.2);
        context.closePath();
        context.fill();
        context.restore();
      }
    }

    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const dist = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);

      if (dist > 4) {
        const count = dist > 20 ? 3 : 1;
        for (let i = 0; i < count; i++) {
          if (particles.length < MAX_PARTICLES) {
            particles.push(new SparkParticle(mouseX + (Math.random() - 0.5) * 6, mouseY + (Math.random() - 0.5) * 6, false));
          }
        }

        if (Math.random() > 0.55 && bloodDrips.length < 50) {
          bloodDrips.push(new BloodDroplet(mouseX, mouseY + 2));
        }
      }

      lastMouseX = mouseX;
      lastMouseY = mouseY;
    };

    const handleMouseDown = (e) => {
      isMouseDown = true;
      slashPower = 1.0;

      // Slash arc effect
      slashArcs.push({
        x: e.clientX,
        y: e.clientY,
        alpha: 1.0,
        radius: 38
      });

      // Explosive blood burst on knife strike
      for (let i = 0; i < 28; i++) {
        if (particles.length < MAX_PARTICLES + 50) {
          particles.push(new SparkParticle(e.clientX, e.clientY, true));
        }
      }

      for (let i = 0; i < 8; i++) {
        bloodDrips.push(new BloodDroplet(e.clientX + (Math.random() - 0.5) * 12, e.clientY + (Math.random() - 0.5) * 12));
      }
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });

    // Draw Photorealistic Real Combat Hunting Knife (Realistic Size & Depth)
    const drawPhotorealisticKnife = (context, x, y, isSlashing, power) => {
      if (x < 0 || y < 0) return;

      context.save();
      context.translate(x, y);
      
      // Dynamic slash angle
      const rotation = isSlashing ? -0.42 : (power > 0 ? -0.28 * power : -0.06);
      context.rotate(rotation);

      // Realistic large weapon scale
      const scale = isSlashing ? 1.2 : 1.08;
      context.scale(scale, scale);

      // 0. Realistic Drop Shadow underneath weapon
      context.save();
      context.shadowColor = 'rgba(0, 0, 0, 0.7)';
      context.shadowBlur = 12;
      context.shadowOffsetX = 8;
      context.shadowOffsetY = 12;

      // ==========================================
      // 1. BLADE BODY (Forged Carbon / Stainless Steel)
      // ==========================================
      context.beginPath();
      context.moveTo(0, 0); // Razor sharp pointed tip (Hotspot at 0,0)
      // Curved clip-point cutting edge (Bowie style)
      context.bezierCurveTo(12, 3, 34, 10, 52, 18);
      context.lineTo(48, 26); // Base choil / ricasso
      // Thick heavy spine with swedge
      context.bezierCurveTo(28, 14, 10, 4, 0, 0);
      context.closePath();

      // Multi-tone metallic steel gradient
      const steelGrad = context.createLinearGradient(0, 0, 52, 22);
      steelGrad.addColorStop(0, '#ffffff'); // Specular razor highlight
      steelGrad.addColorStop(0.15, '#f8fafc'); // High polish bevel
      steelGrad.addColorStop(0.35, '#cbd5e1'); // Stainless steel sheen
      steelGrad.addColorStop(0.65, '#94a3b8'); // Brushed steel
      steelGrad.addColorStop(0.85, '#475569'); // Dark bevel shadow
      steelGrad.addColorStop(1, '#1e293b'); // Tang base
      context.fillStyle = steelGrad;
      context.fill();
      context.restore();

      // Razor Edge Mirror Polish (Secondary Hollow Ground Bevel)
      context.beginPath();
      context.moveTo(0, 0);
      context.bezierCurveTo(10, 2.5, 30, 8, 50, 17);
      context.lineWidth = 1.4;
      context.strokeStyle = '#ffffff';
      context.shadowBlur = 8;
      context.shadowColor = '#ffffff';
      context.stroke();

      // Blood Fuller / Deep Gutter Channel
      context.beginPath();
      context.moveTo(10, 5);
      context.lineTo(42, 16);
      context.lineWidth = 2.2;
      context.strokeStyle = '#0f172a';
      context.shadowBlur = 1;
      context.stroke();
      
      // Fuller interior highlight
      context.beginPath();
      context.moveTo(11, 5.5);
      context.lineTo(41, 16.5);
      context.lineWidth = 0.8;
      context.strokeStyle = '#64748b';
      context.stroke();

      // Spine Tactical Serrations
      context.strokeStyle = '#334155';
      context.lineWidth = 1.2;
      for (let i = 24; i <= 44; i += 4) {
        context.beginPath();
        context.moveTo(i, (i * 0.38) - 1);
        context.lineTo(i + 2, (i * 0.38) + 1.5);
        context.stroke();
      }

      // ==========================================
      // 2. FRESH REALISTIC BLOOD DRIP ON RAZOR TIP
      // ==========================================
      context.beginPath();
      context.moveTo(0, 0);
      context.bezierCurveTo(6, 2, 18, 5.5, 24, 9);
      context.lineTo(19, 12);
      context.bezierCurveTo(10, 5, 2, 1, 0, 0);
      context.closePath();

      const bloodGrad = context.createLinearGradient(0, 0, 24, 10);
      bloodGrad.addColorStop(0, '#ff1e27'); // Arterial red
      bloodGrad.addColorStop(0.5, '#b91c1c'); // Crimson
      bloodGrad.addColorStop(1, '#660000'); // Deep coagulated
      context.fillStyle = bloodGrad;
      context.shadowBlur = 12;
      context.shadowColor = '#ff1e27';
      context.fill();

      // Specular highlight on liquid blood
      context.beginPath();
      context.arc(3, 1.5, 1.2, 0, Math.PI * 2);
      context.fillStyle = '#ffffff';
      context.fill();

      // ==========================================
      // 3. SOLID BRASS CROSSGUARD / BOLSTER
      // ==========================================
      context.save();
      context.translate(50, 22);
      context.rotate(Math.PI / 3.8);

      const brassGrad = context.createLinearGradient(-5, -12, 5, 12);
      brassGrad.addColorStop(0, '#fef08a'); // Gold sheen
      brassGrad.addColorStop(0.4, '#f59e0b'); // Polished brass
      brassGrad.addColorStop(0.8, '#b45309'); // Antique bronze
      brassGrad.addColorStop(1, '#451a03'); // Shadow
      context.fillStyle = brassGrad;
      context.strokeStyle = '#271004';
      context.lineWidth = 1;

      context.beginPath();
      context.roundRect(-4.5, -12, 9, 24, 3);
      context.fill();
      context.stroke();

      // Brass Guard Rivet
      context.beginPath();
      context.arc(0, 0, 1.8, 0, Math.PI * 2);
      context.fillStyle = '#fef08a';
      context.fill();
      context.restore();

      // ==========================================
      // 4. REALISTIC WALNUT WOOD & LEATHER TACTICAL GRIP
      // ==========================================
      context.save();
      context.translate(53, 24);

      // Handle Core (Dark Oiled Walnut / Ribbed Grip)
      context.beginPath();
      context.moveTo(0, 0);
      context.lineTo(28, 28);
      context.lineWidth = 11;
      context.lineCap = 'round';
      
      const woodGrad = context.createLinearGradient(0, 0, 28, 28);
      woodGrad.addColorStop(0, '#3f1a0a'); // Dark walnut
      woodGrad.addColorStop(0.3, '#572611'); // Rich woodgrain
      woodGrad.addColorStop(0.6, '#2b1005'); // Deep shadow
      woodGrad.addColorStop(1, '#180a03');
      context.strokeStyle = woodGrad;
      context.stroke();

      // Ergonomic Finger Grooves & Brass Pins
      context.lineWidth = 2.2;
      context.strokeStyle = '#180a03';
      for (let i = 5; i <= 24; i += 6) {
        context.beginPath();
        context.moveTo(i - 4, i + 4);
        context.lineTo(i + 4, i - 4);
        context.stroke();

        // Brass handle rivet pins
        context.beginPath();
        context.arc(i, i, 1.3, 0, Math.PI * 2);
        context.fillStyle = '#fcd34d';
        context.fill();
      }

      // ==========================================
      // 5. SOLID BRASS BUTT CAP / SKULL CRUSHER POMMEL
      // ==========================================
      context.beginPath();
      context.arc(30, 30, 5.5, 0, Math.PI * 2);
      const pommelGrad = context.createRadialGradient(28, 28, 1, 30, 30, 6);
      pommelGrad.addColorStop(0, '#fef08a');
      pommelGrad.addColorStop(0.6, '#d97706');
      pommelGrad.addColorStop(1, '#451a03');
      context.fillStyle = pommelGrad;
      context.fill();
      context.strokeStyle = '#78350f';
      context.lineWidth = 1;
      context.stroke();

      // Lanyard Hole in Pommel
      context.beginPath();
      context.arc(30, 30, 2, 0, Math.PI * 2);
      context.fillStyle = '#0f0702';
      context.fill();

      context.restore();
      context.restore();
    };

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      smoothMouseX += (mouseX - smoothMouseX) * 0.52;
      smoothMouseY += (mouseY - smoothMouseY) * 0.52;

      if (slashPower > 0) {
        slashPower -= 0.055;
      }

      // 1. Draw Slash Arc Trails
      for (let i = slashArcs.length - 1; i >= 0; i--) {
        const arc = slashArcs[i];
        ctx.save();
        ctx.globalAlpha = Math.max(0, arc.alpha);
        ctx.strokeStyle = '#ff1e27';
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#ff1e27';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(arc.x, arc.y, arc.radius, -Math.PI / 3, Math.PI / 3);
        ctx.stroke();
        ctx.restore();

        arc.alpha -= 0.06;
        arc.radius += 2.5;
        if (arc.alpha <= 0) {
          slashArcs.splice(i, 1);
        }
      }

      // 2. Draw blood particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw(ctx);
        if (p.alpha <= 0 || p.y > height + 20) {
          particles.splice(i, 1);
        }
      }

      // 3. Draw blood drips
      for (let i = bloodDrips.length - 1; i >= 0; i--) {
        const d = bloodDrips[i];
        d.update();
        d.draw(ctx);
        if (d.alpha <= 0 || d.y > height + 20) {
          bloodDrips.splice(i, 1);
        }
      }

      // 4. Draw Real Photorealistic Combat Knife
      drawPhotorealisticKnife(ctx, smoothMouseX, smoothMouseY, isMouseDown, slashPower);

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
