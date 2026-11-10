import { useRef } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { loadPlanImage } from '../../utils/image';
import { formatArea } from '../../utils/geometry';
import { ROOM_COLOR_PRESETS } from '../../utils/color';

const HINTS = {
  select: '방을 눌러 이름·색을 바꾸거나, 꼭짓점을 끌어 모양을 고쳐요.',
  draw: '방 모서리를 차례로 콕콕 찍고, 첫 점을 다시 누르면 방이 완성돼요.',
  calibrate: '도면에 치수가 적힌 벽의 양 끝을 찍어주세요.',
} as const;

export default function EditToolbar() {
  const editTool = useInventoryStore((s) => s.editTool);
  const setEditTool = useInventoryStore((s) => s.setEditTool);
  const background = useInventoryStore((s) => s.background);
  const setBackground = useInventoryStore((s) => s.setBackground);
  const updateBackground = useInventoryStore((s) => s.updateBackground);
  const rooms = useInventoryStore((s) => s.rooms);
  const clearPlan = useInventoryStore((s) => s.clearPlan);
  const selectedRoomId = useInventoryStore((s) => s.selectedRoomId);
  const updateRoom = useInventoryStore((s) => s.updateRoom);
  const removeRoom = useInventoryStore((s) => s.removeRoom);
  const selectRoom = useInventoryStore((s) => s.selectRoom);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);

  const onFile = async (file?: File) => {
    if (!file) return;
    if (
      rooms.length > 0 &&
      confirm('지금 있는 방들을 지우고 이 도면 위에 새로 그릴까요?\n(취소하면 방은 그대로 두고 이미지만 깔아요. 가구는 어느 쪽이든 남아요.)')
    ) {
      clearPlan();
    }
    const img = await loadPlanImage(file);
    // 일단 가로 10m로 가정 → 치수 맞추기로 보정
    setBackground({
      dataUrl: img.dataUrl,
      naturalWidth: img.width,
      naturalHeight: img.height,
      cmPerPx: 1000 / img.width,
      x: 0,
      y: 0,
      opacity: 0.6,
    });
    setEditTool('calibrate');
  };

  return (
    <div className="edit-toolbar pixel-panel">
      {selectedRoom && editTool === 'select' ? (
        <div className="room-edit">
          <div className="room-edit-head">
            <input
              className="form-input"
              value={selectedRoom.name}
              onChange={(e) => updateRoom(selectedRoom.id, { name: e.target.value })}
            />
            <span className="room-edit-area">{formatArea(selectedRoom.points)}</span>
          </div>
          <div className="floorplan-color-picker">
            {ROOM_COLOR_PRESETS.map((c) => (
              <button
                key={c}
                className={`floorplan-swatch ${selectedRoom.color === c ? 'floorplan-swatch-active' : ''}`}
                style={{ background: c }}
                onClick={() => updateRoom(selectedRoom.id, { color: c })}
                aria-label={c}
              />
            ))}
          </div>
          <div className="room-edit-actions">
            <button
              className="pixel-btn pixel-btn-sm pixel-btn-danger"
              onClick={() => {
                if (confirm(`'${selectedRoom.name}'을(를) 지울까요?`)) removeRoom(selectedRoom.id);
              }}
            >
              방 삭제
            </button>
            <button className="pixel-btn pixel-btn-sm" onClick={() => selectRoom(null)}>
              닫기
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="edit-hint">{HINTS[editTool]}</p>
          <div className="edit-tools">
            <button className="tool-btn" onClick={() => fileRef.current?.click()}>
              <span>🖼️</span>
              {background ? '도면 교체' : '도면 올리기'}
            </button>
            <button
              className={`tool-btn ${editTool === 'calibrate' ? 'active' : ''}`}
              onClick={() => setEditTool('calibrate')}
            >
              <span>📏</span>치수 맞추기
            </button>
            <button
              className={`tool-btn ${editTool === 'draw' ? 'active' : ''}`}
              onClick={() => setEditTool('draw')}
            >
              <span>✏️</span>방 그리기
            </button>
            <button
              className={`tool-btn ${editTool === 'select' ? 'active' : ''}`}
              onClick={() => setEditTool('select')}
            >
              <span>👆</span>방 고치기
            </button>
          </div>
          <div className="edit-sub">
            {background && (
              <>
                <label className="edit-opacity">
                  도면 진하기
                  <input
                    type="range"
                    min={0.1}
                    max={1}
                    step={0.05}
                    value={background.opacity}
                    onChange={(e) => updateBackground({ opacity: Number(e.target.value) })}
                  />
                </label>
                <button className="text-btn" onClick={() => setBackground(null)}>
                  도면 숨기기
                </button>
              </>
            )}
            {rooms.length > 0 && (
              <button
                className="text-btn text-btn-danger"
                onClick={() => {
                  if (confirm('방을 모두 지울까요? (가구와 물건은 남아요)')) clearPlan();
                }}
              >
                방 모두 지우기
              </button>
            )}
          </div>
        </>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void onFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
