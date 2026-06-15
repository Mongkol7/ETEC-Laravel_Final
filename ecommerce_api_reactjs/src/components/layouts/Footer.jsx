import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const footerStyle = {
  position: 'relative',
  overflow: 'hidden',
  background: 'rgba(5,5,8,0.97)',
  borderTop: '1px solid rgba(255,255,255,0.07)',
  fontFamily: "'DM Sans', 'Outfit', sans-serif",
};

const orbStyle = (color, w, top, left, right, bottom, delay) => ({
  position: 'absolute',
  borderRadius: '50%',
  filter: 'blur(90px)',
  pointerEvents: 'none',
  width: w,
  height: w,
  background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
  top,
  left,
  right,
  bottom,
  opacity: 0.5,
  animation: `drift ${12 + delay}s ease-in-out infinite`,
  animationDelay: `${-delay}s`,
});

const SocialIcon = ({ href, label, children }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: hovered ? 'rgba(0,255,140,0.12)' : 'rgba(255,255,255,0.04)',
        border: hovered ? '1px solid rgba(0,255,140,0.35)' : '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: hovered ? '#00ff8c' : 'rgba(255,255,255,0.4)',
        transition: 'all 0.2s ease',
        flexShrink: 0,
        boxShadow: hovered ? '0 0 16px rgba(0,255,140,0.2)' : 'none',
        textDecoration: 'none',
      }}
    >
      {children}
    </a>
  );
};

const NavLink = ({ to, children }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <li style={{ listStyle: 'none' }}>
      <Link
        to={to}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13.5,
          color: hovered ? '#00ff8c' : 'rgba(255,255,255,0.4)',
          textDecoration: 'none',
          transition: 'color 0.2s ease',
          padding: '3px 0',
        }}
      >
        <span style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: '#00ff8c',
          boxShadow: '0 0 6px #00ff8c',
          flexShrink: 0,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s',
        }} />
        {children}
      </Link>
    </li>
  );
};

