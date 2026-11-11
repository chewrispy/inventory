import { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { CATALOG, type CatalogEntry, type CatalogGroup } from '../../data/catalog';

const GROUPS = Object.keys(CATALOG) as CatalogGroup[];

export default function CatalogSheet() {
  const isOpen = useInventoryStore((s) => s.isCatalogOpen);
  const close = useInventoryStore((s) => s.closeCatalog);
  const addItem = useInventoryStore((s) => s.addItem);
  const selectItem = useInventoryStore((s) => s.selectItem);
  const viewCenter = useInventoryStore((s) => s.viewCenter);
  const [group, setGroup] = useState<CatalogGroup>('가구');
  const [custom, setCustom] = useState(false);
  const [c, setC] = useState({ name: '', emoji: '📦', w: '80', d: '60', h: '80' });

  if (!isOpen) return null;

  const place = (e: Omit<CatalogEntry, 'key'>) => {
    const id = addItem({
      name: e.name,
      emoji: e.emoji,
      category: e.category,
      quantity: 1,
      color: e.color,
      placement: {
        x: Math.round(viewCenter.x / 5) * 5,
        y: Math.round(viewCenter.y / 5) * 5,
        w: e.w,
        d: e.d,
        h: e.h,
        z: e.z,
        shape: e.shape,
        rot: 0,
      },
    });
    close();
    setCustom(false);
    selectItem(id);
  };

  return (
    <>
      <div className="detail-backdrop" onClick={close} />
      <div className="detail-layer pixel-panel catalog-sheet">
        <button className="detail-close" onClick={close}>
          ✕
        </button>
        <h3 className="modal-title">🛋️ 가구·가전 추가</h3>
        <p className="modal-note">실제 크기로 화면 가운데에 놓여요. 놓은 뒤 끌어서 옮기고, 상세에서 크기를 바꿀 수 있어요.</p>

        <div className="chip-tabs">
          {GROUPS.map((g) => (
            <button
              key={g}
              className={!custom && group === g ? 'active' : ''}
              onClick={() => {
                setGroup(g);
                setCustom(false);
              }}
            >
              {g}
            </button>
          ))}
          <button className={custom ? 'active' : ''} onClick={() => setCustom(true)}>
            직접 입력
          </button>
        </div>

        {custom ? (
          <form
            className="custom-form"
            onSubmit={(ev) => {
              ev.preventDefault();
              if (!c.name.trim()) return;
              place({
                name: c.name.trim(),
                emoji: c.emoji || '📦',
                category: 'furniture',
                w: Math.max(5, Number(c.w) || 80),
                d: Math.max(5, Number(c.d) || 60),
                h: Math.max(1, Number(c.h) || 80),
                color: '#efe3d3',
              });
            }}
          >
            <div className="form-grid">
              <label className="form-label">
                이름
                <input
                  className="form-input"
                  value={c.name}
                  onChange={(e) => setC({ ...c, name: e.target.value })}
                  placeholder="예: 안마의자"
                  required
                />
              </label>
              <label className="form-label">
                아이콘(이모지)
                <input
                  className="form-input"
                  value={c.emoji}
                  onChange={(e) => setC({ ...c, emoji: e.target.value })}
                />
              </label>
            </div>
            <div className="size-inputs">
              {(['w', 'd', 'h'] as const).map((k) => (
                <label key={k} className="form-label">
                  {k === 'w' ? '가로' : k === 'd' ? '깊이' : '높이'} (cm)
                  <input
                    className="form-input"
                    type="number"
                    inputMode="numeric"
                    value={c[k]}
                    onChange={(e) => setC({ ...c, [k]: e.target.value })}
                  />
                </label>
              ))}
            </div>
            <div className="modal-actions">
              <button className="pixel-btn pixel-btn-accent" type="submit">
                배치하기
              </button>
            </div>
          </form>
        ) : (
          <div className="catalog-grid">
            {CATALOG[group].map((e) => (
              <button key={e.key} className="catalog-card" onClick={() => place(e)}>
                <span className="catalog-emoji" style={{ background: e.color }}>
                  {e.emoji}
                </span>
                <span className="catalog-name">{e.name}</span>
                <span className="catalog-size">
                  {e.w}×{e.d}×{e.h}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
