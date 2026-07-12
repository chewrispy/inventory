import { useState } from 'react';
import { copyToClipboard, DAANGN_URL } from '../../utils/daangnDraft';

interface Props {
  title: string;
  note: string;
  initialText: string;
  onClose: () => void;
}

export default function DraftModal({ title, note, initialText, onClose }: Props) {
  const [draft, setDraft] = useState(initialText);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(draft);
    setCopied(ok);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="pixel-panel modal-panel" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>
          ✕
        </button>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-note">{note}</p>
        <textarea
          className="daangn-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={8}
        />
        <div className="modal-actions">
          <button className="pixel-btn" onClick={handleCopy}>
            {copied ? '복사 완료! ✅' : '📋 글 복사하기'}
          </button>
          <a
            className="pixel-btn pixel-btn-carrot"
            href={DAANGN_URL}
            target="_blank"
            rel="noreferrer"
          >
            당근마켓 열기 ↗
          </a>
        </div>
      </div>
    </div>
  );
}
