import { useMemo, useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import type { InventoryItem, Room } from '../../types';
import { formatArea, roomAt } from '../../utils/geometry';

interface Group {
  key: string;
  title: string;
  sub?: string;
  addTo?: string;
  rows: { item: InventoryItem; children: InventoryItem[] }[];
  loose: InventoryItem[];
}

function buildGroups(items: InventoryItem[], rooms: Room[]): Group[] {
  const furnitureRoom = new Map<string, string | null>();
  for (const it of items) {
    if (it.placement) furnitureRoom.set(it.id, roomAt(rooms, it.placement)?.id ?? null);
  }
  const groups: Group[] = rooms.map((r) => ({
    key: r.id,
    title: r.name,
    sub: formatArea(r.points),
    addTo: r.id,
    rows: [],
    loose: [],
  }));
  const etc: Group = { key: '_etc', title: '위치 미정', rows: [], loose: [] };
  const byKey = new Map(groups.map((g) => [g.key, g]));

  for (const it of items) {
    if (it.placement) {
      const g = byKey.get(furnitureRoom.get(it.id) ?? '') ?? etc;
      g.rows.push({ item: it, children: items.filter((c) => c.locationId === it.id) });
    } else if (!it.locationId || !items.some((p) => p.id === it.locationId)) {
      const g = (it.locationId && byKey.get(it.locationId)) || etc;
      g.loose.push(it);
    }
  }
  return [...groups, etc].filter((g) => g.rows.length + g.loose.length > 0 || g.addTo);
}

/** roomId가 있으면 그 방만 (평면도에서 방 이름 눌렀을 때) */
export default function InventoryList({ roomId, onClose }: { roomId?: string; onClose: () => void }) {
  const items = useInventoryStore((s) => s.items);
  const rooms = useInventoryStore((s) => s.rooms);
  const openDetail = useInventoryStore((s) => s.openDetail);
  const openAddStuff = useInventoryStore((s) => s.openAddStuff);
  const [q, setQ] = useState('');

  const groups = useMemo(() => {
    const all = buildGroups(items, rooms);
    const scoped = roomId ? all.filter((g) => g.key === roomId) : all;
    const term = q.trim();
    if (!term) return scoped;
    const hit = (it: InventoryItem) => it.name.includes(term) || (it.memo ?? '').includes(term);
    return scoped
      .map((g) => ({
        ...g,
        rows: g.rows
          .map((r) => ({ ...r, children: hit(r.item) ? r.children : r.children.filter(hit) }))
          .filter((r) => hit(r.item) || r.children.length > 0),
        loose: g.loose.filter(hit),
      }))
      .filter((g) => g.rows.length + g.loose.length > 0);
  }, [items, rooms, roomId, q]);

  const total = items.reduce((s, it) => s + (it.placement ? 0 : 1), 0);

  return (
    <>
      <div className="detail-backdrop" onClick={onClose} />
      <div className="side-drawer pixel-panel">
        <button className="detail-close" onClick={onClose}>
          ✕
        </button>
        <h3 className="modal-title">{roomId ? `🚪 ${groups[0]?.title ?? '방'}` : '📦 우리집 물건'}</h3>
        {!roomId && (
          <>
            <p className="modal-note">
              가구·가전 {items.length - total}개 · 물건 {total}개
            </p>
            <input
              className="form-input search-input"
              placeholder="🔍 물건 찾기 (예: 건전지)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </>
        )}
        {roomId && groups[0]?.sub && <p className="modal-note">{groups[0].sub}</p>}

        <div className="inv-groups">
          {groups.length === 0 && <p className="drawer-empty">찾는 물건이 없어요.</p>}
          {groups.map((g) => (
            <section key={g.key} className="inv-group">
              {!roomId && <div className="inv-group-title">{g.title}</div>}
              {g.rows.map(({ item, children }) => (
                <div key={item.id} className="inv-row-wrap">
                  <button className="mini-row" onClick={() => openDetail(item.id)}>
                    <span className="mini-swatch" style={{ background: item.color }}>
                      {item.emoji}
                    </span>
                    <span className="mini-name">{item.name}</span>
                    {children.length > 0 && <span className="mini-qty">📦 {children.length}</span>}
                  </button>
                  {children.length > 0 && (
                    <div className="inv-children">
                      {children.map((c) => (
                        <button key={c.id} className="mini-row mini-row-child" onClick={() => openDetail(c.id)}>
                          <span>{c.emoji}</span>
                          <span className="mini-name">{c.name}</span>
                          <span className="mini-qty">×{c.quantity}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {g.loose.map((c) => (
                <button key={c.id} className="mini-row" onClick={() => openDetail(c.id)}>
                  <span className="mini-swatch">{c.emoji}</span>
                  <span className="mini-name">{c.name}</span>
                  <span className="mini-qty">×{c.quantity}</span>
                </button>
              ))}
              {g.addTo && (
                <button className="text-btn" onClick={() => openAddStuff(g.addTo)}>
                  + {g.title}에 물건 추가
                </button>
              )}
            </section>
          ))}
        </div>
        {!roomId && (
          <div className="detail-actions">
            <button className="pixel-btn pixel-btn-accent" onClick={() => openAddStuff('')}>
              + 물건 추가
            </button>
          </div>
        )}
      </div>
    </>
  );
}
