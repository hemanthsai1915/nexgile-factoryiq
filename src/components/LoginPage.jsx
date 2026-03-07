import React, { useState } from 'react';
import { ROLES, storeRole } from '../data/users';

const PASSWORD = '123';

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!role) {
      setError('Please select a role.');
      return;
    }
    if (password !== PASSWORD) {
      setError('Invalid login');
      return;
    }
    storeRole(role);
    onLogin({ role, name: ROLES.find(r => r.value === role)?.label || role });
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      position: 'relative',
      zIndex: 1,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        minWidth: 320,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 40,
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44,
            background: '#00e5a0',
            clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
          }} />
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, letterSpacing: 0, lineHeight: 1.2 }}>
              Nexgile <span style={{ color: '#00e5a0' }}>—</span> FactoryIQ
            </div>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '0.03em', textTransform: 'uppercase', marginTop: 2 }}>
              Manufacturing Excellence Portal
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24, color: 'var(--text)' }}>
          Sign in
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.02em',
              color: 'var(--text2)',
              marginBottom: 10,
            }}>
              Select your role
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 14,
                lineHeight: 1.5,
                outline: 'none',
                cursor: 'pointer',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,229,160,0.5)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <option value="">Choose a role...</option>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.02em',
              color: 'var(--text2)',
              marginBottom: 10,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--surface2)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                fontSize: 14,
                lineHeight: 1.5,
                outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,229,160,0.5)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
          </div>
          {error && (
            <div style={{
              marginBottom: 16,
              padding: '10px 14px',
              background: 'rgba(255,71,87,0.12)',
              border: '1px solid rgba(255,71,87,0.3)',
              borderRadius: 8,
              fontSize: 13,
              color: '#ff4757',
            }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px 24px',
              background: '#00e5a0',
              color: '#0a0c0f',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            Sign in
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
          Mock auth · Password: 123 · Modules shown based on selected role.
        </p>
      </div>
    </div>
  );
}
