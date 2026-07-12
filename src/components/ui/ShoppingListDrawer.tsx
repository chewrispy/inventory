import { useMemo } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { coupangSearchUrl, naverShoppingSearchUrl } from '../../utils/shoppingLinks';

export default function ShoppingListDrawer() {
  const isOpen = useInventoryStore((s) => s.isShoppingListOpen);
  const close = useInventoryStore((s) => s.closeShoppingList);
  const shoppingList = useInventoryStore((s) => s.shoppingList);
  const items = useInventoryStore((s) => s.items);
  const updateShoppingQty = useInventoryStore((s) => s.updateShoppingQty);
  const removeFromShoppingList = useInventoryStore((s) => s.removeFromShoppingList);
  const markPurchased = useInventoryStore((s) => s.markPurchased);
  const clearShoppingList = useInventoryStore((s) => s.clearShoppingList);
  const selectItem = useInventoryStore((s) => s.selectItem);

  const entries = useMemo(
    () =>
      shoppingList
        .map((c) => {
          const item = items.find((it) => it.id === c.itemId);
          return item ? { item, qty: c.qty } : null;
        })
        .filter((e): e is { item: (typeof items)[number]; qty: number } => e !== null),
    [shoppingList, items],
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="detail-backdrop" onClick={close} />
      <div className="side-drawer pixel-panel">
        <button className="detail-close" onClick={close}>
          ✕
        </button>
        <h3 className="modal-title">🛒 장바구니</h3>
        <p className="modal-note">다 써서 다시 사야 할 물건들이에요. 쿠팡·마트에서 주문하고 체크하세요!</p>

        {entries.length === 0 ? (
          <p className="drawer-empty">
            떨어진 물건이 없어요! 물건 상세에서 "다시 구매하기"를 누르면 여기 쌓여요.
          </p>
        ) : (
          <div className="drawer-list">
            {entries.map(({ item, qty }) => (
              <div className="drawer-row shopping-row" key={item.id}>
                <div className="shopping-top">
                  <span className="drawer-emoji" onClick={() => { selectItem(item.id); close(); }}>
                    {item.emoji}
                  </span>
                  <span className="drawer-name" onClick={() => { selectItem(item.id); close(); }}>
                    {item.name}
                  </span>
                  <button
                    className="drawer-remove"
                    onClick={() => removeFromShoppingList(item.id)}
                  >
                    ✕
                  </button>
                </div>
                <div className="shopping-bottom">
                  <div className="shopping-links">
                    <a href={coupangSearchUrl(item.name)} target="_blank" rel="noreferrer">
                      쿠팡 검색
                    </a>
                    <a href={naverShoppingSearchUrl(item.name)} target="_blank" rel="noreferrer">
                      네이버쇼핑 검색
                    </a>
                  </div>
                  <div className="shopping-buy">
                    <div className="qty-stepper">
                      <button onClick={() => updateShoppingQty(item.id, qty - 1)}>−</button>
                      <span>{qty}</span>
                      <button onClick={() => updateShoppingQty(item.id, qty + 1)}>+</button>
                    </div>
                    <button
                      className="pixel-btn pixel-btn-sm pixel-btn-mint"
                      onClick={() => markPurchased(item.id)}
                    >
                      샀어요 ✅
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {entries.length > 0 && (
          <div className="detail-actions">
            <button className="pixel-btn pixel-btn-danger" onClick={clearShoppingList}>
              비우기
            </button>
          </div>
        )}
      </div>
    </>
  );
}
