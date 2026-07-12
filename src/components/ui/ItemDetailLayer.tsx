import { useMemo, useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { CATEGORY_LABEL } from '../../types';
import { ROOMS } from '../../data/rooms';
import DaangnModal from './DaangnModal';

export default function ItemDetailLayer() {
  const selectedItemId = useInventoryStore((s) => s.selectedItemId);
  const items = useInventoryStore((s) => s.items);
  const selectItem = useInventoryStore((s) => s.selectItem);
  const updateItem = useInventoryStore((s) => s.updateItem);
  const removeItem = useInventoryStore((s) => s.removeItem);
  const addToCart = useInventoryStore((s) => s.addToCart);

  const [showDaangn, setShowDaangn] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const item = useMemo(
    () => items.find((it) => it.id === selectedItemId) ?? null,
    [items, selectedItemId],
  );

  if (!item) return null;

  const room = ROOMS.find((r) => r.id === item.roomId);

  const handleAddToCart = () => {
    addToCart(item.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <>
      <div className="detail-backdrop" onClick={() => selectItem(null)} />
      <div className="detail-layer pixel-panel">
        <button className="detail-close" onClick={() => selectItem(null)}>
          ✕
        </button>
        <div className="detail-header">
          <div className="detail-emoji">{item.emoji}</div>
          <div>
            <div className="detail-name">{item.name}</div>
            <div className="detail-tags">
              <span className="tag">{CATEGORY_LABEL[item.category]}</span>
              <span className="tag">{room?.name ?? '알 수 없는 방'}</span>
              {item.condition && <span className="tag">{item.condition}</span>}
            </div>
          </div>
        </div>

        <div className="detail-body">
          <div className="detail-row">
            <span className="detail-label">수량</span>
            <div className="qty-stepper">
              <button
                onClick={() => updateItem(item.id, { quantity: Math.max(1, item.quantity - 1) })}
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}>
                +
              </button>
            </div>
          </div>

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
        </div>

        <div className="detail-actions">
          <button className="pixel-btn" onClick={handleAddToCart}>
            {justAdded ? '담았어요! ✅' : '🛒 장바구니 담기'}
          </button>
          <button className="pixel-btn pixel-btn-accent" onClick={() => setShowDaangn(true)}>
            🥕 당근마켓에 올리기
          </button>
          <button
            className="pixel-btn pixel-btn-danger"
            onClick={() => {
              if (confirm(`'${item.name}'을(를) 인벤토리에서 삭제할까요?`)) {
                removeItem(item.id);
              }
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