function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <footer style={footerStyle}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes drift {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(28px,-18px) scale(1.04); }
          66%      { transform: translate(-18px,16px) scale(.96); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .footer-link-plain {
          font-size: 12.5px;
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .footer-link-plain:hover { color: #00ff8c; }

        .footer-subscribe-btn {
          padding: 10px 18px;
          border-radius: 11px;
          border: none;
          background: linear-gradient(135deg, #00ff8c, #00c9ff);
          color: #050508;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          white-space: nowrap;
          transition: transform 0.15s ease, box-shadow 0.2s ease;
          flex-shrink: 0;
        }
        .footer-subscribe-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,255,140,0.35);
        }

        .footer-email-input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 11px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.045);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          outline: none;
          -webkit-text-fill-color: #fff;
          transition: all 0.2s;
          min-width: 0;
        }
        .footer-email-input::placeholder { color: rgba(255,255,255,0.22); }
        .footer-email-input:focus {
          border-color: rgba(0,255,140,0.4);
          box-shadow: 0 0 0 3px rgba(0,255,140,0.08);
          background: rgba(255,255,255,0.07);
        }

        .footer-contact-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 13.5px;
        }

        .footer-col-title {
          font-family: 'Syne', sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          color: rgba(255,255,255,0.35);
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-bottom: 18px;
        }

        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
          .footer-bottom-row { flex-direction: column !important; text-align: center; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Ambient orbs */}
      <div style={orbStyle('rgba(0,255,140,0.12)', '480px', '-160px', '-120px', undefined, undefined, 0)} />
      <div style={orbStyle('rgba(0,180,255,0.09)', '380px', undefined, undefined, '-100px', '-100px', 5)} />
      <div style={orbStyle('rgba(130,0,255,0.06)', '300px', '40%', '35%', undefined, undefined, 8)} />

      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '60px 28px 0',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* ── Top 4-column grid ── */}
        <div
          className="footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 40,
            marginBottom: 48,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 13,
                background: 'linear-gradient(135deg, #00ff8c, #00c9ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 20px rgba(0,255,140,0.3)',
              }}>
                {/* Phone icon */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#050508" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5" />
                </svg>
              </div>
              <span style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 17,
                color: '#fff',
                letterSpacing: '-0.3px',
              }}>
                MK<span style={{
                  background: 'linear-gradient(135deg, #00ff8c, #00c9ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>7</span>
              </span>
            </div>

            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.75, marginBottom: 22 }}>
              Your premier destination for next-gen smartphones, accessories, and wearables — engineered for performance, built to last.
            </p>

            {/* Social icons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <SocialIcon href="https://facebook.com" label="Facebook">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://twitter.com" label="Twitter / X">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://instagram.com" label="Instagram">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </SocialIcon>
              <SocialIcon href="https://linkedin.com" label="LinkedIn">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </SocialIcon>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="footer-col-title">Quick Links</p>
            <ul style={{ padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/shop">All Phones</NavLink>
              <NavLink to="/categories">Categories</NavLink>
              <NavLink to="/bestsellers">Best Sellers</NavLink>
              <NavLink to="/new-arrivals">New Arrivals</NavLink>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <p className="footer-col-title">Customer Service</p>
            <ul style={{ padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <NavLink to="/orders">My Orders</NavLink>
              <NavLink to="/cart">Shopping Cart</NavLink>
              <NavLink to="/favourite">Wishlist</NavLink>
              <NavLink to="/help">Help Center</NavLink>
              <NavLink to="/shipping">Shipping Info</NavLink>
              <NavLink to="/returns">Returns &amp; Warranty</NavLink>
            </ul>
          </div>

          {/* Stay Connected */}
          <div>
            <p className="footer-col-title">Stay Connected</p>

            {/* Email */}
            <div className="footer-contact-row" style={{ marginBottom: 14 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0, marginTop: 2,
                background: 'rgba(0,255,140,0.08)', border: '1px solid rgba(0,255,140,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff8c',
              }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 3px' }}>Email</p>
                <a href="mailto:support@mk7store.com" className="footer-link-plain" style={{ fontSize: 13 }}>
                  support@mk7store.com
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="footer-contact-row" style={{ marginBottom: 22 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9, flexShrink: 0, marginTop: 2,
                background: 'rgba(0,200,255,0.08)', border: '1px solid rgba(0,200,255,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00c9ff',
              }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.8px', textTransform: 'uppercase', margin: '0 0 3px' }}>Phone</p>
                <a href="tel:+1234567890" className="footer-link-plain" style={{ fontSize: 13 }}>
                  +1 (234) 567-890
                </a>
              </div>
            </div>

            {/* Newsletter */}
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 10, lineHeight: 1.5 }}>
              Get early access to new MK7 drops and exclusive deals.
            </p>
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                className="footer-email-input"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="footer-subscribe-btn">
                {subscribed ? '✓' : 'Join'}
              </button>
            </form>
            {subscribed && (
              <p style={{ fontSize: 12, color: '#00ff8c', marginTop: 8, animation: 'fadeUp 0.3s ease both' }}>
                🎉 You're subscribed!
              </p>
            )}
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />

        {/* ── Bottom bar ── */}
        <div
          className="footer-bottom-row"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, paddingBottom: 24 }}
        >
          <div>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.25)', margin: 0 }}>
              © {currentYear} MK7 Store. All rights reserved.
            </p>
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.15)', margin: '4px 0 0' }}>
              Built for people who move fast 📱
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/privacy" className="footer-link-plain">Privacy Policy</a>
            <span style={{ color: 'rgba(255,255,255,0.12)' }}>•</span>
            <a href="/terms" className="footer-link-plain">Terms of Service</a>
            <span style={{ color: 'rgba(255,255,255,0.12)' }}>•</span>
            <a href="/cookies" className="footer-link-plain">Cookie Policy</a>
          </div>
        </div>

        {/* ── Developer credit ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '16px 0 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}>
          <svg width="14" height="14" fill="none" stroke="rgba(0,255,140,0.7)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.25)' }}>Developed by</span>
          <a
            href="mailto:thoeungsereymongkol@gmail.com"
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: '#00ff8c',
              textDecoration: 'none',
              fontFamily: "'Syne', sans-serif",
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = '#00c9ff'}
            onMouseLeave={e => e.target.style.color = '#00ff8c'}
          >
            Sereymongkol Thoeung
          </a>
          <span style={{ color: 'rgba(255,255,255,0.12)' }}>•</span>
          <a
            href="mailto:thoeungsereymongkol@gmail.com"
            className="footer-link-plain"
            style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            thoeungsereymongkol@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;