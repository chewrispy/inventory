import HouseScene from './components/scene/HouseScene';
import TopBar from './components/ui/TopBar';
import ItemDetailLayer from './components/ui/ItemDetailLayer';
import SellBinDrawer from './components/ui/SellBinDrawer';
import ShoppingListDrawer from './components/ui/ShoppingListDrawer';
import AddItemModal from './components/ui/AddItemModal';
import FloorPlanEditor from './components/ui/FloorPlanEditor';

function App() {
  return (
    <div className="app-root">
      <div className="scene-container">
        <HouseScene />
      </div>
      <TopBar />
      <div className="hint-bar">드래그로 회전 · 스크롤로 확대 · 물건을 눌러보세요!</div>
      <ItemDetailLayer />
      <SellBinDrawer />
      <ShoppingListDrawer />
      <AddItemModal />
      <FloorPlanEditor />
    </div>
  );
}

export default App;
