import { useInventoryStore } from '../../store/useInventoryStore';

/** 평면도에서 가구를 눌렀을 때 뜨는 빠른 조작 바 */
export default function SelectionBar() {
  const selectedItemId = useInventoryStore((s) => s.selectedItemId);
  const isDetailOpen = useInventoryStore((s) => s.isDetailOpen);
  const items = useInventoryStore((s) => s.items);
  const updatePlacement = useInventoryStore((s) => s.updatePlacement);
  const duplicateItem = useInventoryStore((s) => s.duplicateItem);
  const openDetail = useInventoryStore((s) => s.openDetail);
  const selectItem = useInventoryStore((s) => s.selectItem);

  const item = items.find((it) => it.id === selectedItemId);
  if (!item?.placement || isDetailOpen) return null;
  const p = item.placement;
  const rotate = (deg: number) => updatePlacement(item.id, { rot: (((p.rot + deg) % 360) + 360) % 360 });

  return (
    <div className="selection-bar pixel-panel">
      <div className="selection-title">
        {item.emoji} {item.name}
        <span>
          {p.w}×{p.d}×{p.h}cm · {Math.round(p.rot)}°
        </span>
      </div>
      <div className="selection-actions">
        <button className="pixel-btn pixel-btn-sm" onClick={() => rotate(-15)} aria-label="왼쪽으로 15도">
          ↺ 15°
        </button>
        <button className="pixel-btn pixel-btn-sm" onClick={() => rotate(90)} aria-label="90도 회전">
          ↻ 90°
        </button>
        <button className="pixel-btn pixel-btn-sm" onClick={() => duplicateItem(item.id)}>
          복제
        </button>
        <button className="pixel-btn pixel-btn-sm pixel-btn-accent" onClick={() => openDetail(item.id)}>
          상세
        </button>
        <button className="pixel-btn pixel-btn-sm" onClick={() => selectItem(null)} aria-label="닫기">
          ✕
        </button>
      </div>
    </div>
  );
}
