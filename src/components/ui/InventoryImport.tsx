import { useMemo, useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { CATEGORY_LABEL, type Category, type Condition, type InventoryItem } from '../../types';
import { roomAt } from '../../utils/geometry';

interface ImportItem {
  name: string;
  emoji?: string;
  category?: Category;
  quantity?: number;
  /** 방 이름 또는 가구 이름 (예: "거실", "소파", "냉장고") */
  location?: string;
  brand?: string;
  price?: number;
  purchasedAt?: string;
  condition?: Condition;
  memo?: string;
  photo?: string;
  imageUrl?: string;
  link?: string;
}

interface ImportFile {
  kind: 'inventory-import';
  source?: string;
  items: ImportItem[];
}

const norm = (s: string) => s.replace(/\s+/g, '').toLowerCase();

/** 물건 목록 파일(.json)을 한꺼번에 등록 — 위치는 방·가구 이름으로 찾아 넣음 */
export default function InventoryImport({ onClose }: { onClose: () => void }) {
  const items = useInventoryStore((s) => s.items);
  const rooms = useInventoryStore((s) => s.rooms);
  const addItem = useInventoryStore((s) => s.addItem);
  const [file, setFile] = useState<ImportFile | null>(null);
  const [error, setError] = useState('');
  const [picked, setPicked] = useState<boolean[]>([]);
  const [done, setDone] = useState<number | null>(null);

  /** 이름 → 위치 id (가구 이름이 방 이름보다 구체적이라 먼저) */
  const resolve = useMemo(() => {
    const furniture = items.filter((it) => it.placement && it.emoji !== '🚪' && it.emoji !== '🪟');
    return (name?: string): { id?: string; label: string } => {
      if (!name) return { label: '위치 미정' };
      const n = norm(name);
      const f = furniture.find((it) => norm(it.name) === n) ?? furniture.find((it) => norm(it.name).includes(n));
      if (f) {
        const room = roomAt(rooms, f.placement!);
        return { id: f.id, label: `${f.emoji} ${f.name}${room ? ` (${room.name})` : ''}` };
      }
      const r = rooms.find((rm) => norm(rm.name) === n) ?? rooms.find((rm) => norm(rm.name).includes(n));
      if (r) return { id: r.id, label: r.name };
      return { label: `위치 미정 ('${name}'을 못 찾음)` };
    };
  }, [items, rooms]);

  const existing = useMemo(() => new Set(items.map((it) => `${norm(it.name)}|${it.locationId ?? ''}`)), [items]);
  const isDup = (it: ImportItem) => existing.has(`${norm(it.name)}|${resolve(it.location).id ?? ''}`);

  const onFile = async (f?: File) => {
    if (!f) return;
    setError('');
    try {
      const data = JSON.parse(await f.text()) as ImportFile;
      if (data.kind !== 'inventory-import' || !Array.isArray(data.items)) throw new Error();
      data.items = data.items.filter((it) => it && typeof it.name === 'string' && it.name.trim());
      setFile(data);
      setPicked(data.items.map((it) => !isDup(it)));
    } catch {
      setError('이 파일은 물건 목록 파일이 아니에요. 옷 목록은 드레스룸에서 가져와 주세요.');
    }
  };

  const count = picked.filter(Boolean).length;

  const run = () => {
    if (!file) return;
    let n = 0;
    file.items.forEach((it, i) => {
      if (!picked[i]) return;
      const item: Omit<InventoryItem, 'id'> = {
        name: it.name.trim(),
        emoji: it.emoji || '📦',
        category: it.category && it.category in CATEGORY_LABEL ? it.category : 'misc',
        quantity: Math.max(1, it.quantity ?? 1),
        locationId: resolve(it.location).id,
        brand: it.brand,
        price: it.price,
        purchasedAt: it.purchasedAt,
        condition: it.condition,
        memo: it.memo,
        photo: it.photo,
        imageUrl: it.imageUrl,
        link: it.link,
      };
      addItem(item);
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
        <h3 className="modal-title">📥 물건 한꺼번에 가져오기</h3>

        {done !== null ? (
          <>
            <p className="import-done">✅ {done}개를 넣었어요!</p>
            <div className="detail-actions">
              <button className="pixel-btn pixel-btn-accent" onClick={onClose}>
                목록 보기
              </button>
            </div>
          </>
        ) : !file ? (
          <>
            <p className="modal-note">Claude가 만들어 드린 물건 목록 파일(.json)을 골라주세요.</p>
            <label className="pixel-btn pixel-btn-accent import-pick">
              파일 고르기
              <input type="file" hidden onChange={(e) => void onFile(e.target.files?.[0])} />
            </label>
            {error && <p className="form-hint link-fail">{error}</p>}
          </>
        ) : (
          <>
            <p className="modal-note">
              {file.source ?? '물건 목록'} · {file.items.length}개 중 <b>{count}개</b> 선택
              {file.items.some(isDup) && ' · 이미 있는 물건은 빼뒀어요'}
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
                    {it.photo || it.imageUrl ? <img src={it.photo ?? it.imageUrl} alt="" /> : it.emoji || '📦'}
                  </span>
                  <span className="import-info">
                    <b>
                      {it.name}
                      {it.quantity && it.quantity > 1 ? ` ×${it.quantity}` : ''}
                    </b>
                    <small>
                      📍 {resolve(it.location).label}
                      {isDup(it) ? ' · 이미 있음' : ''}
                    </small>
                  </span>
                </label>
              ))}
            </div>
            <div className="detail-actions">
              <button className="pixel-btn pixel-btn-accent" disabled={count === 0} onClick={run}>
                {count}개 넣기
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
