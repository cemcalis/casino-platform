'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '../../../lib/auth-client';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#06000e',
  color: '#f0eaf8',
  borderRadius: 10,
  padding: '10px 14px',
  border: '1px solid #260840',
  outline: 'none',
  fontSize: 14,
  fontFamily: 'Outfit, sans-serif',
  transition: 'border-color 0.2s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: '#7a7090',
  marginBottom: 6,
  fontWeight: 700,
  letterSpacing: 2,
  textTransform: 'uppercase',
  fontFamily: 'Outfit, sans-serif',
};

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const tokens = await authClient.register({ email, username, password });
      sessionStorage.setItem('accessToken', tokens.accessToken);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(160deg,#0e0018,#06000e)',
      borderRadius: 16,
      padding: '32px 28px',
      border: '1px solid #d4a84844',
      boxShadow: '0 0 40px #00000088, 0 0 0 1px #d4a84820',
      fontFamily: 'Outfit, sans-serif',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          fontSize: 24,
          fontWeight: 900,
          background: 'linear-gradient(90deg,#8a5e10,#f4c430,#ffe066,#d4a030)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: 2,
          marginBottom: 4,
        }}>NEON PALACE</div>
        <div style={{ fontSize: 11, color: '#7a7090', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700 }}>
          Create Account
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_]+"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            style={inputStyle}
          />
        </div>
        {error && (
          <div style={{
            background: '#ff206818',
            border: '1px solid #ff206844',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 13,
            color: '#ff7090',
            fontWeight: 600,
          }}>{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 12,
            border: '2px solid #d4a848',
            background: loading
              ? 'linear-gradient(135deg,#0e0018,#180028)'
              : 'linear-gradient(135deg,#8a5e10 0%,#f4c430 30%,#ffe066 50%,#d4a030 70%,#8a5e10 100%)',
            color: loading ? '#7a7090' : '#06000e',
            fontSize: 14,
            fontWeight: 900,
            cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: 3,
            textTransform: 'uppercase',
            opacity: loading ? 0.7 : 1,
            transition: 'all 0.2s',
            boxShadow: loading ? 'none' : '0 0 16px #d4a84866',
          }}
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <span style={{ fontSize: 13, color: '#7a7090' }}>Already have an account? </span>
        <Link href="/login" style={{ fontSize: 13, color: '#d4a848', fontWeight: 700, textDecoration: 'none' }}>
          Sign In
        </Link>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center', fontSize: 10, color: '#7a709055', letterSpacing: 2, textTransform: 'uppercase' }}>
        Social Casino · No Real Money
      </div>
    </div>
  );
}
