import { useMemo, useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import {
  CLOTH_EMOJI,
  CLOTH_OWNERS,
  CLOTH_TYPES,
  type ClothOwner,
  SEASONS,
  type ClothType,
  type InventoryItem,
  type Room,
  type Season,
} from '../../types';
import { CLOTH_COLORS } from '../../data/clothColors';
import { roomAt } from '../../utils/geometry';
import { loadPlanImage } from '../../utils/image';
import { fetchProductInfo, guessClothType, thumbUrl } from '../../utils/productLink';

interface Draft {
  id?: string;
  name: string;
  type: ClothType;
  owner?: ClothOwner;
  seasons: Season[];
  color?: string;
  brand: string;
  size: string;
  price: string;
  purchasedAt: string;
  memo: string;
  photo?: string;
  imageUrl?: string;
  link: string;
  locationId: string;
}

const OWNER_EMOJI: Record<ClothOwner, string> = { 보미: '👩', 제임스: '👨', 같이: '👫' };

const emptyDraft = (roomId: string, type: ClothType = '상의', owner?: ClothOwner): Draft => ({
  name: '',
  type,
  owner,
  seasons: [],
  brand: '',
  size: '',
  price: '',
  purchasedAt: '',
  memo: '',
  link: '',
  locationId: roomId,
});

function toDraft(it: InventoryItem, roomId: string): Draft {
  const c = it.clothing!;
  return {
    id: it.id,
    name: it.name,
    type: c.type,
    owner: c.owner,
    seasons: c.seasons,
    color: c.color,
    brand: c.brand ?? '',
    size: c.size ?? '',
    price: it.price !== undefined ? String(it.price) : '',
    purchasedAt: it.purchasedAt ?? '',
    memo: it.memo ?? '',
    photo: c.photo,
    imageUrl: c.imageUrl,
    link: c.link ?? '',
    locationId: it.locationId ?? roomId,
  };
}

function Swatch({ color }: { color?: string }) {
  if (!color) return null;
  return <span className="cloth-dot" style={{ background: CLOTH_COLORS[color] ?? '#ccc' }} />;
}

/** 드레스룸에 들어가면 보이는 옷장 관리 */
export default function ClosetSheet({ room, onClose }: { room: Room; onClose: () => void }) {
  const items = useInventoryStore((s) => s.items);
  const rooms = useInventoryStore((s) => s.rooms);
  const addItem = useInventoryStore((s) => s.addItem);
  const updateItem = useInventoryStore((s) => s.updateItem);
  const removeItem = useInventoryStore((s) => s.removeItem);
  const addToSellBin = useInventoryStore((s) => s.addToSellBin);
  const openDetail = useInventoryStore((s) => s.openDetail);

  const [type, setType] = useState<ClothType | '전체'>('전체');
  const [owner, setOwner] = useState<ClothOwner | '전체'>('전체');
  const [season, setSeason] = useState<Season | null>(null);
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [sold, setSold] = useState(false);
  const [fetching, setFetching] = useState<'idle' | 'loading' | 'fail'>('idle');

  // 드레스룸 안에 놓인 가구(스타일러, 행거 등)
  const furniture = useMemo(
    () => items.filter((it) => it.placement && it.emoji !== '🚪' && it.emoji !== '🪟' && roomAt(rooms, it.placement)?.id === room.id),
    [items, rooms, room.id],
  );
  const places = useMemo(() => new Set([room.id, ...furniture.map((f) => f.id)]), [room.id, furniture]);
  const clothes = useMemo(
    () => items.filter((it) => it.clothing && it.locationId && places.has(it.locationId)),
    [items, places],
  );

  const byOwner = clothes.filter((c) => owner === '전체' || c.clothing!.owner === owner);
  const shown = byOwner.filter(
    (c) =>
      (type === '전체' || c.clothing!.type === type) &&
      (!season || c.clothing!.seasons.length === 0 || c.clothing!.seasons.includes(season)) &&
      (!q.trim() ||
        c.name.includes(q.trim()) ||
        (c.clothing!.brand ?? '').includes(q.trim()) ||
        (c.clothing!.color ?? '').includes(q.trim())),
  );
  const countBy = (t: ClothType) => byOwner.filter((c) => c.clothing!.type === t).length;
  const ownerCount = (o: ClothOwner) => clothes.filter((c) => c.clothing!.owner === o).length;
  const noOwner = clothes.filter((c) => !c.clothing!.owner).length;

  const save = () => {
    if (!draft || !draft.name.trim()) return;
    const data: Omit<InventoryItem, 'id'> = {
      name: draft.name.trim(),
      category: 'clothing',
      emoji: CLOTH_EMOJI[draft.type],
      quantity: 1,
      price: draft.price ? Number(draft.price) : undefined,
      purchasedAt: draft.purchasedAt || undefined,
      memo: draft.memo.trim() || undefined,
      locationId: draft.locationId,
      clothing: {
        type: draft.type,
        owner: draft.owner,
        seasons: draft.seasons,
        color: draft.color,
        brand: draft.brand.trim() || undefined,
        size: draft.size.trim() || undefined,
        photo: draft.photo,
        imageUrl: draft.imageUrl,
        link: draft.link.trim() || undefined,
      },
    };
    if (draft.id) updateItem(draft.id, data);
    else addItem(data);
    setDraft(null);
  };

  const onPhoto = async (file?: File) => {
    if (!file || !draft) return;
    const img = await loadPlanImage(file, 360);
    setDraft({ ...draft, photo: img.dataUrl, imageUrl: undefined });
  };

  const onFetchLink = async () => {
    if (!draft) return;
    const url = draft.link.trim();
    if (!/^https?:\/\//.test(url)) return;
    setFetching('loading');
    const info = await fetchProductInfo(url);
    setDraft((d) =>
      d
        ? {
            ...d,
            imageUrl: info.imageUrl ?? d.imageUrl,
            photo: info.imageUrl ? undefined : d.photo,
            name: d.name.trim() ? d.name : (info.title ?? d.name),
            // 이름을 새로 채운 경우에만 종류도 추측 (직접 고른 건 존중)
            type: !d.name.trim() && guessClothType(info.title) ? guessClothType(info.title)! : d.type,
            brand: d.brand.trim() ? d.brand : (info.brand ?? d.brand),
          }
        : d,
    );
    setFetching(info.imageUrl ? 'idle' : 'fail');
  };

  if (draft) {
    const toggleSeason = (s: Season) =>
      setDraft({
        ...draft,
        seasons: draft.seasons.includes(s) ? draft.seasons.filter((x) => x !== s) : [...draft.seasons, s],
      });
    return (
      <>
        <div className="detail-backdrop" onClick={() => setDraft(null)} />
        <div className="detail-layer pixel-panel closet-form">
          <button className="detail-close" onClick={() => setDraft(null)}>
            ✕
          </button>
          <h3 className="modal-title">{draft.id ? '옷 정보' : '👗 옷 추가'}</h3>

          <label className="cloth-photo-pick">
            {draft.photo || draft.imageUrl ? (
              <img
                src={draft.photo ?? thumbUrl(draft.imageUrl!)}
                alt=""
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (draft.imageUrl && e.currentTarget.src !== draft.imageUrl) e.currentTarget.src = draft.imageUrl;
                }}
              />
            ) : (
              <span>
                {CLOTH_EMOJI[draft.type]}
                <small>사진 추가 (선택)</small>
              </span>
            )}
            <input type="file" accept="image/*" hidden onChange={(e) => void onPhoto(e.target.files?.[0])} />
          </label>
          {(draft.photo || draft.imageUrl) && (
            <button
              className="text-btn text-btn-danger"
              onClick={() => setDraft({ ...draft, photo: undefined, imageUrl: undefined })}
            >
              사진 지우기
            </button>
          )}

          <div className="form-label">
            🔗 상품 링크로 사진 가져오기
            <div className="link-row">
              <input
                className="form-input"
                inputMode="url"
                placeholder="무신사·유니클로 등 상품 페이지 주소"
                value={draft.link}
                onChange={(e) => {
                  setDraft({ ...draft, link: e.target.value });
                  setFetching('idle');
                }}
              />
              <button
                className="pixel-btn pixel-btn-sm"
                disabled={!/^https?:\/\//.test(draft.link.trim()) || fetching === 'loading'}
                onClick={() => void onFetchLink()}
              >
                {fetching === 'loading' ? '가져오는 중…' : '가져오기'}
              </button>
            </div>
            {fetching === 'fail' && (
              <small className="form-hint link-fail">
                이 사이트는 사진을 못 가져왔어요. 상품 사진을 길게 눌러 <b>이미지 주소 복사</b> 후 여기에 붙여넣어 보세요.
              </small>
            )}
            {draft.link && /^https?:\/\//.test(draft.link) && fetching !== 'loading' && (
              <a className="text-btn" href={draft.link} target="_blank" rel="noreferrer">
                상품 페이지 열기 ↗
              </a>
            )}
          </div>

          <label className="form-label">
            이름
            <input
              className="form-input"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="예: 회색 니트 가디건"
              autoFocus={!draft.id}
            />
          </label>

          <div className="form-label">
            누구 옷?
            <div className="chip-tabs">
              {CLOTH_OWNERS.map((o) => (
                <button
                  key={o}
                  className={draft.owner === o ? 'active' : ''}
                  onClick={() => setDraft({ ...draft, owner: draft.owner === o ? undefined : o })}
                >
                  {OWNER_EMOJI[o]} {o}
                </button>
              ))}
            </div>
          </div>

          <div className="form-label">
            종류
            <div className="chip-tabs chip-wrap">
              {CLOTH_TYPES.map((t) => (
                <button key={t} className={draft.type === t ? 'active' : ''} onClick={() => setDraft({ ...draft, type: t })}>
                  {CLOTH_EMOJI[t]} {t}
                </button>
              ))}
            </div>
          </div>

          <div className="form-label">
            계절 <small className="form-hint">(안 고르면 사계절)</small>
            <div className="chip-tabs">
              {SEASONS.map((s) => (
                <button key={s} className={draft.seasons.includes(s) ? 'active' : ''} onClick={() => toggleSeason(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="form-label">
            색
            <div className="cloth-colors">
              {Object.entries(CLOTH_COLORS).map(([name, hex]) => (
                <button
                  key={name}
                  className={`cloth-color ${draft.color === name ? 'active' : ''}`}
                  onClick={() => setDraft({ ...draft, color: draft.color === name ? undefined : name })}
                  title={name}
                >
                  <span style={{ background: hex }} />
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid">
            <label className="form-label">
              브랜드
              <input className="form-input" value={draft.brand} onChange={(e) => setDraft({ ...draft, brand: e.target.value })} />
            </label>
            <label className="form-label">
              사이즈
              <input className="form-input" value={draft.size} onChange={(e) => setDraft({ ...draft, size: e.target.value })} />
            </label>
            <label className="form-label">
              가격(원)
              <input
                className="form-input"
                type="number"
                inputMode="numeric"
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: e.target.value })}
              />
            </label>
            <label className="form-label">
              구매일
              <input
                className="form-input"
                type="date"
                value={draft.purchasedAt}
                onChange={(e) => setDraft({ ...draft, purchasedAt: e.target.value })}
              />
            </label>
          </div>

          {furniture.length > 0 && (
            <label className="form-label">
              보관 위치
              <select
                className="form-input"
                value={draft.locationId}
                onChange={(e) => setDraft({ ...draft, locationId: e.target.value })}
              >
                <option value={room.id}>{room.name}</option>
                {furniture.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.emoji} {f.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="form-label">
            메모
            <textarea
              className="form-input"
              rows={2}
              value={draft.memo}
              onChange={(e) => setDraft({ ...draft, memo: e.target.value })}
              placeholder="예: 드라이클리닝만"
            />
          </label>

          <div className="detail-actions">
            <button className="pixel-btn pixel-btn-accent" disabled={!draft.name.trim()} onClick={save}>
              {draft.id ? '저장' : '추가하기'}
            </button>
            {draft.id && (
              <>
                <button
                  className="pixel-btn pixel-btn-carrot"
                  onClick={() => {
                    addToSellBin(draft.id!, 1);
                    setSold(true);
                    setTimeout(() => setSold(false), 1200);
                  }}
                >
                  {sold ? '판매함에 담았어요 ✅' : '🥕 당근에 내놓기'}
                </button>
                <button
                  className="pixel-btn pixel-btn-danger"
                  onClick={() => {
                    if (confirm(`'${draft.name}'을(를) 삭제할까요?`)) {
                      removeItem(draft.id!);
                      setDraft(null);
                    }
                  }}
                >
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="detail-backdrop" onClick={onClose} />
      <div className="side-drawer pixel-panel closet-sheet">
        <button className="detail-close" onClick={onClose}>
          ✕
        </button>
        <h3 className="modal-title">👗 {room.name}</h3>
        <p className="modal-note">옷 {clothes.length}벌</p>

        <input
          className="form-input search-input"
          placeholder="🔍 이름·브랜드·색으로 찾기"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="segmented owner-tabs" role="tablist">
          <button className={owner === '전체' ? 'active' : ''} onClick={() => setOwner('전체')}>
            전체 {clothes.length}
          </button>
          {CLOTH_OWNERS.map((o) => (
            <button key={o} className={owner === o ? 'active' : ''} onClick={() => setOwner(o)}>
              {OWNER_EMOJI[o]} {o} {ownerCount(o)}
            </button>
          ))}
        </div>
        {noOwner > 0 && owner === '전체' && (
          <p className="modal-note owner-hint">주인이 안 정해진 옷이 {noOwner}벌 있어요. 옷을 눌러 '누구 옷?'을 골라주세요.</p>
        )}
        <div className="chip-tabs">
          <button className={type === '전체' ? 'active' : ''} onClick={() => setType('전체')}>
            전체 {byOwner.length}
          </button>
          {CLOTH_TYPES.filter((t) => countBy(t) > 0 || type === t).map((t) => (
            <button key={t} className={type === t ? 'active' : ''} onClick={() => setType(t)}>
              {CLOTH_EMOJI[t]} {t} {countBy(t)}
            </button>
          ))}
        </div>
        <div className="chip-tabs chip-tabs-sub">
          {SEASONS.map((s) => (
            <button key={s} className={season === s ? 'active' : ''} onClick={() => setSeason(season === s ? null : s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="inv-groups">
          {clothes.length === 0 ? (
            <div className="closet-empty">
              <div>🧺</div>
              <p>아직 등록한 옷이 없어요.</p>
              <p className="modal-note">아래 버튼으로 하나씩 추가해보세요. 사진은 선택이에요.</p>
            </div>
          ) : shown.length === 0 ? (
            <p className="drawer-empty">조건에 맞는 옷이 없어요.</p>
          ) : (
            <div className="cloth-grid">
              {shown.map((c) => (
                <button key={c.id} className="cloth-card" onClick={() => setDraft(toDraft(c, room.id))}>
                  <span
                    className="cloth-thumb"
                    style={{ background: c.clothing!.color ? `${CLOTH_COLORS[c.clothing!.color]}33` : undefined }}
                  >
                    {c.clothing!.photo || c.clothing!.imageUrl ? (
                      <img
                        src={c.clothing!.photo ?? thumbUrl(c.clothing!.imageUrl!, 300)}
                        alt=""
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          const orig = c.clothing!.imageUrl;
                          if (orig && e.currentTarget.src !== orig) e.currentTarget.src = orig;
                        }}
                      />
                    ) : (
                      c.emoji
                    )}
                  </span>
                  <span className="cloth-name">
                    <Swatch color={c.clothing!.color} />
                    {c.name}
                  </span>
                  {owner === '전체' && c.clothing!.owner && (
                    <span className="cloth-owner">{OWNER_EMOJI[c.clothing!.owner]}</span>
                  )}
                  <span className="cloth-meta">
                    {[c.clothing!.brand, c.clothing!.size].filter(Boolean).join(' · ') ||
                      (c.clothing!.seasons.length ? c.clothing!.seasons.join('·') : '사계절')}
                  </span>
                </button>
              ))}
            </div>
          )}

          {furniture.length > 0 && (
            <section className="inv-group">
              <div className="inv-group-title">드레스룸 가구·가전</div>
              {furniture.map((f) => (
                <button key={f.id} className="mini-row" onClick={() => openDetail(f.id)}>
                  <span className="mini-swatch" style={{ background: f.color }}>
                    {f.emoji}
                  </span>
                  <span className="mini-name">{f.name}</span>
                </button>
              ))}
            </section>
          )}
        </div>

        <div className="detail-actions">
          <button
            className="pixel-btn pixel-btn-accent"
            onClick={() => setDraft(emptyDraft(room.id, type === '전체' ? '상의' : type, owner === '전체' ? undefined : owner))}
          >
            + 옷 추가
          </button>
        </div>
      </div>
    </>
  );
}
