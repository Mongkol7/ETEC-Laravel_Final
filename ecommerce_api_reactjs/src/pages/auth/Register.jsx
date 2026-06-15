import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { register } from '../../services/authService'

// ─── match Laravel register() exactly ───────────────────────────────────────
// name     : required|string|max:255
// email    : required|string|email|max:255|unique:users
// password : required|string|min:3
// image    : nullable|image  (multipart/form-data → Cloudinary)
// ────────────────────────────────────────────────────────────────────────────

const Register = () => {
  /* form state — keys match Laravel field names */
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [image,    setImage]    = useState(null)   // File object
  const [preview,  setPreview]  = useState(null)   // data-URL for preview

  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [shake,    setShake]    = useState(false)
  const [glowPos,  setGlowPos]  = useState({ x: 50, y: 50 })

  /* response feedback */
  const [apiMsg,   setApiMsg]   = useState(null)   // { type: 'success'|'error'|'warning', text }

  /* validation errors (mirror Laravel messages) */
  const [errors, setErrors] = useState({})

  const cardRef    = useRef(null)
  const fileRef    = useRef(null)

  /* ── styles ── */
  useEffect(() => {
    if (!document.getElementById('bs-css')) {
      const link = document.createElement('link')
      link.id = 'bs-css'; link.rel = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css'
      document.head.appendChild(link)
    }
    const style = document.createElement('style')
    style.id = 'reg-custom'
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
      body { margin:0; }

      .reg-root {
        min-height:100vh; background:#050508;
        font-family:'DM Sans',sans-serif;
        overflow-x:hidden; position:relative;
      }

      /* orbs */
      .orb { position:absolute; border-radius:50%; filter:blur(90px); pointer-events:none; animation:drift 9s ease-in-out infinite; }
      .orb-1 { width:520px;height:520px; background:radial-gradient(circle,rgba(0,255,140,.15) 0%,transparent 70%); top:-140px;right:-100px; animation-duration:10s; }
      .orb-2 { width:420px;height:420px; background:radial-gradient(circle,rgba(0,140,255,.12) 0%,transparent 70%); bottom:-100px;left:-80px; animation-duration:12s;animation-delay:-4s; }
      .orb-3 { width:280px;height:280px; background:radial-gradient(circle,rgba(180,0,255,.08) 0%,transparent 70%); top:35%;left:55%; animation-duration:14s;animation-delay:-7s; }
      @keyframes drift {
        0%,100%{ transform:translate(0,0) scale(1); }
        33%    { transform:translate(-26px,20px) scale(1.04); }
        66%    { transform:translate(20px,-14px) scale(.96); }
      }

      .grid-bg {
        position:absolute;inset:0;pointer-events:none;
        background-image:linear-gradient(rgba(0,255,140,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,140,.025) 1px,transparent 1px);
        background-size:40px 40px;
      }

      /* card */
      .reg-card {
        position:relative;overflow:hidden;
        background:rgba(255,255,255,.026) !important;
        border:1px solid rgba(255,255,255,.08) !important;
        border-radius:28px !important;
        backdrop-filter:blur(44px) saturate(160%);
        -webkit-backdrop-filter:blur(44px) saturate(160%);
        box-shadow:0 0 0 1px rgba(255,255,255,.04) inset,0 40px 90px rgba(0,0,0,.65),0 0 80px rgba(0,255,140,.03);
      }
      .card-glow { position:absolute;inset:0;pointer-events:none;border-radius:28px;opacity:.55; }

      /* shake */
      .shake { animation:shk .4s cubic-bezier(.36,.07,.19,.97) both; }
      @keyframes shk {
        10%,90%     { transform:translateX(-2px); }
        20%,80%     { transform:translateX(4px); }
        30%,50%,70% { transform:translateX(-5px); }
        40%,60%     { transform:translateX(5px); }
      }

      /* badge */
      .reg-badge {
        display:inline-flex;align-items:center;gap:6px;
        padding:5px 12px 5px 8px;
        background:rgba(0,255,140,.07);border:1px solid rgba(0,255,140,.18);
        border-radius:20px;font-size:11px;font-weight:500;
        color:rgba(0,255,140,.9);letter-spacing:.5px;
      }
      .badge-dot {
        width:6px;height:6px;border-radius:50%;
        background:#00ff8c;box-shadow:0 0 6px #00ff8c;
        animation:pdot 2s ease-in-out infinite;
      }
      @keyframes pdot { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.4;transform:scale(.75);} }

      /* title */
      .reg-title { font-family:'Syne',sans-serif;font-size:30px;font-weight:800;color:#fff;line-height:1.1;letter-spacing:-.5px; }
      .reg-title span { background:linear-gradient(135deg,#00ff8c 0%,#00c9ff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }

      /* label */
      .reg-label { font-size:11px;font-weight:500;color:rgba(255,255,255,.38) !important;letter-spacing:.9px;text-transform:uppercase;margin-bottom:6px !important; }

      /* inputs */
      .reg-input {
        background:rgba(255,255,255,.042) !important;
        border:1px solid rgba(255,255,255,.08) !important;
        border-radius:12px !important;
        color:#fff !important;
        font-family:'DM Sans',sans-serif !important;
        font-size:14px !important;
        padding:12px 16px !important;
        transition:all .25s ease !important;
        -webkit-text-fill-color:#fff !important;
      }
      .reg-input::placeholder { color:rgba(255,255,255,.22) !important; }
      .reg-input:focus {
        background:rgba(255,255,255,.07) !important;
        border-color:rgba(0,255,140,.5) !important;
        box-shadow:0 0 0 3px rgba(0,255,140,.09) !important;
        color:#fff !important;
      }
      .reg-input.field-err { border-color:rgba(255,77,77,.55) !important;box-shadow:0 0 0 3px rgba(255,77,77,.07) !important; }
      .reg-input.field-ok  { border-color:rgba(0,255,140,.38) !important; }

      /* password input group */
      .pw-wrap .reg-input { border-right:none !important;border-radius:12px 0 0 12px !important; }
      .pw-eye {
        background:rgba(255,255,255,.042) !important;
        border:1px solid rgba(255,255,255,.08) !important;
        border-left:none !important;
        border-radius:0 12px 12px 0 !important;
        color:rgba(255,255,255,.28) !important;
        cursor:pointer;padding:0 14px;
        display:flex;align-items:center;transition:color .2s;
      }
      .pw-eye:hover { color:rgba(255,255,255,.65) !important; }

      /* password strength */
      .strength-track { height:3px;border-radius:3px;background:rgba(255,255,255,.07);overflow:hidden;margin-top:8px; }
      .strength-fill  { height:100%;border-radius:3px;transition:width .4s ease,background .4s ease; }

      /* avatar zone */
      .avatar-zone {
        width:76px;height:76px;border-radius:50%;flex-shrink:0;
        background:rgba(255,255,255,.05);
        border:1.5px dashed rgba(255,255,255,.15);
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;transition:all .25s;
        position:relative;overflow:hidden;
      }
      .avatar-zone:hover { background:rgba(0,255,140,.07);border-color:rgba(0,255,140,.35); }
      .avatar-zone img  { width:100%;height:100%;object-fit:cover;border-radius:50%; }
      .avatar-plus {
        position:absolute;bottom:0;right:0;
        width:22px;height:22px;border-radius:50%;
        background:rgba(0,255,140,.15);border:1px solid rgba(0,255,140,.35);
        display:flex;align-items:center;justify-content:center;
        font-size:14px;color:rgba(0,255,140,.8);line-height:1;
      }
      .avatar-remove {
        position:absolute;top:0;right:0;
        width:20px;height:20px;border-radius:50%;
        background:rgba(255,60,60,.5);border:none;
        color:#fff;font-size:11px;line-height:1;
        display:flex;align-items:center;justify-content:center;
        cursor:pointer;opacity:0;transition:opacity .2s;
      }
      .avatar-zone:hover .avatar-remove { opacity:1; }

      /* field hint */
      .field-hint { font-size:11.5px;margin-top:5px;color:rgba(255,255,255,.25); }
      .field-hint.err { color:rgba(255,100,100,.8); }
      .field-hint.ok  { color:rgba(0,255,140,.7); }

      /* api alert */
      .api-alert {
        border-radius:12px !important;font-size:13px;
        border:none !important;padding:11px 14px !important;
      }
      .api-success { background:rgba(0,255,140,.1) !important;color:rgba(0,255,140,.9) !important;border:1px solid rgba(0,255,140,.2) !important; }
      .api-error   { background:rgba(255,77,77,.1) !important;color:rgba(255,120,120,.9) !important;border:1px solid rgba(255,77,77,.2) !important; }
      .api-warning { background:rgba(255,170,0,.1) !important;color:rgba(255,200,80,.9) !important;border:1px solid rgba(255,170,0,.2) !important; }

      /* submit btn */
      .reg-btn {
        background:linear-gradient(135deg,#00ff8c 0%,#00d4aa 50%,#00a8ff 100%) !important;
        border:none !important;border-radius:12px !important;
        color:#050508 !important;font-family:'Syne',sans-serif !important;
        font-size:15px !important;font-weight:700 !important;
        position:relative;overflow:hidden;
        box-shadow:0 4px 24px rgba(0,255,140,.22) !important;
        transition:transform .15s ease,box-shadow .3s ease !important;
      }
      .reg-btn:hover:not(:disabled) { transform:translateY(-1px);color:#050508 !important;box-shadow:0 8px 32px rgba(0,255,140,.38) !important; }
      .reg-btn:disabled { opacity:.65 !important;cursor:not-allowed; }
      .btn-shimmer {
        position:absolute;inset:0;
        background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.3) 50%,transparent 70%);
        transform:translateX(-100%);animation:shimmer 2.6s ease-in-out infinite;
      }
      @keyframes shimmer { 0%{transform:translateX(-100%);}40%,100%{transform:translateX(210%);} }

      /* divider */
      .reg-divider { display:flex;align-items:center;gap:14px;color:rgba(255,255,255,.18);font-size:12px;letter-spacing:1px; }
      .reg-divider::before,.reg-divider::after { content:'';flex:1;height:1px;background:rgba(255,255,255,.07); }

      /* social */
      .social-btn {
        display:flex !important;align-items:center;justify-content:center;gap:8px;
        background:rgba(255,255,255,.04) !important;border:1px solid rgba(255,255,255,.08) !important;
        border-radius:10px !important;color:rgba(255,255,255,.5) !important;
        font-size:13px;font-weight:500;font-family:'DM Sans',sans-serif;transition:all .2s !important;
      }
      .social-btn:hover { background:rgba(255,255,255,.085) !important;border-color:rgba(255,255,255,.16) !important;color:rgba(255,255,255,.82) !important; }

      .login-link { color:rgba(0,255,140,.8);font-weight:500;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:inherit;padding:0;transition:color .2s; }
      .login-link:hover { color:#00ff8c; }

      /* spinner */
      .btn-spin { width:15px;height:15px;display:inline-block;border:2px solid rgba(5,5,8,.25);border-top-color:#050508;border-radius:50%;animation:spin .7s linear infinite; }
      @keyframes spin { to{transform:rotate(360deg);} }

      /* fade-up */
      @keyframes fadeUp { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
      .fu { animation:fadeUp .48s cubic-bezier(.4,0,.2,1) both; }
      .d1{animation-delay:.06s}.d2{animation-delay:.12s}.d3{animation-delay:.18s}
      .d4{animation-delay:.24s}.d5{animation-delay:.30s}.d6{animation-delay:.36s}
      .d7{animation-delay:.42s}.d8{animation-delay:.48s}

      .terms-link { color:rgba(0,200,255,.75);background:none;border:none;padding:0;cursor:pointer;font-size:inherit;font-family:inherit;transition:color .2s; }
      .terms-link:hover { color:#00c9ff; }

      /* image type hint */
      .img-hint { font-size:11px;color:rgba(255,255,255,.2);margin-top:4px; }
    `
    if (!document.getElementById('reg-custom')) document.head.appendChild(style)
    return () => { const s = document.getElementById('reg-custom'); if (s) s.remove() }
  }, [])

  /* ── mouse glow ── */
  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const r = cardRef.current.getBoundingClientRect()
    setGlowPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }

  /* ── image pick ── */
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // validate: must be image type (mirrors Laravel 'image' rule)
    if (!file.type.startsWith('image/')) {
      setErrors(ev => ({ ...ev, image: 'The image must be a valid image file.' }))
      return
    }
    setErrors(ev => { const n={...ev}; delete n.image; return n })
    setImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const removeImage = (e) => {
    e.stopPropagation()
    setImage(null); setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  /* ── client-side validation (mirrors Laravel rules) ── */
  const validate = () => {
    const errs = {}
    if (!name.trim())                           errs.name     = 'The name field is required.'
    else if (name.trim().length > 255)          errs.name     = 'The name may not be greater than 255 characters.'
    if (!email.trim())                          errs.email    = 'The email field is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'The email must be a valid email address.'
    if (!password)                              errs.password = 'The password field is required.'
    else if (password.length < 3)              errs.password = 'The password must be at least 3 characters.'
    return errs
  }

  /* ── password strength ── */
  const strength = (() => {
    if (!password) return 0
    let s = 0
    if (password.length >= 8)          s++
    if (/[A-Z]/.test(password))        s++
    if (/[0-9]/.test(password))        s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s
  })()
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', '#ff4d4d', '#ffaa00', '#00c9ff', '#00ff8c'][strength]

  /* ── submit → FormData to match multipart backend ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiMsg(null)

    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs); setShake(true); setTimeout(() => setShake(false), 500); return
    }
    setErrors({})
    setLoading(true)

    try {
      // Build FormData — required because 'image' is a file upload
      // Laravel expects: name, email, password, image (optional)
      const fd = new FormData()
      fd.append('name',     name.trim())
      fd.append('email',    email.trim())
      fd.append('password', password)
      if (image) fd.append('image', image)

      const res = await register(fd)
      const data = res.data
      console.log('Register success:', data)

      if (res.status === 201 && data.status === true) {
        // Success — optionally show warning if image upload failed on Cloudinary
        setApiMsg({
          type: data.warning ? 'warning' : 'success',
          text: data.warning ?? data.message   // 'User registered successfully'
        })
        // Reset form on success
        setName(''); setEmail(''); setPassword(''); setImage(null); setPreview(null)
      } else {
        setApiMsg({ type: 'error', text: data.message ?? 'Something went wrong.' })
      }
    } catch (error) {
      const data = error.response?.data
      console.error('Register error:', data || error.message)

      if (error.response?.status === 422) {
        // Laravel validation errors
        setErrors(
          Object.fromEntries(
            Object.entries(data?.errors ?? {}).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
          )
        )
        setShake(true); setTimeout(() => setShake(false), 500)
      } else {
        setApiMsg({ type: 'error', text: data?.message ?? 'Network error. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  /* ── icons ── */
  const Eye = ({ open }) => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>) : (<>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>)}
    </svg>
  )

  const UserSvg = () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
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
    <div className="reg-root d-flex align-items-center justify-content-center py-4">
      <div className="grid-bg" />
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      <div
        ref={cardRef}
        className={`reg-card card p-4 p-sm-5 ${shake ? 'shake' : ''}`}
        style={{ width: '100%', maxWidth: 460, zIndex: 10 }}
        onMouseMove={handleMouseMove}
      >
        <div className="card-glow" style={{
          background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, rgba(0,255,140,.065) 0%, transparent 65%)`
        }} />

        {/* ── Header ── */}
        <div className="fu mb-3">
          <span className="reg-badge"><span className="badge-dot" /> CREATE ACCOUNT</span>
        </div>
        <div className="fu d1 mb-4">
          <h1 className="reg-title mb-1">Join us<br /><span>today.</span></h1>
          <p className="mb-0" style={{ fontSize: 13.5, color: 'rgba(255,255,255,.33)', fontWeight: 300 }}>
            Create your free account in seconds
          </p>
        </div>

        {/* ── API response alert ── */}
        {apiMsg && (
          <div className={`api-alert alert fu mb-4 api-${apiMsg.type}`} role="alert">
            {apiMsg.type === 'success' && '✓ '}
            {apiMsg.type === 'warning' && '⚠ '}
            {apiMsg.type === 'error'   && '✕ '}
            {apiMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }} noValidate>

          {/* ── Avatar + Name (row) ── */}
          {/* image: nullable|image — optional profile photo → Cloudinary */}
          <div className="fu d2 mb-3">
            <div className="d-flex align-items-start gap-3">

              {/* avatar zone — clicking triggers hidden file input */}
              <div>
                <div className="avatar-zone" onClick={() => fileRef.current?.click()} title="Upload profile photo (optional)">
                  {preview
                    ? <img src={preview} alt="preview" />
                    : <UserSvg />
                  }
                  {preview
                    ? <button className="avatar-remove" onClick={removeImage} title="Remove">✕</button>
                    : <div className="avatar-plus">+</div>
                  }
                </div>
                {/* hidden file input — accepts images only, mirrors 'image' rule */}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                {errors.image && <div className="field-hint err" style={{ width: 76, fontSize: 10 }}>{errors.image}</div>}
                <div className="img-hint text-center" style={{ width: 76 }}>optional</div>
              </div>

              {/* name: required|string|max:255 */}
              <div className="flex-grow-1">
                <label className="reg-label form-label">Full Name</label>
                <input
                  type="text"
                  className={`form-control reg-input ${errors.name ? 'field-err' : name.trim().length > 1 ? 'field-ok' : ''}`}
                  placeholder="Mongkol Thoeung"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(ev => { const n={...ev}; delete n.name; return n }) }}
                  maxLength={255}
                  autoComplete="name"
                />
                {errors.name && <div className="field-hint err">{errors.name}</div>}
              </div>
            </div>
          </div>

          {/* ── Email: required|string|email|max:255|unique:users ── */}
          <div className="fu d3 mb-3">
            <label className="reg-label form-label">Email Address</label>
            <input
              type="email"
              className={`form-control reg-input ${errors.email ? 'field-err' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(ev => { const n={...ev}; delete n.email; return n }) }}
              maxLength={255}
              autoComplete="email"
            />
            {errors.email && <div className="field-hint err">{errors.email}</div>}
          </div>

          {/* ── Password: required|string|min:3 ── */}
          {/* Note: no confirm field — backend doesn't require it */}
          <div className="fu d4 mb-3">
            <label className="reg-label form-label">
              Password
              <span style={{ color: 'rgba(255,255,255,.2)', fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 11 }}>
                {' '}— min. 3 characters
              </span>
            </label>
            <div className="input-group pw-wrap">
              <input
                type={showPw ? 'text' : 'password'}
                className={`form-control reg-input ${errors.password ? 'field-err' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(ev => { const n={...ev}; delete n.password; return n }) }}
                autoComplete="new-password"
              />
              <span className="pw-eye" onClick={() => setShowPw(!showPw)}>
                <Eye open={showPw} />
              </span>
            </div>
            {errors.password && <div className="field-hint err">{errors.password}</div>}

            {/* strength indicator — visual only, not a backend rule */}
            {password && (
              <div>
                <div className="strength-track">
                  <div className="strength-fill" style={{ width: `${strength * 25}%`, background: strengthColor }} />
                </div>
                <div className="field-hint" style={{ color: strengthColor }}>{strengthLabel} password</div>
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <div className="fu d5 mt-4">
            <button type="submit" className="btn reg-btn w-100 py-3" disabled={loading}>
              <div className="btn-shimmer" />
              {loading
                ? <span className="d-inline-flex align-items-center gap-2">
                    <span className="btn-spin" /> Creating account...
                  </span>
                : 'Create Account'
              }
            </button>
          </div>

          {/* FormData note — helpful during dev */}
          <p className="text-center mt-2 mb-0" style={{ fontSize: 11, color: 'rgba(255,255,255,.15)' }}>
            Submits as <code style={{ color: 'rgba(0,255,140,.4)', fontSize: 10 }}>multipart/form-data</code> {'->'} POST /api/auth/register
          </p>
        </form>

        {/* ── Divider ── */}
        <div className="reg-divider my-4 fu d6">OR</div>

        {/* ── Social ── */}
        <div className="row g-2 mb-4 fu d7">
          <div className="col-6">
            <button type="button" className="btn social-btn w-100 py-2"><GoogleIcon /> Google</button>
          </div>
          <div className="col-6">
            <button type="button" className="btn social-btn w-100 py-2"><GithubIcon /> GitHub</button>
          </div>
        </div>

        {/* ── Login link ── */}
        <p className="text-center mb-0 fu d8" style={{ fontSize: 13.5, color: 'rgba(255,255,255,.28)' }}>
          Already have an account?{' '}
          <Link to="/login" className="login-link text-decoration-none">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
