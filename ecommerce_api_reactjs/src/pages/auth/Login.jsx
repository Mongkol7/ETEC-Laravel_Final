import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login as loginRequest } from '../../services/authService'
import useAuth from '../../hooks/useAuth'

const Login = () => {
  const [formData, setFormData]         = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember]         = useState(false)
  const [loading, setLoading]           = useState(false)
  const [shake, setShake]               = useState(false)
  const [glowPos, setGlowPos]           = useState({ x: 50, y: 50 })
  const cardRef = useRef(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Bootstrap 5 CDN
    if (!document.getElementById('bs-css')) {
      const link = document.createElement('link')
      link.id   = 'bs-css'
      link.rel  = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css'
      document.head.appendChild(link)
    }

    const style = document.createElement('style')
    style.id = 'login-custom'
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

      body { margin: 0; }

      .login-root {
        min-height: 100vh;
        background: #050508;
        font-family: 'DM Sans', sans-serif;
        overflow: hidden;
        position: relative;
      }

      .orb {
        position: absolute; border-radius: 50%;
        filter: blur(80px); pointer-events: none;
        animation: drift 9s ease-in-out infinite;
      }
      .orb-1 {
        width: 500px; height: 500px;
        background: radial-gradient(circle, rgba(0,255,140,.18) 0%, transparent 70%);
        top: -120px; left: -120px;
      }
      .orb-2 {
        width: 400px; height: 400px;
        background: radial-gradient(circle, rgba(0,180,255,.14) 0%, transparent 70%);
        bottom: -80px; right: -80px; animation-duration: 11s; animation-delay: -3s;
      }
      .orb-3 {
        width: 300px; height: 300px;
        background: radial-gradient(circle, rgba(120,0,255,.10) 0%, transparent 70%);
        top: 40%; left: 60%; animation-duration: 13s; animation-delay: -6s;
      }
      @keyframes drift {
        0%,100% { transform: translate(0,0) scale(1); }
        33%      { transform: translate(30px,-20px) scale(1.05); }
        66%      { transform: translate(-20px,15px) scale(.97); }
      }

      .grid-bg {
        position: absolute; inset: 0; pointer-events: none;
        background-image:
          linear-gradient(rgba(0,255,140,.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,140,.03) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      /* glass card */
      .login-card {
        position: relative; overflow: hidden;
        background: rgba(255,255,255,.028) !important;
        border: 1px solid rgba(255,255,255,.08) !important;
        border-radius: 28px !important;
        backdrop-filter: blur(40px) saturate(160%);
        -webkit-backdrop-filter: blur(40px) saturate(160%);
        box-shadow:
          0 0 0 1px rgba(255,255,255,.04) inset,
          0 32px 80px rgba(0,0,0,.6),
          0 0 80px rgba(0,255,140,.04);
      }
      .card-glow {
        position: absolute; inset: 0; pointer-events: none;
        border-radius: 28px; opacity: .6;
      }

      .shake { animation: shake .4s cubic-bezier(.36,.07,.19,.97) both; }
      @keyframes shake {
        10%,90% { transform: translateX(-2px); }
        20%,80% { transform: translateX(4px); }
        30%,50%,70% { transform: translateX(-5px); }
        40%,60% { transform: translateX(5px); }
      }

      .login-badge {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 5px 12px 5px 8px;
        background: rgba(0,255,140,.08);
        border: 1px solid rgba(0,255,140,.2);
        border-radius: 20px;
        font-size: 11px; font-weight: 500;
        color: rgba(0,255,140,.9); letter-spacing: .5px;
      }
      .badge-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: #00ff8c; box-shadow: 0 0 6px #00ff8c;
        animation: pulse-dot 2s ease-in-out infinite;
      }
      @keyframes pulse-dot {
        0%,100% { opacity:1; transform:scale(1); }
        50%      { opacity:.5; transform:scale(.8); }
      }

      .login-title {
        font-family: 'Syne', sans-serif;
        font-size: 32px; font-weight: 800;
        color: #fff; line-height: 1.1; letter-spacing: -.5px;
      }
      .login-title span {
        background: linear-gradient(135deg,#00ff8c 0%,#00c9ff 100%);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .login-label {
        font-size: 11.5px; font-weight: 500;
        color: rgba(255,255,255,.4) !important;
        letter-spacing: .8px; text-transform: uppercase;
      }

      .login-input {
        background: rgba(255,255,255,.04) !important;
        border: 1px solid rgba(255,255,255,.08) !important;
        border-radius: 12px !important;
        color: #fff !important;
        font-family: 'DM Sans', sans-serif !important;
        font-size: 14.5px !important;
        transition: all .25s ease !important;
        -webkit-text-fill-color: #fff !important;
      }
      .login-input::placeholder { color: rgba(255,255,255,.25) !important; }
      .login-input:focus {
        background: rgba(255,255,255,.07) !important;
        border-color: rgba(0,255,140,.5) !important;
        box-shadow: 0 0 0 3px rgba(0,255,140,.1) !important;
        color: #fff !important;
      }

      /* password input-group */
      .pw-group .login-input {
        border-right: none !important;
        border-radius: 12px 0 0 12px !important;
      }
      .pw-toggle {
        background: rgba(255,255,255,.04) !important;
        border: 1px solid rgba(255,255,255,.08) !important;
        border-left: none !important;
        border-radius: 0 12px 12px 0 !important;
        color: rgba(255,255,255,.3) !important;
        cursor: pointer; transition: color .2s;
        display: flex; align-items: center; padding: 0 14px;
      }
      .pw-toggle:hover { color: rgba(255,255,255,.7) !important; }
      .login-input:focus ~ .pw-toggle {
        border-color: rgba(0,255,140,.5) !important;
      }

      .custom-check-box {
        width: 17px; height: 17px; flex-shrink: 0;
        border-radius: 5px;
        border: 1.5px solid rgba(255,255,255,.15);
        background: rgba(255,255,255,.04);
        display: flex; align-items: center; justify-content: center;
        transition: all .2s; cursor: pointer;
      }
      .custom-check-box.checked {
        background: rgba(0,255,140,.15);
        border-color: rgba(0,255,140,.6);
      }

      .forgot-link {
        font-size: 13px; color: rgba(0,255,140,.75);
        background: none; border: none; cursor: pointer;
        font-family: 'DM Sans', sans-serif; padding: 0;
        transition: color .2s;
      }
      .forgot-link:hover { color: #00ff8c; }

      .login-btn {
        background: linear-gradient(135deg,#00ff8c 0%,#00d4aa 50%,#00a8ff 100%) !important;
        border: none !important;
        border-radius: 12px !important;
        color: #050508 !important;
        font-family: 'Syne', sans-serif !important;
        font-size: 15px !important; font-weight: 700 !important;
        position: relative; overflow: hidden;
        box-shadow: 0 4px 24px rgba(0,255,140,.25) !important;
        transition: transform .15s ease, box-shadow .3s ease !important;
      }
      .login-btn:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 8px 32px rgba(0,255,140,.4) !important;
        color: #050508 !important;
      }
      .login-btn:active:not(:disabled) { transform: translateY(0); }
      .login-btn:disabled { opacity: .7 !important; cursor: not-allowed; }

      .btn-shimmer {
        position: absolute; inset: 0;
        background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,.35) 50%, transparent 70%);
        transform: translateX(-100%);
        animation: shimmer 2.5s ease-in-out infinite;
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        40%,100% { transform: translateX(200%); }
      }

      .login-divider {
        display: flex; align-items: center; gap: 14px;
        color: rgba(255,255,255,.2); font-size: 12px; letter-spacing: 1px;
      }
      .login-divider::before, .login-divider::after {
        content: ''; flex: 1; height: 1px;
        background: rgba(255,255,255,.07);
      }

      .social-btn {
        display: flex !important; align-items: center; justify-content: center; gap: 8px;
        background: rgba(255,255,255,.04) !important;
        border: 1px solid rgba(255,255,255,.08) !important;
        border-radius: 10px !important;
        color: rgba(255,255,255,.55) !important;
        font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
        transition: all .2s !important;
      }
      .social-btn:hover {
        background: rgba(255,255,255,.09) !important;
        border-color: rgba(255,255,255,.18) !important;
        color: rgba(255,255,255,.85) !important;
      }

      .register-link {
        color: rgba(0,255,140,.8); font-weight: 500;
        background: none; border: none; cursor: pointer;
        font-family: 'DM Sans', sans-serif; font-size: inherit;
        padding: 0; transition: color .2s;
      }
      .register-link:hover { color: #00ff8c; }

      @keyframes fadeUp {
        from { opacity:0; transform:translateY(18px); }
        to   { opacity:1; transform:translateY(0); }
      }
      .fade-up { animation: fadeUp .5s cubic-bezier(.4,0,.2,1) both; }
      .d1{animation-delay:.05s} .d2{animation-delay:.12s} .d3{animation-delay:.18s}
      .d4{animation-delay:.24s} .d5{animation-delay:.30s} .d6{animation-delay:.36s}
      .d7{animation-delay:.42s}

      .btn-spinner {
        width:16px; height:16px; display:inline-block;
        border:2px solid rgba(5,5,8,.3); border-top-color:#050508;
        border-radius:50%; animation:spin .7s linear infinite;
      }
      @keyframes spin { to { transform:rotate(360deg); } }
    `
    document.head.appendChild(style)
    return () => { const s = document.getElementById('login-custom'); if (s) s.remove() }
  }, [])

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const r = cardRef.current.getBoundingClientRect()
    setGlowPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email || !formData.password) { setShake(true); setTimeout(() => setShake(false), 500); return }

    setLoading(true)

    try {
      const response = await loginRequest(formData)
      const token = response.data?.token || response.data?.access_token

      if (token) {
        const user = response.data?.user
        login({ token, user })

        if (user?.role === 'admin') {
          navigate('/admin', { replace: true })
        } else {
          navigate('/home', { replace: true })
        }
      }

      console.log('Login success:', response.data)
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }

  const EyeIcon = ({ open }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (<>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>) : (<>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>)}
    </svg>
  )

  const GoogleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 12 4.9c1.76 0 3.35.65 4.58 1.7l3.4-3.4A11.95 11.95 0 0 0 12 1C8.2 1 4.88 3.03 3.01 6.06l2.26 3.7z"/>
      <path fill="#34A853" d="M16.04 18.01A7.07 7.07 0 0 1 12 19.1c-2.88 0-5.38-1.72-6.6-4.23l-3.54 2.74A11.96 11.96 0 0 0 12 23c3.58 0 6.8-1.41 9.17-3.72l-5.13-1.27z"/>
      <path fill="#FBBC05" d="M5.4 14.87A7.1 7.1 0 0 1 4.9 12c0-1.01.17-1.98.5-2.88L3.13 5.42A11.92 11.92 0 0 0 1 12c0 1.97.48 3.83 1.33 5.47l3.07-2.6z"/>
      <path fill="#4285F4" d="M23 12c0-.7-.06-1.38-.18-2.04H12v3.86h6.19a5.3 5.3 0 0 1-2.29 3.47l5.13 1.27C22.19 16.95 23 14.61 23 12z"/>
    </svg>
  )

  const GithubIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1A11 11 0 0 0 1 12c0 4.86 3.15 8.98 7.52 10.43.55.1.75-.24.75-.53v-1.85c-3.06.66-3.71-1.47-3.71-1.47-.5-1.27-1.22-1.61-1.22-1.61-1-.68.07-.67.07-.67 1.1.08 1.68 1.14 1.68 1.14.98 1.68 2.57 1.19 3.2.91.1-.71.38-1.19.7-1.46-2.44-.28-5.01-1.22-5.01-5.44 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.4.11-2.91 0 0 .92-.3 3.02 1.13a10.5 10.5 0 0 1 5.5 0c2.1-1.42 3.02-1.13 3.02-1.13.6 1.51.22 2.63.11 2.91.7.77 1.13 1.75 1.13 2.95 0 4.23-2.58 5.16-5.03 5.43.4.34.74 1.01.74 2.04v3.02c0 .29.2.63.75.52A11 11 0 0 0 23 12 11 11 0 0 0 12 1z"/>
    </svg>
  )

  return (
    <div className="login-root d-flex align-items-center justify-content-center">
      <div className="grid-bg" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div
        ref={cardRef}
        className={`login-card card p-5 ${shake ? 'shake' : ''}`}
        style={{ width: 420, zIndex: 10 }}
        onMouseMove={handleMouseMove}
      >
        <div className="card-glow" style={{
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(0,255,140,.07) 0%, transparent 65%)`
        }} />

        {/* Badge */}
        <div className="fade-up mb-4">
          <span className="login-badge">
            <span className="badge-dot" /> SECURE ACCESS
          </span>
        </div>

        {/* Heading */}
        <div className="fade-up d1 mb-4">
          <h1 className="login-title mb-1">Welcome<br /><span>back.</span></h1>
          <p className="mb-0" style={{ fontSize: 14, color: 'rgba(255,255,255,.35)', fontWeight: 300 }}>
            Sign in to continue your session
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>

          {/* Email */}
          <div className="mb-3 fade-up d2">
            <label className="login-label form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control login-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="mb-2 fade-up d3">
            <label className="login-label form-label">Password</label>
            <div className="input-group pw-group">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control login-input"
                placeholder="••••••••••"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <span className="pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                <EyeIcon open={showPassword} />
              </span>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="d-flex align-items-center justify-content-between mb-4 fade-up d4">
            <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}
              onClick={() => setRemember(!remember)}>
              <div className={`custom-check-box ${remember ? 'checked' : ''}`}>
                {remember && (
                  <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4.2 7.5L8 3" stroke="#00ff8c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>Remember me</span>
            </div>
            <button type="button" className="forgot-link">Forgot password?</button>
          </div>

          {/* Submit */}
          <div className="fade-up d5">
            <button type="submit" className="btn login-btn w-100 py-3" disabled={loading}>
              <div className="btn-shimmer" />
              {loading
                ? <span className="d-inline-flex align-items-center gap-2">
                    <span className="btn-spinner" /> Signing in...
                  </span>
                : 'Sign In'
              }
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="login-divider my-4 fade-up d6">OR</div>

        {/* Social */}
        <div className="row g-2 mb-4 fade-up d6">
          <div className="col-6">
            <button type="button" className="btn social-btn w-100 py-2">
              <GoogleIcon /> Google
            </button>
          </div>
          <div className="col-6">
            <button type="button" className="btn social-btn w-100 py-2">
              <GithubIcon /> GitHub
            </button>
          </div>
        </div>

        {/* Register */}
        <p className="text-center mb-0 fade-up d7"
          style={{ fontSize: 13.5, color: 'rgba(255,255,255,.3)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="register-link text-decoration-none">Create one</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
