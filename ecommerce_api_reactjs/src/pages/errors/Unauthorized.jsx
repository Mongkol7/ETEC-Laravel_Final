import React, { useEffect, useRef, useState } from 'react';

function Unauthorized() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scanLine, setScanLine] = useState(0);
  const [pulseRing, setPulseRing] = useState(false);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const cardRef = useRef(null);

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
    style.id = 'ua-custom';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

      body { margin: 0; }

      .ua-root {
        min-height: 100vh;
        background: #050508;
        font-family: 'DM Sans', sans-serif;
        overflow: hidden;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* ── orbs — amber/orange palette for "warning/auth" feel ── */
      .orb {
        position: absolute; border-radius: 50%;
        filter: blur(90px); pointer-events: none;
        animation: drift 10s ease-in-out infinite;
      }
      .orb-1 {
        width: 580px; height: 580px;
        background: radial-gradient(circle, rgba(255,170,0,.13) 0%, transparent 70%);
        top: -180px; left: -120px; animation-duration: 11s;
      }
      .orb-2 {
        width: 440px; height: 440px;
        background: radial-gradient(circle, rgba(255,80,0,.1) 0%, transparent 70%);
        bottom: -110px; right: -90px; animation-duration: 13s; animation-delay: -5s;
      }
      .orb-3 {
        width: 300px; height: 300px;
        background: radial-gradient(circle, rgba(200,0,80,.08) 0%, transparent 70%);
        top: 40%; left: 58%; animation-duration: 15s; animation-delay: -8s;
      }
      @keyframes drift {
        0%,100% { transform: translate(0,0) scale(1); }
        33%      { transform: translate(-28px,22px) scale(1.04); }
        66%      { transform: translate(22px,-16px) scale(.96); }
      }

      /* ── grid ── */
      .grid-bg {
        position: absolute; inset: 0; pointer-events: none;
        background-image:
          linear-gradient(rgba(255,170,0,.022) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,170,0,.022) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      /* ── cursor glow ── */
      .cursor-glow {
        position: fixed; pointer-events: none;
        width: 300px; height: 300px; border-radius: 50%;
        background: radial-gradient(circle, rgba(255,160,0,.07) 0%, transparent 65%);
        transform: translate(-50%, -50%);
        transition: left .12s ease, top .12s ease;
        z-index: 0;
      }

      /* ── card ── */
      .ua-card {
        position: relative; overflow: hidden;
        background: rgba(255,255,255,.026) !important;
        border: 1px solid rgba(255,255,255,.08) !important;
        border-radius: 28px !important;
        backdrop-filter: blur(44px) saturate(160%);
        -webkit-backdrop-filter: blur(44px) saturate(160%);
        box-shadow:
          0 0 0 1px rgba(255,255,255,.04) inset,
          0 40px 90px rgba(0,0,0,.65),
          0 0 80px rgba(255,160,0,.04);
        z-index: 10;
        text-align: center;
        padding: 52px 52px 44px !important;
        max-width: 480px;
        width: 100%;
      }
      .card-glow {
        position: absolute; inset: 0; pointer-events: none;
        border-radius: 28px; opacity: .55;
      }

      /* ── lock icon shield ── */
      .lock-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 28px;
      }

      /* outer pulse rings */
      .pulse-ring {
        position: absolute;
        border-radius: 50%;
        border: 1px solid rgba(255,160,0,.3);
        animation: ring-out 2.4s ease-out infinite;
      }
      .pulse-ring:nth-child(2) { animation-delay: .8s; }
      .pulse-ring:nth-child(3) { animation-delay: 1.6s; }
      @keyframes ring-out {
        0%   { width: 68px; height: 68px; opacity: .8; }
        100% { width: 130px; height: 130px; opacity: 0; }
      }

      /* hex background */
      .lock-hex {
        width: 80px; height: 80px;
        background: rgba(255,160,0,.08);
        border: 1.5px solid rgba(255,160,0,.22);
        border-radius: 22px;
        display: flex; align-items: center; justify-content: center;
        position: relative; z-index: 1;
        box-shadow: 0 0 30px rgba(255,160,0,.12), inset 0 0 20px rgba(255,160,0,.05);
        animation: hex-breathe 3s ease-in-out infinite;
      }
      @keyframes hex-breathe {
        0%,100% { box-shadow: 0 0 30px rgba(255,160,0,.12), inset 0 0 20px rgba(255,160,0,.05); }
        50%      { box-shadow: 0 0 50px rgba(255,160,0,.22), inset 0 0 30px rgba(255,160,0,.1); }
      }

      /* scan line across icon */
      .scan-line {
        position: absolute;
        left: 0; right: 0;
        height: 1.5px;
        background: linear-gradient(90deg, transparent, rgba(255,160,0,.7), transparent);
        border-radius: 2px;
        animation: scan 2.5s ease-in-out infinite;
        z-index: 2;
      }
      @keyframes scan {
        0%   { top: 0%;   opacity: 0; }
        10%  { opacity: 1; }
        90%  { opacity: 1; }
        100% { top: 100%; opacity: 0; }
      }

      /* lock shackle animation — jiggles on load */
      .lock-icon { animation: lock-jiggle 3s ease-in-out infinite; }
      @keyframes lock-jiggle {
        0%,90%,100% { transform: rotate(0deg); }
        92%          { transform: rotate(-6deg); }
        94%          { transform: rotate(6deg); }
        96%          { transform: rotate(-4deg); }
        98%          { transform: rotate(3deg); }
      }

      /* ── badge ── */
      .ua-badge {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 5px 12px 5px 8px;
        background: rgba(255,160,0,.08);
        border: 1px solid rgba(255,160,0,.2);
        border-radius: 20px;
        font-size: 11px; font-weight: 500;
        color: rgba(255,180,60,.9); letter-spacing: .5px;
        margin-bottom: 20px;
      }
      .badge-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #ffaa00; box-shadow: 0 0 6px #ffaa00;
        animation: pdot 1.8s ease-in-out infinite;
      }
      @keyframes pdot { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.3;transform:scale(.7);} }

      /* ── code block ── */
      .ua-code {
        font-family: 'DM Sans', monospace;
        font-size: clamp(64px, 14vw, 96px);
        font-weight: 800;
        font-family: 'Syne', sans-serif;
        line-height: 1;
        letter-spacing: -4px;
        background: linear-gradient(135deg, #ffaa00 0%, #ff6600 55%, #ff3366 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        filter: drop-shadow(0 0 36px rgba(255,160,0,.3));
        display: block;
        margin-bottom: 4px;
        user-select: none;
      }

      /* ── title / sub ── */
      .ua-title {
        font-family: 'Syne', sans-serif;
        font-size: 21px; font-weight: 800;
        color: #fff; letter-spacing: -.3px;
        margin-bottom: 8px;
      }
      .ua-sub {
        font-size: 13.5px; color: rgba(255,255,255,.32);
        font-weight: 300; line-height: 1.75;
        margin-bottom: 32px;
      }

      /* ── access-denied ticker ── */
      .ticker-wrap {
        overflow: hidden;
        border: 1px solid rgba(255,160,0,.12);
        border-radius: 8px;
        background: rgba(255,160,0,.04);
        padding: 8px 0;
        margin-bottom: 28px;
        position: relative;
      }
      .ticker-wrap::before, .ticker-wrap::after {
        content: '';
        position: absolute; top: 0; bottom: 0; width: 32px; z-index: 1;
      }
      .ticker-wrap::before { left: 0;  background: linear-gradient(90deg,  rgba(5,5,8,.9), transparent); }
      .ticker-wrap::after  { right: 0; background: linear-gradient(-90deg, rgba(5,5,8,.9), transparent); }
      .ticker-track {
        display: flex; gap: 40px;
        animation: ticker 14s linear infinite;
        white-space: nowrap;
        width: max-content;
      }
      @keyframes ticker { from{transform:translateX(0);}to{transform:translateX(-50%);} }
      .ticker-item {
        font-size: 10.5px; letter-spacing: 1.5px; font-weight: 500;
        color: rgba(255,160,0,.45);
        display: inline-flex; align-items: center; gap: 8px;
      }
      .ticker-sep { color: rgba(255,160,0,.2); }

      /* ── info pills ── */
      .info-pills {
        display: flex; gap: 8px; justify-content: center;
        flex-wrap: wrap; margin-bottom: 28px;
      }
      .info-pill {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 5px 11px;
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 20px;
        font-size: 11.5px; color: rgba(255,255,255,.3);
      }
      .pill-dot { width: 5px; height: 5px; border-radius: 50%; }

      /* ── divider ── */
      .ua-divider {
        display: flex; align-items: center; gap: 14px;
        color: rgba(255,255,255,.15); font-size: 11px; letter-spacing: 1px;
        margin-bottom: 20px;
      }
      .ua-divider::before, .ua-divider::after {
        content: ''; flex: 1; height: 1px; background: rgba(255,255,255,.07);
      }

      /* ── primary btn ── */
      .ua-btn-primary {
        background: linear-gradient(135deg, #ffaa00 0%, #ff6600 100%) !important;
        border: none !important;
        border-radius: 12px !important;
        color: #0a0800 !important;
        font-family: 'Syne', sans-serif !important;
        font-size: 14px !important; font-weight: 700 !important;
        position: relative; overflow: hidden;
        box-shadow: 0 4px 24px rgba(255,160,0,.25) !important;
        transition: transform .15s ease, box-shadow .3s ease !important;
        letter-spacing: .2px;
      }
      .ua-btn-primary:hover {
        transform: translateY(-1px);
        color: #0a0800 !important;
        box-shadow: 0 8px 32px rgba(255,160,0,.4) !important;
      }
      .ua-btn-primary:active { transform: translateY(0); }
      .btn-shimmer {
        position: absolute; inset: 0;
        background: linear-gradient(105deg,transparent 30%,rgba(255,255,255,.28) 50%,transparent 70%);
        transform: translateX(-100%);
        animation: shimmer 2.8s ease-in-out infinite;
      }
      @keyframes shimmer { 0%{transform:translateX(-100%);}40%,100%{transform:translateX(210%);} }

      /* ── ghost btn ── */
      .ua-btn-ghost {
        background: rgba(255,255,255,.04) !important;
        border: 1px solid rgba(255,255,255,.08) !important;
        border-radius: 12px !important;
        color: rgba(255,255,255,.45) !important;
        font-family: 'DM Sans', sans-serif !important;
        font-size: 13.5px !important;
        transition: all .2s !important;
      }
      .ua-btn-ghost:hover {
        background: rgba(255,255,255,.08) !important;
        border-color: rgba(255,255,255,.14) !important;
        color: rgba(255,255,255,.75) !important;
      }

      /* ── status row ── */
      .status-row {
        display: flex; align-items: center; justify-content: center;
        gap: 18px; margin-top: 24px; padding-top: 20px;
        border-top: 1px solid rgba(255,255,255,.05);
      }
      .status-item {
        display: flex; align-items: center; gap: 5px;
        font-size: 11px; color: rgba(255,255,255,.18);
      }
      .status-dot-green  { width:5px;height:5px;border-radius:50%;background:#00ff8c;box-shadow:0 0 5px #00ff8c; }
      .status-dot-amber  { width:5px;height:5px;border-radius:50%;background:#ffaa00;box-shadow:0 0 5px #ffaa00; }

      /* ── particles ── */
      .particles { position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:28px; }
      .particle  {
        position:absolute;width:2px;height:2px;border-radius:50%;
        background:rgba(255,160,0,.5);
        animation:float-p var(--dur) ease-in-out infinite var(--delay);
      }
      @keyframes float-p {
        0%  {transform:translate(0,0) scale(1);opacity:.7;}
        50% {transform:translate(var(--dx),var(--dy)) scale(1.6);opacity:.2;}
        100%{transform:translate(0,0) scale(1);opacity:.7;}
      }

      /* ── fade-up ── */
      @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
      .fu {animation:fadeUp .5s cubic-bezier(.4,0,.2,1) both;}
      .d1{animation-delay:.06s}.d2{animation-delay:.13s}.d3{animation-delay:.20s}
      .d4{animation-delay:.27s}.d5{animation-delay:.34s}.d6{animation-delay:.42s}
      .d7{animation-delay:.50s}
    `;
    if (!document.getElementById('ua-custom')) document.head.appendChild(style);
    return () => {
      const s = document.getElementById('ua-custom');
      if (s) s.remove();
    };
  }, []);

  /* mouse tracking */
  useEffect(() => {
    const handler = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  /* card glow tracking */
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setGlowPos({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  };

  /* pulse ring trigger */
  useEffect(() => {
    const id = setInterval(() => {
      setPulseRing(true);
      setTimeout(() => setPulseRing(false), 100);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  /* particles */
  const particles = Array.from({ length: 16 }, (_, i) => ({
    id: i,
    left: `${8 + Math.random() * 84}%`,
    top: `${8 + Math.random() * 84}%`,
    dur: `${3 + Math.random() * 5}s`,
    delay: `${-Math.random() * 5}s`,
    dx: `${(Math.random() - 0.5) * 38}px`,
    dy: `${(Math.random() - 0.5) * 38}px`,
  }));

  /* ticker items — duplicated for seamless loop */
  const tickerItems = [
    'ACCESS DENIED',
    'UNAUTHORIZED',
    'AUTH REQUIRED',
    'TOKEN EXPIRED',
    'FORBIDDEN',
    'RESTRICTED AREA',
  ];
  const doubled = [...tickerItems, ...tickerItems];

  const infoPills = [
    { label: 'Status 401', color: '#ffaa00' },
    { label: 'Auth Required', color: '#ff6600' },
    { label: 'Token Missing', color: 'rgba(255,255,255,.2)' },
  ];

  return (
    <div className="ua-root">
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
      <div ref={cardRef} className="ua-card card" onMouseMove={handleMouseMove}>
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

        {/* mouse-track glow */}
        <div
          className="card-glow"
          style={{
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(255,160,0,.08) 0%, transparent 65%)`,
          }}
        />

        {/* ── badge ── */}
        <div className="fu">
          <span className="ua-badge">
            <span className="badge-dot" /> UNAUTHORIZED ACCESS
          </span>
        </div>

        {/* ── lock icon ── */}
        <div className="lock-wrap fu d1">
          <div className="pulse-ring" />
          <div className="pulse-ring" />
          <div className="pulse-ring" />
          <div className="lock-hex">
            <div className="scan-line" />
            <svg
              className="lock-icon"
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,160,0,0.85)"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        {/* ── 401 code ── */}
        <div className="fu d2">
          <span className="ua-code">401</span>
        </div>

        {/* ── title + sub ── */}
        <div className="fu d3">
          <h1 className="ua-title">Access Denied</h1>
          <p className="ua-sub">
            You don't have permission to view this page.
            <br />
            Please sign in with an authorized account
            <br />
            or contact your administrator.
          </p>
        </div>

        {/* ── scrolling ticker ── */}
        <div className="ticker-wrap fu d4">
          <div className="ticker-track">
            {doubled.map((item, i) => (
              <span key={i} className="ticker-item">
                {item}
                {i < doubled.length - 1 && (
                  <span className="ticker-sep">·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* ── info pills ── */}
        <div className="info-pills fu d4">
          {infoPills.map((p) => (
            <span key={p.label} className="info-pill">
              <span
                className="pill-dot"
                style={{ background: p.color, boxShadow: `0 0 5px ${p.color}` }}
              />
              {p.label}
            </span>
          ))}
        </div>

        {/* ── divider ── */}
        <div className="ua-divider fu d5">WHAT WOULD YOU LIKE TO DO?</div>

        {/* ── action buttons ── */}
        <div className="row g-2 fu d5">
          <div className="col-12">
            <a
              href="/login"
              className="btn ua-btn-primary w-100 py-3 text-decoration-none"
            >
              <div className="btn-shimmer" />
              🔑 Sign In to Continue
            </a>
          </div>
          <div className="col-6">
            <a
              href="/"
              className="btn ua-btn-ghost w-100 py-2 text-decoration-none"
            >
              ← Home
            </a>
          </div>
          <div className="col-6">
            <a
              href="/register"
              className="btn ua-btn-ghost w-100 py-2 text-decoration-none"
            >
              Register
            </a>
          </div>
        </div>

        {/* ── status row ── */}
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
            <span className="status-dot-amber" /> Auth Failed
          </div>
          <div
            className="status-item"
            style={{ color: 'rgba(255,255,255,.1)' }}
          >
            ·
          </div>
          <div className="status-item">Error 401</div>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
