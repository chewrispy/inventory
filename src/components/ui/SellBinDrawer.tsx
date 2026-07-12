import { useMemo, useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { buildDaangnBulkDraft } from '../../utils/daangnDraft';
import DraftModal from './DraftModal';

export default function SellBinDrawer() {
  const isOpen = useInventoryStore((s) => s.isSellBinOpen);
  const close = useInventoryStore((s) => s.closeSellBin);
  const sellBin = useInventoryStore((s) => s.sellBin);
  const items = useInventoryStore((s) => s.items);
  const updateSellBinQty = useInventoryStore((s) => s.updateSellBinQty);
  const removeFromSellBin = useInventoryStore((s) => s.removeFromSellBin);
  const clearSellBin = useInventoryStore((s) => s.clearSellBin);
  const selectItem = useInventoryStore((s) => s.selectItem);

  const [showBulkDraft, setShowBulkDraft] = useState(false);

  const entries = useMemo(
    () =>
      sellBin
        .map((c) => {
          const item = items.find((it) => it.id === c.itemId);
          return item ? { item, qty: c.qty } : null;
        })
        .filter((e): e is { item: (typeof items)[number]; qty: number } => e !== null),
    [sellBin, items],
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="detail-backdrop" onClick={close} />
      <div className="side-drawer pixel-panel">
        <button className="detail-close" onClick={close}>
          ✕
        </button>
        <h3 className="modal-title">🥕 판매함</h3>
        <p className="modal-note">당근마켓에 내놓을 물건들을 모아두는 곳이에요.</p>

        {entries.length === 0 ? (
          <p className="drawer-empty">
            아직 담은 물건이 없어요. 정리하고 싶은 물건을 눌러서 "당근에 내놓기"로 담아보세요!
          </p>
        ) : (
          <div className="drawer-list">
            {entries.map(({ item, qty }) => (
              <div
                className="drawer-row"
                key={item.id}
                onClick={() => {
                  selectItem(item.id);
                  close();
                }}
              >
                <span className="drawer-emoji">{item.emoji}</span>
                <span className="drawer-name">{item.name}</span>
                <div className="qty-stepper" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => updateSellBinQty(item.id, qty - 1)}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => updateSellBinQty(item.id, qty + 1)}>+</button>
                </div>
                <button
                  className="drawer-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromSellBin(item.id);
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {entries.length > 0 && (
          <div className="detail-actions">
            <button className="pixel-btn pixel-btn-carrot" onClick={() => setShowBulkDraft(true)}>
              🥕 한번에 당근마켓 초안 만들기
            </button>
            <button className="pixel-btn pixel-btn-danger" onClick={clearSellBin}>
              비우기
            </button>
          </div>
        )}
      </div>

      {showBulkDraft && (
        <DraftModal
          title="🥕 당근마켓 등록 초안 (여러 개)"
          note='판매함에 담은 물건들을 한 번에 소개하는 글이에요. 당근마켓 앱/웹의 "글쓰기"에 붙여넣어 주세요!'
          initialText={buildDaangnBulkDraft(entries)}
          onClose={() => setShowBulkDraft(false)}
        />
      )}
    </>
  );
}
