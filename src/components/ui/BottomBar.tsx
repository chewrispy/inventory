import { useInventoryStore } from '../../store/useInventoryStore';

export default function BottomBar() {
  const sellBin = useInventoryStore((s) => s.sellBin);
  const shoppingList = useInventoryStore((s) => s.shoppingList);
  const openSellBin = useInventoryStore((s) => s.openSellBin);
  const openShoppingList = useInventoryStore((s) => s.openShoppingList);
  const openCatalog = useInventoryStore((s) => s.openCatalog);
  const openList = useInventoryStore((s) => s.openList);
  const setPlanMode = useInventoryStore((s) => s.setPlanMode);
  const setView = useInventoryStore((s) => s.setView);
  const sellCount = sellBin.reduce((sum, c) => sum + c.qty, 0);

  return (
    <nav className="bottombar">
      <button
        className="bottombar-btn"
        onClick={() => {
          setView('2d');
          setPlanMode('edit');
        }}
      >
        <span>🏗️</span>도면
      </button>
      <button
        className="bottombar-btn"
        onClick={() => {
          setView('2d');
          openCatalog();
        }}
      >
        <span>🛋️</span>가구 추가
      </button>
      <button className="bottombar-btn" onClick={openList}>
        <span>📦</span>물건
      </button>
      <button className="bottombar-btn" onClick={openShoppingList}>
        <span>🛒</span>장바구니
        {shoppingList.length > 0 && <em className="cart-count">{shoppingList.length}</em>}
      </button>
      <button className="bottombar-btn" onClick={openSellBin}>
        <span>🥕</span>판매함
        {sellCount > 0 && <em className="cart-count">{sellCount}</em>}
      </button>
    </nav>
  );
}
