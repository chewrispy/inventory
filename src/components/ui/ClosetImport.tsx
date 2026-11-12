import { useMemo, useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import {
  CLOTH_EMOJI,
  CLOTH_OWNERS,
  CLOTH_TYPES,
  SEASONS,
  type ClothOwner,
  type ClothType,
  type Season,
} from '../../types';

interface ImportItem {
  name: string;
  type: ClothType;
  owner?: ClothOwner;
  color?: string;
  seasons?: Season[];
  brand?: string;
  size?: string;
  price?: number;
  purchasedAt?: string;
  memo?: string;
  photo?: string;
  imageUrl?: string;
  link?: string;
}

interface ImportFile {
  kind: 'closet-import';
  source?: string;
  items: ImportItem[];
}

function parse(text: string): ImportFile {
  const data = JSON.parse(text) as ImportFile;
  if (data.kind !== 'closet-import' || !Array.isArray(data.items)) throw new Error('형식이 달라요');
  data.items = data.items
    .filter((it) => it && typeof it.name === 'string' && it.name.trim())
    .map((it) => ({
      ...it,
      type: CLOTH_TYPES.includes(it.type) ? it.type : '기타',
      owner: it.owner && CLOTH_OWNERS.includes(it.owner) ? it.owner : undefined,
      seasons: (it.seasons ?? []).filter((s) => SEASONS.includes(s)),
    }));
  return data;
}

/** 옷 목록 파일(.json)을 한꺼번에 드레스룸에 등록 */
export default function ClosetImport({ roomId, onClose }: { roomId: string; onClose: () => void }) {
  const items = useInventoryStore((s) => s.items);
  const addItem = useInventoryStore((s) => s.addItem);
  const [file, setFile] = useState<ImportFile | null>(null);
  const [error, setError] = useState('');
  const [picked, setPicked] = useState<boolean[]>([]);
  const [done, setDone] = useState<number | null>(null);

  // 이름 + 구매일이 같은 옷은 이미 있는 것으로
  const existing = useMemo(
    () => new Set(items.filter((it) => it.clothing).map((it) => `${it.name}|${it.purchasedAt ?? ''}`)),
    [items],
  );
  const isDup = (it: ImportItem) => existing.has(`${it.name.trim()}|${it.purchasedAt ?? ''}`);

  const onFile = async (f?: File) => {
    if (!f) return;
    setError('');
    try {
      const data = parse(await f.text());
      setFile(data);
      setPicked(data.items.map((it) => !isDup(it)));
    } catch {
      setError('이 파일은 옷 목록 파일이 아니에요.');
    }
  };

  const count = picked.filter(Boolean).length;

  const run = () => {
    if (!file) return;
    let n = 0;
    file.items.forEach((it, i) => {
      if (!picked[i]) return;
      addItem({
        name: it.name.trim(),
        category: 'clothing',
        emoji: CLOTH_EMOJI[it.type],
        quantity: 1,
        price: it.price,
        purchasedAt: it.purchasedAt,
        memo: it.memo,
        locationId: roomId,
        clothing: {
          type: it.type,
          owner: it.owner,
          seasons: it.seasons ?? [],
          color: it.color,
          brand: it.brand,
          size: it.size,
          photo: it.photo,
          imageUrl: it.imageUrl,
          link: it.link,
        },
      });
      n += 1;
    });
    setDone(n);
  };

  return (
    <>
      <div className="detail-backdrop" onClick={onClose} />
      <div className="detail-layer pixel-panel closet-form">
        <button className="detail-close" onClick={onClose}>
          ✕
        </button>
        <h3 className="modal-title">📥 옷 한꺼번에 가져오기</h3>

        {done !== null ? (
          <>
            <p className="import-done">✅ {done}벌을 드레스룸에 넣었어요!</p>
            <div className="detail-actions">
              <button className="pixel-btn pixel-btn-accent" onClick={onClose}>
                옷장 보기
              </button>
            </div>
          </>
        ) : !file ? (
          <>
            <p className="modal-note">Claude가 만들어 드린 옷 목록 파일(.json)을 골라주세요.</p>
            <label className="pixel-btn pixel-btn-accent import-pick">
              파일 고르기
              <input type="file" hidden onChange={(e) => void onFile(e.target.files?.[0])} />
            </label>
            {error && <p className="form-hint link-fail">{error}</p>}
          </>
        ) : (
          <>
            <p className="modal-note">
              {file.source ?? '옷 목록'} · {file.items.length}개 중 <b>{count}개</b> 선택
              {file.items.some(isDup) && ' · 이미 있는 옷은 빼뒀어요'}
            </p>
            <div className="import-list">
              {file.items.map((it, i) => (
                <label key={i} className={`import-row ${isDup(it) ? 'import-dup' : ''}`}>
                  <input
                    type="checkbox"
                    checked={picked[i]}
                    onChange={(e) => setPicked((p) => p.map((v, k) => (k === i ? e.target.checked : v)))}
                  />
                  <span className="import-thumb">
                    {it.photo || it.imageUrl ? <img src={it.photo ?? it.imageUrl} alt="" /> : CLOTH_EMOJI[it.type]}
                  </span>
                  <span className="import-info">
                    <b>{it.name}</b>
                    <small>
                      {[it.type, it.size, it.purchasedAt, isDup(it) ? '이미 있음' : '']
                        .filter(Boolean)
                        .join(' · ')}
                    </small>
                  </span>
                </label>
              ))}
            </div>
            <div className="detail-actions">
              <button className="pixel-btn pixel-btn-accent" disabled={count === 0} onClick={run}>
                {count}개 드레스룸에 넣기
              </button>
              <button className="pixel-btn" onClick={() => setFile(null)}>
                다른 파일
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
