import React, { useEffect, useRef, useState } from 'react';

function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [glitchActive, setGlitchActive] = useState(false);
  const containerRef = useRef(null);

  /* ── styles ── */
  useEffect(() => {
    if (!document.getElementById('bs-css')) {
      const link = document.createElement('link');
      link.id = 'bs-css';
      link.rel = 'stylesheet';
      link.href =
        'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css';
      document.head.appendChild(link);
    }

    const style = document.createElement('style');
    style.id = 'nf-custom';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

      body { margin: 0; }

      .nf-root {
        min-height: 100vh;
        background: #050508;
        font-family: 'DM Sans', sans-serif;
        overflow: hidden;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* ── orbs ── */
      .orb {
        position: absolute; border-radius: 50%;
        filter: blur(90px); pointer-events: none;
        animation: drift 10s ease-in-out infinite;
      }
      .orb-1 {
        width: 600px; height: 600px;
        background: radial-gradient(circle, rgba(255,60,60,.13) 0%, transparent 70%);
        top: -200px; left: -150px; animation-duration: 12s;
      }
      .orb-2 {
        width: 450px; height: 450px;
        background: radial-gradient(circle, rgba(0,140,255,.11) 0%, transparent 70%);
        bottom: -120px; right: -100px; animation-duration: 14s; animation-delay: -5s;
      }
      .orb-3 {
        width: 300px; height: 300px;
        background: radial-gradient(circle, rgba(180,0,255,.09) 0%, transparent 70%);
        top: 50%; left: 60%; animation-duration: 11s; animation-delay: -8s;
      }
      @keyframes drift {
        0%,100% { transform: translate(0,0) scale(1); }
        33%      { transform: translate(30px,-25px) scale(1.05); }
        66%      { transform: translate(-22px,18px) scale(.96); }
      }

      /* ── grid ── */
      .grid-bg {
        position: absolute; inset: 0; pointer-events: none;
        background-image:
          linear-gradient(rgba(255,60,60,.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,60,60,.025) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      /* ── cursor glow ── */
      .cursor-glow {
        position: fixed; pointer-events: none;
        width: 320px; height: 320px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,60,60,.07) 0%, transparent 65%);
        transform: translate(-50%, -50%);
        transition: left .12s ease, top .12s ease;
        z-index: 0;
      }

      /* ── card ── */
      .nf-card {
        position: relative; overflow: hidden;
        background: rgba(255,255,255,.026) !important;
        border: 1px solid rgba(255,255,255,.08) !important;
        border-radius: 28px !important;
        backdrop-filter: blur(44px) saturate(160%);
        -webkit-backdrop-filter: blur(44px) saturate(160%);
        box-shadow:
          0 0 0 1px rgba(255,255,255,.04) inset,
          0 40px 90px rgba(0,0,0,.65),
          0 0 80px rgba(255,60,60,.05);
        z-index: 10;
        text-align: center;
        padding: 56px 52px 48px !important;
        max-width: 480px;
        width: 100%;
      }

      .card-glow {
        position: absolute; inset: 0; pointer-events: none;
        border-radius: 28px; opacity: .6;
      }

      /* ── 404 big number ── */
      .nf-number {
        font-family: 'Syne', sans-serif;
        font-size: clamp(96px, 18vw, 140px);
        font-weight: 800;
        line-height: 1;
        letter-spacing: -6px;
        background: linear-gradient(135deg, #ff4d4d 0%, #ff8c00 60%, #ff4d80 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        position: relative;
        display: inline-block;
        filter: drop-shadow(0 0 40px rgba(255,60,60,.35));
        user-select: none;
      }

      /* glitch layers */
      .nf-number::before,
      .nf-number::after {
        content: '404';
        position: absolute;
        top: 0; left: 0; right: 0;
        background: inherit;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        opacity: 0;
      }
      .nf-number.glitch::before {
        opacity: .7;
        animation: glitch-1 .3s steps(2) forwards;
      }
      .nf-number.glitch::after {
        opacity: .5;
        animation: glitch-2 .3s steps(2) forwards;
      }
      @keyframes glitch-1 {
        0%  { clip-path: inset(20% 0 60% 0); transform: translate(-4px, 2px); filter: hue-rotate(90deg); }
        25% { clip-path: inset(60% 0 10% 0); transform: translate(4px, -2px); }
        50% { clip-path: inset(40% 0 30% 0); transform: translate(-2px, 4px); filter: hue-rotate(180deg); }
        75% { clip-path: inset(10% 0 70% 0); transform: translate(2px, -4px); }
        100%{ clip-path: inset(0 0 0 0);     transform: translate(0, 0);     opacity: 0; }
      }
      @keyframes glitch-2 {
        0%  { clip-path: inset(70% 0 10% 0); transform: translate(4px, -2px); filter: hue-rotate(-90deg); }
        25% { clip-path: inset(10% 0 60% 0); transform: translate(-4px, 2px); }
        50% { clip-path: inset(50% 0 20% 0); transform: translate(2px, 4px);  filter: hue-rotate(270deg); }
        75% { clip-path: inset(20% 0 50% 0); transform: translate(-2px,-4px); }
        100%{ clip-path: inset(0 0 0 0);     transform: translate(0, 0);      opacity: 0; }
      }

      /* floating particles around 404 */
      .particles {
        position: absolute; inset: 0; pointer-events: none;
        overflow: hidden; border-radius: 28px;
      }
      .particle {
        position: absolute;
        width: 2px; height: 2px;
        border-radius: 50%;
        background: rgba(255,60,60,.6);
        animation: float-p var(--dur) ease-in-out infinite var(--delay);
      }
      @keyframes float-p {
        0%   { transform: translate(0, 0) scale(1); opacity: .8; }
        50%  { transform: translate(var(--dx), var(--dy)) scale(1.5); opacity: .3; }
        100% { transform: translate(0, 0) scale(1); opacity: .8; }
      }

      /* ── badge ── */
      .nf-badge {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 5px 12px 5px 8px;
        background: rgba(255,60,60,.08);
        border: 1px solid rgba(255,60,60,.2);
        border-radius: 20px;
        font-size: 11px; font-weight: 500;
        color: rgba(255,120,120,.9); letter-spacing: .5px;
        margin-bottom: 24px;
      }
      .badge-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #ff4d4d; box-shadow: 0 0 6px #ff4d4d;
        animation: pdot 1.5s ease-in-out infinite;
      }
      @keyframes pdot { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.3;transform:scale(.7);} }

      /* ── heading ── */
      .nf-title {
        font-family: 'Syne', sans-serif;
        font-size: 22px; font-weight: 800;
        color: #fff; letter-spacing: -.3px;
        margin-bottom: 8px;
      }
      .nf-sub {
        font-size: 14px; color: rgba(255,255,255,.35);
        font-weight: 300; line-height: 1.7;
        margin-bottom: 36px;
      }

      /* ── divider ── */
      .nf-divider {
        display: flex; align-items: center; gap: 14px;
        color: rgba(255,255,255,.15); font-size: 11px; letter-spacing: 1px;
        margin-bottom: 24px;
      }
      .nf-divider::before, .nf-divider::after {
        content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.07);
      }

      /* ── primary btn ── */
      .nf-btn-primary {
        background: linear-gradient(135deg, #ff4d4d 0%, #ff8c00 100%) !important;
        border: none !important;
        border-radius: 12px !important;
        color: #fff !important;
        font-family: 'Syne', sans-serif !important;
        font-size: 14px !important; font-weight: 700 !important;
        position: relative; overflow: hidden;
        box-shadow: 0 4px 24px rgba(255,60,60,.25) !important;
        transition: transform .15s ease, box-shadow .3s ease !important;
        letter-spacing: .2px;
      }
      .nf-btn-primary:hover {
        transform: translateY(-1px);
        color: #fff !important;
        box-shadow: 0 8px 32px rgba(255,60,60,.4) !important;
      }
      .nf-btn-primary:active { transform: translateY(0); }
      .btn-shimmer {
        position: absolute; inset: 0;
        background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,.25) 50%, transparent 70%);
        transform: translateX(-100%);
        animation: shimmer 2.8s ease-in-out infinite;
      }
      @keyframes shimmer { 0%{transform:translateX(-100%);}40%,100%{transform:translateX(210%);} }

      /* ── ghost btn ── */
      .nf-btn-ghost {
        background: rgba(255,255,255,.04) !important;
        border: 1px solid rgba(255,255,255,.08) !important;
        border-radius: 12px !important;
        color: rgba(255,255,255,.5) !important;
        font-family: 'DM Sans', sans-serif !important;
        font-size: 14px !important;
        transition: all .2s !important;
      }
      .nf-btn-ghost:hover {
        background: rgba(255,255,255,.08) !important;
        border-color: rgba(255,255,255,.15) !important;
        color: rgba(255,255,255,.8) !important;
      }

      /* ── quick links ── */
      .quick-links {
        display: flex; flex-wrap: wrap; gap: 8px;
        justify-content: center; margin-top: 24px;
      }
      .quick-link {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 6px 12px;
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 20px;
        font-size: 12px; color: rgba(255,255,255,.35);
        cursor: pointer; transition: all .2s;
        text-decoration: none;
        font-family: 'DM Sans', sans-serif;
      }
      .quick-link:hover {
        background: rgba(255,255,255,.08);
        border-color: rgba(255,255,255,.14);
        color: rgba(255,255,255,.7);
      }
      .quick-link-dot {
        width: 4px; height: 4px; border-radius: 50%;
        background: rgba(255,60,60,.6);
      }

      /* ── status row ── */
      .status-row {
        display: flex; align-items: center; justify-content: center;
        gap: 20px; margin-top: 28px; padding-top: 24px;
        border-top: 1px solid rgba(255,255,255,.06);
      }
      .status-item {
        display: flex; align-items: center; gap: 6px;
        font-size: 11px; color: rgba(255,255,255,.2);
      }
      .status-dot-green {
        width: 5px; height: 5px; border-radius: 50%;
        background: #00ff8c; box-shadow: 0 0 5px #00ff8c;
      }

      /* ── fade-up ── */
      @keyframes fadeUp { from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);} }
      .fu  { animation: fadeUp .5s cubic-bezier(.4,0,.2,1) both; }
      .d1  { animation-delay: .06s; } .d2  { animation-delay: .12s; }
      .d3  { animation-delay: .18s; } .d4  { animation-delay: .24s; }
      .d5  { animation-delay: .30s; } .d6  { animation-delay: .38s; }

      /* ── hover number ── */
      .nf-number-wrap { cursor: default; margin-bottom: 8px; display: block; }
    `;
    if (!document.getElementById('nf-custom')) document.head.appendChild(style);
    return () => {
      const s = document.getElementById('nf-custom');
      if (s) s.remove();
    };
  }, []);

  /* mouse tracking */
  useEffect(() => {
    const handler = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  /* random glitch trigger */
  useEffect(() => {
    const interval = setInterval(
      () => {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 350);
      },
      3500 + Math.random() * 2000,
    );
    return () => clearInterval(interval);
  }, []);

  /* particles config */
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${10 + Math.random() * 80}%`,
    top: `${10 + Math.random() * 80}%`,
    dur: `${3 + Math.random() * 4}s`,
    delay: `${-Math.random() * 4}s`,
    dx: `${(Math.random() - 0.5) * 40}px`,
    dy: `${(Math.random() - 0.5) * 40}px`,
  }));

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Login', href: '/login' },
    { label: 'Register', href: '/register' },
    { label: 'Products', href: '/products' },
  ];

  return (
    <div className="nf-root" ref={containerRef}>
      {/* backgrounds */}
      <div className="grid-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* cursor glow */}
      <div
        className="cursor-glow"
        style={{ left: mousePos.x, top: mousePos.y }}
      />

      {/* ── card ── */}
      <div className="nf-card card">
        {/* particles */}
        <div className="particles">
          {particles.map((p) => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: p.left,
                top: p.top,
                '--dur': p.dur,
                '--delay': p.delay,
                '--dx': p.dx,
                '--dy': p.dy,
              }}
            />
          ))}
        </div>

        <div
          className="card-glow"
          style={{
            background: `radial-gradient(circle at 50% 30%, rgba(255,60,60,.08) 0%, transparent 65%)`,
          }}
        />

        {/* badge */}
        <div className="fu">
          <span className="nf-badge">
            <span className="badge-dot" /> PAGE NOT FOUND
          </span>
        </div>

        {/* 404 number */}
        <div className="fu d1 nf-number-wrap">
          <span className={`nf-number ${glitchActive ? 'glitch' : ''}`}>
            404
          </span>
        </div>

        {/* title + sub */}
        <div className="fu d2">
          <h1 className="nf-title">Oops! Lost in space.</h1>
          <p className="nf-sub">
            The page you're looking for doesn't exist,
            <br />
            was moved, or never existed at all.
          </p>
        </div>

        {/* divider */}
        <div className="nf-divider fu d3">WHERE TO?</div>

        {/* action buttons */}
        <div className="row g-2 fu d4">
          <div className="col-12">
            <a
              href="/"
              className="btn nf-btn-primary w-100 py-3 text-decoration-none"
            >
              <div className="btn-shimmer" />← Back to Home
            </a>
          </div>
          <div className="col-6">
            <a
              href="/login"
              className="btn nf-btn-ghost w-100 py-2 text-decoration-none"
            >
              Sign In
            </a>
          </div>
          <div className="col-6">
            <a
              href="/register"
              className="btn nf-btn-ghost w-100 py-2 text-decoration-none"
            >
              Register
            </a>
          </div>
        </div>

        {/* quick links */}
        <div className="quick-links fu d5">
          {quickLinks.map((l) => (
            <a key={l.label} href={l.href} className="quick-link">
              <span className="quick-link-dot" />
              {l.label}
            </a>
          ))}
        </div>

        {/* status row */}
        <div className="status-row fu d6">
          <div className="status-item">
            <span className="status-dot-green" /> API Online
          </div>
          <div
            className="status-item"
            style={{ color: 'rgba(255,255,255,.1)' }}
          >
            ·
          </div>
          <div className="status-item">
            <span className="status-dot-green" /> Server OK
          </div>
          <div
            className="status-item"
            style={{ color: 'rgba(255,255,255,.1)' }}
          >
            ·
          </div>
          <div className="status-item">Error 404</div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
