import { useMemo, useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { buildDaangnBulkDraft } from '../../utils/daangnDraft';
import DraftModal from './DraftModal';

export default function CartDrawer() {
  const isCartOpen = useInventoryStore((s) => s.isCartOpen);
  const closeCart = useInventoryStore((s) => s.closeCart);
  const cart = useInventoryStore((s) => s.cart);
  const items = useInventoryStore((s) => s.items);
  const updateCartQty = useInventoryStore((s) => s.updateCartQty);
  const removeFromCart = useInventoryStore((s) => s.removeFromCart);
  const clearCart = useInventoryStore((s) => s.clearCart);
  const selectItem = useInventoryStore((s) => s.selectItem);

  const [showBulkDraft, setShowBulkDraft] = useState(false);

  const entries = useMemo(
    () =>
      cart
        .map((c) => {
          const item = items.find((it) => it.id === c.itemId);
          return item ? { item, qty: c.qty } : null;
        })
        .filter((e): e is { item: (typeof items)[number]; qty: number } => e !== null),
    [cart, items],
  );

  if (!isCartOpen) return null;

  return (
    <>
      <div className="detail-backdrop" onClick={closeCart} />
      <div className="cart-drawer pixel-panel">
        <button className="detail-close" onClick={closeCart}>
          ✕
        </button>
        <h3 className="modal-title">🛒 장바구니</h3>

        {entries.length === 0 ? (
          <p className="cart-empty">아직 담은 물건이 없어요. 집 안 물건을 눌러서 담아보세요!</p>
        ) : (
          <div className="cart-list">
            {entries.map(({ item, qty }) => (
              <div
                className="cart-row"
                key={item.id}
                onClick={() => {
                  selectItem(item.id);
                  closeCart();
                }}
              >
                <span className="cart-emoji">{item.emoji}</span>
                <span className="cart-name">{item.name}</span>
                <div className="qty-stepper" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => updateCartQty(item.id, qty - 1)}>−</button>
                  <span>{qty}</span>
                  <button onClick={() => updateCartQty(item.id, qty + 1)}>+</button>
                </div>
                <button
                  className="cart-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCart(item.id);
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
            <button className="pixel-btn pixel-btn-accent" onClick={() => setShowBulkDraft(true)}>
              🥕 한번에 당근마켓 초안 만들기
            </button>
            <button className="pixel-btn pixel-btn-danger" onClick={clearCart}>
              비우기
            </button>
          </div>
        )}
      </div>

      {showBulkDraft && (
        <DraftModal
          title="🥕 당근마켓 등록 초안 (여러 개)"
          note='장바구니에 담은 물건들을 한 번에 소개하는 글이에요. 당근마켓 앱/웹의 "글쓰기"에 붙여넣어 주세요!'
          initialText={buildDaangnBulkDraft(entries)}
          onClose={() => setShowBulkDraft(false)}
        />
      )}
    </>
  );
}
