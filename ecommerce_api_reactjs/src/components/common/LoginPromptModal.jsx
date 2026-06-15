import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { useAuthPrompt } from '../../hooks/useAuthPrompt';
import { login as loginRequest } from '../../services/authService';

const LoginPromptModal = () => {
  const { openLoginPrompt, closeLoginPrompt, isOpen } = useAuthPrompt();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('[LoginPromptModal] isOpen:', isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeLoginPrompt();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, closeLoginPrompt]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginRequest({ email, password });

      if (response?.data?.token) {
        login({
          token: response.data.token,
          user: response.data.user,
        });
        closeLoginPrompt();
        setEmail('');
        setPassword('');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Login failed';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .login-prompt-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex !important;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .login-prompt-modal {
          background: rgba(8, 8, 14, 0.95);
          border: 1px solid rgba(0, 255, 140, 0.2);
          border-radius: 20px;
          padding: 32px;
          max-width: 380px;
          width: 90%;
          box-shadow: 0 8px 32px rgba(0, 255, 140, 0.1), 0 0 1px rgba(255, 255, 255, 0.1);
          animation: slideUp 0.3s ease-out;
          position: relative;
          z-index: 10000;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .login-prompt-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #fff;
          margin-bottom: 8px;
          text-align: center;
        }

        .login-prompt-subtitle {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.45);
          text-align: center;
          margin-bottom: 24px;
        }

        .login-prompt-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .login-prompt-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .login-prompt-label {
          font-size: 12px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.65);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .login-prompt-input {
          padding: 11px 14px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 11px;
          color: #fff;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s ease;
        }

        .login-prompt-input:focus {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(0, 255, 140, 0.3);
          box-shadow: 0 0 0 3px rgba(0, 255, 140, 0.08);
        }

        .login-prompt-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .login-prompt-error {
          padding: 10px 12px;
          background: rgba(255, 71, 87, 0.08);
          border: 1px solid rgba(255, 71, 87, 0.25);
          border-radius: 9px;
          font-size: 12px;
          color: #ff7b8a;
        }

        .login-prompt-submit {
          padding: 12px 16px;
          background: linear-gradient(135deg, #00ff8c, #00c9ff);
          border: none;
          border-radius: 11px;
          color: #050508;
          font-family: 'Syne', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 8px;
        }

        .login-prompt-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 255, 140, 0.3);
        }

        .login-prompt-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-prompt-links {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 12px;
          margin-top: 16px;
        }

        .login-prompt-link {
          color: rgba(255, 255, 255, 0.45);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .login-prompt-link:hover {
          color: #00ff8c;
        }

        .login-prompt-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }

        .login-prompt-secondary-btn {
          width: 100%;
          padding: 11px 16px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 11px;
          color: rgba(255, 255, 255, 0.65);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-prompt-secondary-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          color: #fff;
        }
      `}</style>

      <div className="login-prompt-overlay" onClick={closeLoginPrompt}>
        <div
          className="login-prompt-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="login-prompt-title">Sign In</h2>
          <p className="login-prompt-subtitle">
            Enter your credentials to continue
          </p>

          <form className="login-prompt-form" onSubmit={handleSubmit}>
            <div className="login-prompt-group">
              <label className="login-prompt-label">Email</label>
              <input
                type="email"
                className="login-prompt-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="login-prompt-group">
              <label className="login-prompt-label">Password</label>
              <input
                type="password"
                className="login-prompt-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {error && <div className="login-prompt-error">{error}</div>}

            <button
              type="submit"
              className="login-prompt-submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-prompt-divider" style={{ margin: '20px 0' }} />

          <Link
            to="/login"
            className="login-prompt-secondary-btn"
            onClick={closeLoginPrompt}
          >
            Go to Full Login Page →
          </Link>

          <div className="login-prompt-links" style={{ marginTop: '16px' }}>
            <Link
              to="/register"
              className="login-prompt-link"
              onClick={closeLoginPrompt}
            >
              Create account
            </Link>
            <span style={{ color: 'rgba(255,255,255,.2)' }}>•</span>
            <Link
              to="/forgot-password"
              className="login-prompt-link"
              onClick={closeLoginPrompt}
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPromptModal;
