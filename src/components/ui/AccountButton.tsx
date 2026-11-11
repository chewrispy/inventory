import { useState } from 'react';
import { login, logout, useSyncStore } from '../../sync/cloud';

const LABEL = {
  off: '',
  loading: '불러오는 중…',
  synced: '클라우드에 저장됨',
  saving: '저장 중…',
  offline: '오프라인 · 연결되면 저장돼요',
  denied: '권한 없는 계정',
  error: '저장 오류',
} as const;

export default function AccountButton() {
  const user = useSyncStore((s) => s.user);
  const status = useSyncStore((s) => s.status);
  const message = useSyncStore((s) => s.message);
  const [open, setOpen] = useState(false);

  if (!user) {
    return (
      <button className="account-btn" onClick={() => void login()} aria-label="구글 로그인">
        ☁️<span>로그인</span>
      </button>
    );
  }

  const dot = status === 'synced' ? '🟢' : status === 'saving' || status === 'loading' ? '🟡' : status === 'offline' ? '⚪' : '🔴';
  return (
    <div className="account-wrap">
      <button className="account-btn" onClick={() => setOpen((v) => !v)} aria-label="계정">
        {user.photoURL ? <img src={user.photoURL} alt="" referrerPolicy="no-referrer" /> : '👤'}
        <i className="account-dot">{dot}</i>
      </button>
      {open && (
        <div className="account-pop pixel-panel">
          <div className="account-email">{user.email}</div>
          <div className="account-status">
            {dot} {LABEL[status]}
          </div>
          {message && <p className="account-msg">{message}</p>}
          <button
            className="pixel-btn pixel-btn-sm"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
