import HouseScene from './components/scene/HouseScene';
import PlanCanvas from './components/plan/PlanCanvas';
import TopBar from './components/ui/TopBar';
import BottomBar from './components/ui/BottomBar';
import EditToolbar from './components/ui/EditToolbar';
import SelectionBar from './components/ui/SelectionBar';
import ItemDetailLayer from './components/ui/ItemDetailLayer';
import SellBinDrawer from './components/ui/SellBinDrawer';
import ShoppingListDrawer from './components/ui/ShoppingListDrawer';
import AddItemModal from './components/ui/AddItemModal';
import CatalogSheet from './components/ui/CatalogSheet';
import InventoryList from './components/ui/InventoryList';
import ClosetSheet from './components/ui/ClosetSheet';
import { useInventoryStore } from './store/useInventoryStore';

function EmptyState() {
  const setPlanMode = useInventoryStore((s) => s.setPlanMode);
  const setView = useInventoryStore((s) => s.setView);
  return (
    <div className="empty-card pixel-panel">
      <div className="empty-emoji">🏗️</div>
      <div className="empty-title">아직 집 구조가 없어요</div>
      <p className="modal-note">
        네이버부동산 등에서 우리 집 도면을 캡처해 올리고, 그 위에 방을 따라 그려보세요.
      </p>
      <button
        className="pixel-btn pixel-btn-accent"
        onClick={() => {
          setView('2d');
          setPlanMode('edit');
        }}
      >
        도면 만들기
      </button>
    </div>
  );
}

function App() {
  const view = useInventoryStore((s) => s.view);
  const planMode = useInventoryStore((s) => s.planMode);
  const rooms = useInventoryStore((s) => s.rooms);
  const selectedRoomId = useInventoryStore((s) => s.selectedRoomId);
  const selectRoom = useInventoryStore((s) => s.selectRoom);
  const isListOpen = useInventoryStore((s) => s.isListOpen);
  const closeList = useInventoryStore((s) => s.closeList);
  const editing = view === '2d' && planMode === 'edit';
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  return (
    <div className="app-root">
      <div className="scene-container">{view === '2d' ? <PlanCanvas /> : <HouseScene />}</div>
      <TopBar />
      {editing ? <EditToolbar /> : <BottomBar />}
      {view === '2d' && !editing && <SelectionBar />}
      {rooms.length === 0 && !editing && <EmptyState />}
      {view === '3d' && <div className="hint-bar">드래그로 돌려보고 · 가구를 눌러보세요</div>}

      {isListOpen && <InventoryList onClose={closeList} />}
      {!editing && selectedRoom?.kind === 'dressroom' && (
        <ClosetSheet room={selectedRoom} onClose={() => selectRoom(null)} />
      )}
      {!editing && selectedRoom && selectedRoom.kind !== 'dressroom' && (
        <InventoryList roomId={selectedRoom.id} onClose={() => selectRoom(null)} />
      )}
      <ItemDetailLayer />
      <SellBinDrawer />
      <ShoppingListDrawer />
      <CatalogSheet />
      <AddItemModal />
    </div>
  );
}

export default App;
