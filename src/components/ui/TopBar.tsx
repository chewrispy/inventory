import { useInventoryStore } from '../../store/useInventoryStore';

export default function TopBar() {
  const cart = useInventoryStore((s) => s.cart);
  const openCart = useInventoryStore((s) => s.openCart);
  const openAddModal = useInventoryStore((s) => s.openAddModal);
  const openFloorPlanEditor = useInventoryStore((s) => s.openFloorPlanEditor);
  const cartCount = cart.reduce((sum, c) => sum + c.qty, 0);

  return (
    <div className="topbar">
      <div className="topbar-title">🏠 우리집 인벤토리</div>
      <div className="topbar-actions">
        <button className="pixel-btn pixel-btn-sm" onClick={openFloorPlanEditor}>
          🏗️ 집 구조
        </button>
        <button className="pixel-btn pixel-btn-sm" onClick={openAddModal}>
          + 물건 추가
        </button>
        <button className="pixel-btn pixel-btn-sm pixel-btn-cart" onClick={openCart}>
          🛒 장바구니
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </div>
    </div>
  );
}
