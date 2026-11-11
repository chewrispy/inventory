import { useInventoryStore } from '../../store/useInventoryStore';
import AccountButton from './AccountButton';

export default function TopBar() {
  const view = useInventoryStore((s) => s.view);
  const setView = useInventoryStore((s) => s.setView);
  const planMode = useInventoryStore((s) => s.planMode);
  const setPlanMode = useInventoryStore((s) => s.setPlanMode);
  const lowWalls = useInventoryStore((s) => s.lowWalls);
  const toggleLowWalls = useInventoryStore((s) => s.toggleLowWalls);

  if (planMode === 'edit') {
    return (
      <div className="topbar">
        <div className="topbar-title">🏗️ 도면 편집</div>
        <button className="pixel-btn pixel-btn-sm pixel-btn-accent" onClick={() => setPlanMode('arrange')}>
          완료
        </button>
      </div>
    );
  }

  return (
    <>
    {view === '3d' && (
      <button className="plan-fit-btn walls-btn" onClick={toggleLowWalls}>
        {lowWalls ? '벽 올리기' : '벽 낮추기'}
      </button>
    )}
    <div className="topbar">
      <div className="topbar-title">🏠 우리집</div>
      <div className="topbar-right">
        <AccountButton />
        <div className="segmented" role="tablist">
          <button
            role="tab"
            aria-selected={view === '2d'}
            className={view === '2d' ? 'active' : ''}
            onClick={() => setView('2d')}
          >
            평면
          </button>
          <button
            role="tab"
            aria-selected={view === '3d'}
            className={view === '3d' ? 'active' : ''}
            onClick={() => setView('3d')}
          >
            3D
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
