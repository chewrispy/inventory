import { useInventoryStore } from '../../store/useInventoryStore';

export default function TopBar() {
  const sellBin = useInventoryStore((s) => s.sellBin);
  const shoppingList = useInventoryStore((s) => s.shoppingList);
  const openSellBin = useInventoryStore((s) => s.openSellBin);
  const openShoppingList = useInventoryStore((s) => s.openShoppingList);
  const closeSellBin = useInventoryStore((s) => s.closeSellBin);
  const closeShoppingList = useInventoryStore((s) => s.closeShoppingList);
  const openAddModal = useInventoryStore((s) => s.openAddModal);
  const openFloorPlanEditor = useInventoryStore((s) => s.openFloorPlanEditor);
  const sellCount = sellBin.reduce((sum, c) => sum + c.qty, 0);
  const shoppingCount = shoppingList.length;

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
        <button
          className="pixel-btn pixel-btn-sm pixel-btn-badge"
          onClick={() => {
            closeSellBin();
            openShoppingList();
          }}
        >
          🛒 장바구니
          {shoppingCount > 0 && <span className="cart-count">{shoppingCount}</span>}
        </button>
        <button
          className="pixel-btn pixel-btn-sm pixel-btn-badge"
          onClick={() => {
            closeShoppingList();
            openSellBin();
          }}
        >
          🥕 판매함
          {sellCount > 0 && <span className="cart-count">{sellCount}</span>}
        </button>
      </div>
    </div>
  );
}
