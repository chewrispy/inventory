import { useMemo, useState } from 'react';
import { describeLocation, useInventoryStore } from '../../store/useInventoryStore';
import { CATEGORY_LABEL, IOT_APPS, type Category, type Condition, type InventoryItem } from '../../types';
import { FURNITURE_COLORS } from '../../data/catalog';
import { roomAt } from '../../utils/geometry';
import DaangnModal from './DaangnModal';

const CONDITIONS: Condition[] = ['새상품', '거의새것', '사용감있음', '많이사용함'];

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <label className="form-label">
      {label}
      <input
        className="form-input"
        type="number"
        inputMode="numeric"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      />
    </label>
  );
}

export default function ItemDetailLayer() {
  const selectedItemId = useInventoryStore((s) => s.selectedItemId);
  const isOpen = useInventoryStore((s) => s.isDetailOpen);
  const items = useInventoryStore((s) => s.items);
  const rooms = useInventoryStore((s) => s.rooms);
  const closeDetail = useInventoryStore((s) => s.closeDetail);
  const selectItem = useInventoryStore((s) => s.selectItem);
  const openDetail = useInventoryStore((s) => s.openDetail);
  const updateItem = useInventoryStore((s) => s.updateItem);
  const updatePlacement = useInventoryStore((s) => s.updatePlacement);
  const removeItem = useInventoryStore((s) => s.removeItem);
  const addToShoppingList = useInventoryStore((s) => s.addToShoppingList);
  const addToSellBin = useInventoryStore((s) => s.addToSellBin);
  const openAddStuff = useInventoryStore((s) => s.openAddStuff);

  const [showDaangn, setShowDaangn] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [editing, setEditing] = useState(false);

  const item = useMemo(() => items.find((it) => it.id === selectedItemId) ?? null, [items, selectedItemId]);
  const contents = useMemo(
    () => (item ? items.filter((it) => it.locationId === item.id) : []),
    [items, item],
  );
  const containers = useMemo(() => items.filter((it) => it.placement && it.id !== item?.id), [items, item]);

  if (!isOpen || !item) return null;

  const p = item.placement;
  const where = p ? roomAt(rooms, { x: p.x, y: p.y })?.name ?? '방 밖' : describeLocation(item, items, rooms);
  const close = () => {
    setEditing(false);
    if (p) closeDetail();
    else selectItem(null);
  };
  const set = (patch: Partial<InventoryItem>) => updateItem(item.id, patch);

  return (
    <>
      <div className="detail-backdrop" onClick={close} />
      <div className="detail-layer pixel-panel">
        <button className="detail-close" onClick={close}>
          ✕
        </button>
        <div className="detail-header">
          <div className="detail-emoji" style={p ? { background: item.color } : undefined}>
            {item.emoji}
          </div>
          <div>
            <div className="detail-name">{item.name}</div>
            <div className="detail-tags">
              <span className="tag">{CATEGORY_LABEL[item.category]}</span>
              <span className="tag">📍 {where}</span>
              {item.condition && <span className="tag">{item.condition}</span>}
              {item.iotApp && <span className="tag">📲 {item.iotApp}</span>}
            </div>
          </div>
        </div>

        {item.category === 'iot' && (
          <div className="detail-section">
            <div className="detail-section-title">연결 앱</div>
            <div className="chip-tabs chip-wrap">
              {IOT_APPS.map((a) => (
                <button
                  key={a}
                  className={item.iotApp === a ? 'active' : ''}
                  onClick={() => set({ iotApp: item.iotApp === a ? undefined : a })}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        {p && (
          <div className="detail-section">
            <div className="detail-section-title">크기·배치</div>
            <div className="size-inputs">
              <NumField label="가로 cm" value={p.w} onChange={(v) => updatePlacement(item.id, { w: Math.max(5, v ?? 5) })} />
              <NumField label="깊이 cm" value={p.d} onChange={(v) => updatePlacement(item.id, { d: Math.max(2, v ?? 2) })} />
              <NumField label="높이 cm" value={p.h} onChange={(v) => updatePlacement(item.id, { h: Math.max(1, v ?? 1) })} />
              <NumField label="띄움 cm" value={p.z ?? 0} onChange={(v) => updatePlacement(item.id, { z: v || undefined })} />
            </div>
            <div className="rotate-row">
              <span className="detail-label">방향 {Math.round(p.rot)}°</span>
              <input
                type="range"
                min={0}
                max={359}
                step={5}
                value={p.rot}
                onChange={(e) => updatePlacement(item.id, { rot: Number(e.target.value) })}
              />
              <button
                className="pixel-btn pixel-btn-sm"
                onClick={() => updatePlacement(item.id, { rot: (p.rot + 90) % 360 })}
              >
                ↻ 90°
              </button>
            </div>
            <div className="floorplan-color-picker">
              {FURNITURE_COLORS.map((c) => (
                <button
                  key={c}
                  className={`floorplan-swatch ${item.color === c ? 'floorplan-swatch-active' : ''}`}
                  style={{ background: c }}
                  onClick={() => set({ color: c })}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
        )}

        {p && (
          <div className="detail-section">
            <div className="detail-section-title">
              안에 든 물건 {contents.length > 0 && `(${contents.length})`}
            </div>
            {contents.length === 0 ? (
              <p className="modal-note">아직 넣어둔 물건이 없어요.</p>
            ) : (
              <div className="mini-list">
                {contents.map((c) => (
                  <button key={c.id} className="mini-row" onClick={() => openDetail(c.id)}>
                    <span>{c.emoji}</span>
                    <span className="mini-name">{c.name}</span>
                    <span className="mini-qty">×{c.quantity}</span>
                  </button>
                ))}
              </div>
            )}
            <button className="text-btn" onClick={() => openAddStuff(item.id)}>
              + 이 안에 물건 넣기
            </button>
          </div>
        )}

        <div className="detail-section">
          <div className="detail-row">
            <span className="detail-label">수량</span>
            <div className="qty-stepper">
              <button onClick={() => set({ quantity: Math.max(1, item.quantity - 1) })}>−</button>
              <span>{item.quantity}</span>
              <button onClick={() => set({ quantity: item.quantity + 1 })}>+</button>
            </div>
          </div>

          {editing ? (
            <div className="edit-fields">
              <div className="form-grid">
                <label className="form-label">
                  이름
                  <input className="form-input" value={item.name} onChange={(e) => set({ name: e.target.value })} />
                </label>
                <label className="form-label">
                  아이콘
                  <input className="form-input" value={item.emoji} onChange={(e) => set({ emoji: e.target.value })} />
                </label>
                <label className="form-label">
                  카테고리
                  <select
                    className="form-input"
                    value={item.category}
                    onChange={(e) => set({ category: e.target.value as Category })}
                  >
                    {Object.entries(CATEGORY_LABEL).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="form-label">
                  상태
                  <select
                    className="form-input"
                    value={item.condition ?? ''}
                    onChange={(e) => set({ condition: (e.target.value || undefined) as Condition | undefined })}
                  >
                    <option value="">-</option>
                    {CONDITIONS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <NumField label="가격(원)" value={item.price} onChange={(v) => set({ price: v })} />
                <label className="form-label">
                  구매일
                  <input
                    className="form-input"
                    type="date"
                    value={item.purchasedAt ?? ''}
                    onChange={(e) => set({ purchasedAt: e.target.value || undefined })}
                  />
                </label>
              </div>
              {!p && (
                <label className="form-label">
                  위치
                  <select
                    className="form-input"
                    value={item.locationId ?? ''}
                    onChange={(e) => set({ locationId: e.target.value || undefined })}
                  >
                    <option value="">위치 미정</option>
                    <optgroup label="방">
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="가구·가전 안">
                      {containers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.emoji} {c.name}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </label>
              )}
              <label className="form-label">
                메모
                <textarea
                  className="form-input"
                  rows={2}
                  value={item.memo ?? ''}
                  onChange={(e) => set({ memo: e.target.value || undefined })}
                />
              </label>
            </div>
          ) : (
            <>
              {item.price !== undefined && (
                <div className="detail-row">
                  <span className="detail-label">가격</span>
                  <span>{item.price.toLocaleString()}원</span>
                </div>
              )}
              {item.purchasedAt && (
                <div className="detail-row">
                  <span className="detail-label">구매일</span>
                  <span>{item.purchasedAt}</span>
                </div>
              )}
              {item.memo && (
                <div className="detail-row detail-memo">
                  <span className="detail-label">메모</span>
                  <p>{item.memo}</p>
                </div>
              )}
            </>
          )}
          <button className="text-btn" onClick={() => setEditing((v) => !v)}>
            {editing ? '✓ 수정 끝' : '✎ 정보 수정'}
          </button>
        </div>

        <div className="detail-actions">
          <button
            className="pixel-btn"
            onClick={() => {
              addToShoppingList(item.id, 1);
              setJustAdded(true);
              setTimeout(() => setJustAdded(false), 1200);
            }}
          >
            {justAdded ? '담았어요! ✅' : '🛒 다시 구매하기'}
          </button>
          <button
            className="pixel-btn pixel-btn-carrot"
            onClick={() => {
              addToSellBin(item.id, item.quantity);
              setShowDaangn(true);
            }}
          >
            🥕 당근에 내놓기
          </button>
          <button
            className="pixel-btn pixel-btn-danger"
            onClick={() => {
              if (confirm(`'${item.name}'을(를) 삭제할까요?`)) removeItem(item.id);
            }}
          >
            삭제
          </button>
        </div>
      </div>

      {showDaangn && <DaangnModal item={item} onClose={() => setShowDaangn(false)} />}
    </>
  );
}
