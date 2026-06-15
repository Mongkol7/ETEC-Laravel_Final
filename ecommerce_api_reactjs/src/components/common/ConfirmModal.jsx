import React from 'react';

const ConfirmModal = ({ open, title, message, onCancel, onConfirm, confirmText = 'Confirm' }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <style>{`
        .modal-backdrop {
          position: fixed; inset: 0;
          background: rgba(5,5,8,0.7); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 9999;
        }
        .modal {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 20px; padding: 32px; width: 400px; max-width: 90%;
          color: #fff; text-align: center;
          margin: auto;
        }
        .modal h2 { font-family: 'Syne', sans-serif; margin-bottom: 16px; color: #fff; }
        .modal p { color: rgba(255,255,255,0.7); margin-bottom: 24px; }
        .modal-actions { display: flex; gap: 12px; justify-content: center; }
        .btn-modal { padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-family: 'DM Sans', sans-serif; }
        .btn-cancel { background: rgba(255,255,255,0.1); color: #fff; }
        .btn-confirm { background: linear-gradient(135deg, #ff4757, #ff6b81); color: #fff; }
      `}</style>
      <div className="modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-modal btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn-modal btn-confirm" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
