import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 3 seconds (aligns with the toastOut CSS animation timing)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      <div className="toast-stack">
        <style>{`
          .toast-stack {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
          }

          .toast-card {
            width: 320px;
            display: flex;
            gap: 12px;
            align-items: center;
            padding: 12px 16px;
            border-radius: 14px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(8, 8, 14, 0.9);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4), 
                        0 0 0 1px rgba(255, 255, 255, 0.04) inset;
            pointer-events: auto;
            animation: toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards,
                       toastOut 0.35s cubic-bezier(0.16, 1, 0.3, 1) 2.65s forwards;
            transform-origin: right bottom;
          }

          .toast-success {
            border-color: rgba(0, 255, 140, 0.25);
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4), 
                        0 0 20px rgba(0, 255, 140, 0.05);
          }

          .toast-info {
            border-color: rgba(0, 201, 255, 0.25);
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.4), 
                        0 0 20px rgba(0, 201, 255, 0.05);
          }

          .toast-icon {
            width: 32px;
            height: 32px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            font-size: 14px;
          }

          .toast-success .toast-icon {
            color: #00ff8c;
            background: rgba(0, 255, 140, 0.1);
            border: 1px solid rgba(0, 255, 140, 0.15);
          }

          .toast-info .toast-icon {
            color: #00c9ff;
            background: rgba(0, 201, 255, 0.1);
            border: 1px solid rgba(0, 201, 255, 0.15);
          }

          .toast-message {
            margin: 0;
            color: #fff;
            font-size: 13.5px;
            font-weight: 500;
            font-family: 'DM Sans', sans-serif;
            flex: 1;
          }

          @keyframes toastIn {
            from { opacity: 0; transform: translateY(20px) scale(0.9); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @keyframes toastOut {
            from { opacity: 1; transform: translateY(0) scale(1); }
            to { opacity: 0; transform: translateY(-20px) scale(0.9); }
          }
        `}</style>

        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-card ${toast.type === 'success' ? 'toast-success' : 'toast-info'}`}
          >
            <div className="toast-icon">
              {toast.type === 'success' ? '💚' : '💙'}
            </div>
            <p className="toast-message">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
