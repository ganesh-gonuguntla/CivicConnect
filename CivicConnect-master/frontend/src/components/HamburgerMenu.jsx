import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import ReportIssueForm from './ReportIssueForm';
import SettingsModal from './SettingsModal';
import NotificationsModal from './NotificationsModal';
import LeaderboardModal from './LeaderboardModal';
import { getProfile } from '../services/api';

/* ─── Inline keyframes ─────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

@keyframes slideIn  { from { transform:translateX(-100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
@keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
@keyframes shimmer  { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
@keyframes pulse-ring { 0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,.5);} 50%{box-shadow:0 0 0 8px rgba(139,92,246,0);} }
@keyframes item-in  { from{opacity:0;transform:translateX(-16px);} to{opacity:1;transform:translateX(0);} }
@keyframes glow-bar { 0%,100%{opacity:.7;} 50%{opacity:1;} }

.hm-item { animation: item-in .3s ease both; }
.hm-item:hover .hm-icon { transform: scale(1.12) rotate(-4deg); }
.hm-avatar { animation: pulse-ring 3s ease infinite; }
.hm-shimmer { background-size:200% auto; animation:shimmer 4s linear infinite; }
`;

/* ─── Nav config ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    label: 'My Reports', badge: null, action: 'navigate', value: '/my-issues',
    accent: '#8b5cf6', grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    label: 'New Report', badge: null, action: 'report', value: null,
    accent: '#10b981', grad: 'linear-gradient(135deg,#10b981,#059669)',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    label: 'Notifications', badge: 'notif', action: 'notifications', value: null,
    accent: '#f59e0b', grad: 'linear-gradient(135deg,#f59e0b,#d97706)',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    label: 'Leaderboard', badge: null, action: 'leaderboard', value: null,
    accent: '#f97316', grad: 'linear-gradient(135deg,#f97316,#ea580c)',
  },
  {
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    label: 'Settings', badge: null, action: 'settings', value: null,
    accent: '#64748b', grad: 'linear-gradient(135deg,#64748b,#475569)',
  },
];

/* ─── Component ─────────────────────────────────────────────── */
function HamburgerMenu() {
  const [open, setOpen]                     = useState(false);
  const [showReport, setShowReport]         = useState(false);
  const [showSettings, setShowSettings]     = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLeaderboard, setShowLeaderboard]     = useState(false);
  const [profile, setProfile]               = useState(null);
  const [unreadCount, setUnreadCount]       = useState(0);
  const [hovered, setHovered]               = useState(null);
  const menuRef = useRef(null);
  const navigate  = useNavigate();
  const location  = useLocation();

  /* Lock body scroll when sidebar is open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  /* fetch profile on open */
  useEffect(() => { if (open) fetchProfile(); }, [open]);

  /* derive unread */
  useEffect(() => {
    if (!profile) { setUnreadCount(0); return; }
    if (typeof profile.unreadNotifications === 'number') setUnreadCount(profile.unreadNotifications);
    else if (profile.notifications) setUnreadCount(profile.notifications.filter(n => !n.read).length);
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const res = await getProfile();
      setProfile(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) { console.error(err); }
  };

  const handleItem = (item) => {
    setOpen(false);
    if (item.action === 'navigate')      navigate(item.value);
    else if (item.action === 'report')        setShowReport(true);
    else if (item.action === 'settings')      setShowSettings(true);
    else if (item.action === 'notifications') setShowNotifications(true);
    else if (item.action === 'leaderboard')   setShowLeaderboard(true);
  };

  const initials = profile?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const isActive = (item) => item.action === 'navigate' && location.pathname === item.value;

  return (
    <div style={{ position: 'relative', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <style>{CSS}</style>

      {/* ── Hamburger trigger ── */}
      <button
        aria-label="Open navigation menu"
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          gap: '5px', width: '40px', height: '40px', borderRadius: '12px',
          background: open ? 'rgba(139,92,246,.25)' : 'rgba(255,255,255,.07)',
          border: `1px solid ${open ? 'rgba(139,92,246,.5)' : 'rgba(255,255,255,.12)'}`,
          cursor: 'pointer', padding: '9px', transition: 'all .25s cubic-bezier(.16,1,.3,1)',
          boxShadow: open ? '0 0 20px rgba(139,92,246,.25)' : 'none',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = 'rgba(255,255,255,.12)'; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'rgba(255,255,255,.07)'; }}
      >
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: '18px', height: '2px', borderRadius: '2px',
            background: open ? '#a78bfa' : 'rgba(203,213,225,.85)',
            transition: 'all .28s cubic-bezier(.16,1,.3,1)',
            transform: open
              ? i === 0 ? 'rotate(45deg) translate(5px,5px)'
              : i === 1 ? 'scaleX(0) opacity(0)'
              : 'rotate(-45deg) translate(5px,-5px)'
              : 'none',
          }} />
        ))}
      </button>

      {/* ── Portal: renders backdrop + drawer directly on <body> ── */}
      {ReactDOM.createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0,
              zIndex: 9998,
              background: 'rgba(0,0,0,.58)',
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transition: 'opacity .3s ease',
            }}
          />

          {/* Drawer */}
          <div
            ref={menuRef}
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0,
              zIndex: 9999,
              width: '300px',
              background: 'linear-gradient(180deg,#0c081e 0%,#080514 100%)',
              borderRight: '1px solid rgba(139,92,246,.18)',
              boxShadow: open ? '16px 0 70px rgba(0,0,0,.85), inset -1px 0 0 rgba(139,92,246,.12)' : 'none',
              transform: open ? 'translateX(0)' : 'translateX(-100%)',
              visibility: open ? 'visible' : 'hidden',
              pointerEvents: open ? 'auto' : 'none',
              transition: 'transform .38s cubic-bezier(.16,1,.3,1), visibility 0s linear ' + (open ? '0s' : '.38s'),
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              fontFamily: "'Inter',system-ui,sans-serif",
            }}
          >
        {/* Rainbow top bar */}
        <div className="hm-shimmer" style={{
          height: '3px', flexShrink: 0,
          background: 'linear-gradient(90deg,#8b5cf6,#ec4899,#f97316,#f59e0b,#10b981,#8b5cf6)',
        }} />

        {/* ── Profile section ── */}
        <div style={{
          padding: '28px 22px 22px', flexShrink: 0,
          background: 'linear-gradient(135deg,rgba(139,92,246,.12) 0%,rgba(236,72,153,.07) 100%)',
          borderBottom: '1px solid rgba(255,255,255,.06)',
        }}>
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <div
              className="hm-avatar"
              style={{
                width: '54px', height: '54px', borderRadius: '16px', flexShrink: 0,
                background: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', fontWeight: '900', color: 'white',
                border: '2px solid rgba(139,92,246,.5)',
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '15px', fontWeight: '800', color: 'white',
                margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {profile?.name || 'Loading…'}
              </p>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                background: 'rgba(139,92,246,.2)', border: '1px solid rgba(139,92,246,.35)',
                color: '#a78bfa', fontSize: '11px', fontWeight: '700',
                padding: '2px 9px', borderRadius: '20px', letterSpacing: '.3px',
              }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
                Citizen
              </span>
            </div>
          </div>

          {/* Civic Points card */}
          <div style={{
            borderRadius: '14px', padding: '14px 16px',
            background: 'linear-gradient(135deg,rgba(249,115,22,.2),rgba(245,158,11,.13))',
            border: '1px solid rgba(249,115,22,.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(249,115,22,.12)',
          }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: '700', color: 'rgba(251,146,60,.7)', letterSpacing: '1.8px', textTransform: 'uppercase', margin: '0 0 4px' }}>
                🎯 Civic Points
              </p>
              <p style={{ fontSize: '28px', fontWeight: '900', color: '#fb923c', margin: 0, lineHeight: 1 }}>
                {profile?.coins ?? '—'}
              </p>
            </div>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(249,115,22,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px',
            }}>
              🏙️
            </div>
          </div>
        </div>

        {/* ── Navigation ── */}
        <nav style={{ flex: 1, padding: '16px 14px', overflowY: 'auto' }}>
          <p style={{
            fontSize: '10px', fontWeight: '700', color: 'rgba(148,163,184,.4)',
            letterSpacing: '2px', textTransform: 'uppercase',
            padding: '0 10px 12px', margin: 0,
          }}>
            Navigation
          </p>

          {NAV_ITEMS.map((item, i) => {
            const active  = isActive(item);
            const isHov   = hovered === item.label;
            const lit     = active || isHov;
            const badge   = item.badge === 'notif' && unreadCount > 0 ? unreadCount : null;

            return (
              <button
                key={item.label}
                className="hm-item"
                onClick={() => handleItem(item)}
                onMouseEnter={() => setHovered(item.label)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  animationDelay: `${i * 0.05}s`,
                  width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 13px', borderRadius: '13px', marginBottom: '5px',
                  border: `1px solid ${lit ? item.accent + '40' : 'transparent'}`,
                  background: active
                    ? `${item.accent}1a`
                    : isHov ? `${item.accent}12` : 'transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all .2s ease', textAlign: 'left', position: 'relative',
                  boxShadow: active ? `0 0 18px ${item.accent}22` : 'none',
                }}
              >
                {/* Active left bar */}
                {active && (
                  <span style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: '3px', borderRadius: '3px',
                    background: item.grad,
                  }} />
                )}

                {/* Icon box */}
                <span
                  className="hm-icon"
                  style={{
                    width: '36px', height: '36px', borderRadius: '11px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: lit ? item.grad : 'rgba(255,255,255,.05)',
                    color: lit ? 'white' : 'rgba(148,163,184,.7)',
                    border: `1px solid ${lit ? 'transparent' : 'rgba(255,255,255,.07)'}`,
                    transition: 'all .2s ease',
                    boxShadow: lit ? `0 4px 14px ${item.accent}55` : 'none',
                  }}
                >
                  {item.icon}
                </span>

                {/* Label */}
                <span style={{
                  fontSize: '13.5px', fontWeight: active ? '700' : '600',
                  color: lit ? 'white' : 'rgba(203,213,225,.75)',
                  transition: 'color .2s ease', flex: 1,
                }}>
                  {item.label}
                </span>

                {/* Badge */}
                {badge && (
                  <span style={{
                    minWidth: '20px', height: '20px', borderRadius: '10px',
                    background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                    color: 'white', fontSize: '10px', fontWeight: '800',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 5px', boxShadow: '0 2px 8px rgba(239,68,68,.4)',
                  }}>
                    {badge}
                  </span>
                )}

                {/* Chevron on hover */}
                {isHov && !active && (
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke={item.accent} strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            );
          })}

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,.06)', margin: '12px 10px' }} />

          {/* Quick info row */}
          <div style={{ padding: '4px 10px 0', display: 'flex', gap: '10px' }}>
            {[
              { label: 'Reported', value: profile?.totalIssues ?? '—', color: '#8b5cf6' },
              { label: 'Resolved', value: profile?.resolvedIssues ?? '—', color: '#10b981' },
            ].map(stat => (
              <div key={stat.label} style={{
                flex: 1, borderRadius: '12px', padding: '12px',
                background: 'rgba(255,255,255,.04)',
                border: '1px solid rgba(255,255,255,.06)',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '20px', fontWeight: '900', color: stat.color, margin: '0 0 2px' }}>{stat.value}</p>
                <p style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(148,163,184,.5)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </nav>

        {/* ── Footer ── */}
        <div style={{
          padding: '16px 22px 20px',
          borderTop: '1px solid rgba(255,255,255,.06)', flexShrink: 0,
          background: 'rgba(0,0,0,.2)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '7px',
              background: 'linear-gradient(135deg,#f97316,#f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontSize: '12px', color: 'rgba(148,163,184,.45)', margin: 0, fontWeight: '600' }}>
              CivicConnect <span style={{ color: 'rgba(167,139,250,.5)' }}>— Making Cities Better</span>
            </p>
          </div>
        </div>
          </div>
        </>,
        document.body
      )}

      {/* ── Modals (z-index 10000 — above everything) ── */}
      {showReport && ReactDOM.createPortal(
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowReport(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,.05)', borderRadius: '24px', width: '100%', maxWidth: '1000px', maxHeight: '90vh', boxShadow: '0 30px 80px rgba(0,0,0,.15)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '22px 28px', borderBottom: '1px solid rgba(0,0,0,.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '11px', background: 'linear-gradient(135deg,#4f46e5,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📝</div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1e293b', margin: 0 }}>Report a Civic Issue</h3>
                  <p style={{ color: '#64748b', fontSize: '12px', margin: 0 }}>Help improve your community</p>
                </div>
              </div>
              <button onClick={() => setShowReport(false)} style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid rgba(0,0,0,.05)', color: '#64748b', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', padding: '0', display: 'flex', flex: 1 }}>
              <ReportIssueForm embedded onSuccess={() => { setShowReport(false); fetchProfile(); window.dispatchEvent(new Event('issueReported')); }} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {showSettings      && <SettingsModal      onClose={() => { setShowSettings(false);      fetchProfile(); }} />}
      {showNotifications && <NotificationsModal onClose={() => { setShowNotifications(false); fetchProfile(); }} onRefresh={fetchProfile} />}
      {showLeaderboard   && <LeaderboardModal   onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}

export default HamburgerMenu;
