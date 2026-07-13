import { useRef, useState } from 'react';
import { nanoid } from 'nanoid';
import { useInventoryStore } from '../../store/useInventoryStore';
import { DEFAULT_ROOMS } from '../../data/rooms';
import { darken, ROOM_COLOR_PRESETS } from '../../utils/color';
import { detectRoomsFromImage } from '../../utils/floorPlanDetect';
import type { RoomDef } from '../../types';

const PX_PER_UNIT = 40;
const STAGE_W = 880;
const STAGE_H = 560;
const MIN_RECT = 18;

interface DraftRoom {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Point {
  x: number;
  y: number;
}

function roomsToDraft(rooms: RoomDef[]): DraftRoom[] {
  return rooms.map((r) => ({
    id: r.id,
    name: r.name,
    color: r.floorColor,
    x: r.x * PX_PER_UNIT,
    y: r.z * PX_PER_UNIT,
    w: r.width * PX_PER_UNIT,
    h: r.depth * PX_PER_UNIT,
  }));
}

function draftToRooms(draft: DraftRoom[]): RoomDef[] {
  return draft.map((d) => ({
    id: d.id,
    name: d.name,
    x: d.x / PX_PER_UNIT,
    z: d.y / PX_PER_UNIT,
    width: d.w / PX_PER_UNIT,
    depth: d.h / PX_PER_UNIT,
    floorColor: d.color,
    accentColor: darken(d.color),
  }));
}

function normalizeRect(a: Point, b: Point) {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(a.x - b.x),
    h: Math.abs(a.y - b.y),
  };
}

export default function FloorPlanEditor() {
  const isOpen = useInventoryStore((s) => s.isFloorPlanEditorOpen);
  const close = useInventoryStore((s) => s.closeFloorPlanEditor);
  const rooms = useInventoryStore((s) => s.rooms);
  const setRooms = useInventoryStore((s) => s.setRooms);

  const stageRef = useRef<HTMLDivElement>(null);
  const [draftRooms, setDraftRooms] = useState<DraftRoom[]>(() => roomsToDraft(rooms));
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageOpacity, setImageOpacity] = useState(0.55);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [dragCurrent, setDragCurrent] = useState<Point | null>(null);
  const [pendingRect, setPendingRect] = useState<{ x: number; y: number; w: number; h: number } | null>(
    null,
  );
  const [pendingName, setPendingName] = useState('');
  const [pendingColor, setPendingColor] = useState(ROOM_COLOR_PRESETS[0]);
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isOpen) return null;

  const getStagePoint = (e: React.PointerEvent): Point => {
    const rect = stageRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleStagePointerDown = (e: React.PointerEvent) => {
    if (pendingRect) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // some browsers/synthetic pointers don't support capture; dragging still works without it
    }
    setDragStart(getStagePoint(e));
    setDragCurrent(getStagePoint(e));
  };

  const handleStagePointerMove = (e: React.PointerEvent) => {
    if (!dragStart) return;
    e.preventDefault();
    setDragCurrent(getStagePoint(e));
  };

  const handleStagePointerUp = () => {
    if (!dragStart || !dragCurrent) return;
    const rect = normalizeRect(dragStart, dragCurrent);
    setDragStart(null);
    setDragCurrent(null);
    if (rect.w < MIN_RECT || rect.h < MIN_RECT) return;
    setPendingRect(rect);
    setPendingName(`새 공간 ${draftRooms.length + 1}`);
    setPendingColor(ROOM_COLOR_PRESETS[draftRooms.length % ROOM_COLOR_PRESETS.length]);
  };

  const confirmPendingRoom = () => {
    if (!pendingRect) return;
    const name = pendingName.trim() || '이름 없는 방';
    setDraftRooms((prev) => [
      ...prev,
      { id: nanoid(6), name, color: pendingColor, ...pendingRect },
    ]);
    setPendingRect(null);
  };

  const handleImageUpload = (file: File | undefined) => {
    if (!file) return;
    if (
      draftRooms.length > 0 &&
      confirm(
        '도면 이미지를 기준으로 방을 새로 그릴까요?\n지금 그려진 방들을 지우고 이미지 위에 다시 그릴게요. (취소하면 기존 방을 유지한 채 이미지만 참고용으로 깔아요)',
      )
    ) {
      setDraftRooms([]);
    }
    const reader = new FileReader();
    reader.onload = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAutoDetect = async () => {
    if (!imageUrl) return;
    setIsDetecting(true);
    try {
      const { rects, canvasWidth, canvasHeight, naturalWidth, naturalHeight } =
        await detectRoomsFromImage(imageUrl);

      const containScale = Math.min(STAGE_W / naturalWidth, STAGE_H / naturalHeight);
      const drawnW = naturalWidth * containScale;
      const drawnH = naturalHeight * containScale;
      const offsetX = (STAGE_W - drawnW) / 2;
      const offsetY = (STAGE_H - drawnH) / 2;
      const toNatural = naturalWidth / canvasWidth || naturalHeight / canvasHeight;
      const totalScale = containScale * toNatural;

      const detected: DraftRoom[] = rects
        .map((r, i) => ({
          id: nanoid(6),
          name: `공간 ${i + 1}`,
          color: ROOM_COLOR_PRESETS[i % ROOM_COLOR_PRESETS.length],
          x: offsetX + r.x * totalScale,
          y: offsetY + r.y * totalScale,
          w: r.w * totalScale,
          h: r.h * totalScale,
        }))
        .filter((r) => r.w >= MIN_RECT && r.h >= MIN_RECT);

      if (detected.length === 0) {
        alert(
          '방을 인식하지 못했어요. 가구가 그려진 3D 렌더링 도면은 인식이 어려워요. 위/아래에서 직접 방을 그려주세요!',
        );
        return;
      }
      if (
        draftRooms.length === 0 ||
        confirm(`${detected.length}개의 공간을 찾았어요! 지금 그려진 방들을 자동 인식 결과로 바꿀까요?`)
      ) {
        setDraftRooms(detected);
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSave = () => {
    if (draftRooms.length === 0) {
      alert('방을 최소 1개는 그려주세요!');
      return;
    }
    setRooms(draftToRooms(draftRooms));
    close();
  };

  const handleResetDefault = () => {
    if (!confirm('기본 4개 방 구조로 되돌릴까요? 지금 그린 도면은 사라져요.')) return;
    setDraftRooms(roomsToDraft(DEFAULT_ROOMS));
  };

  const preview = dragStart && dragCurrent ? normalizeRect(dragStart, dragCurrent) : null;

  return (
    <div className="modal-backdrop">
      <div className="pixel-panel floorplan-panel" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="detail-close" onClick={close}>
          ✕
        </button>
        <h3 className="modal-title">🏗️ 우리집 도면 만들기</h3>
        <p className="modal-note">
          네이버 부동산 · Zillow 등에서 찾은 도면을 스크린샷으로 저장해 업로드하면 배경에 깔아드려요
          (도면 부분만 크롭해서 올리면 더 깔끔해요). "자동으로 방 나눠보기"는 벽이 굵고 또렷한 흑백 2D
          도면에서만 잘 작동하고, 네이버·Zillow에서 흔히 보이는 가구가 채워진 3D 렌더링 도면은 벽 선이
          가늘고 색이 옅어서 거의 인식이 안 돼요 — 이런 경우엔 아래에서 손가락/마우스로 직접 드래그해서
          방을 그려주세요. 인식 결과든 직접 그린 것이든 위치·크기는 자유롭게 다듬을 수 있어요.
        </p>

        <div className="floorplan-toolbar">
          <label className="pixel-btn pixel-btn-sm floorplan-upload">
            🖼️ 도면 이미지 업로드
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => handleImageUpload(e.target.files?.[0])}
            />
          </label>
          {imageUrl && (
            <>
              <button
                type="button"
                className="pixel-btn pixel-btn-sm pixel-btn-carrot"
                onClick={handleAutoDetect}
                disabled={isDetecting}
              >
                {isDetecting ? '인식 중...' : '✨ 자동으로 방 나눠보기'}
              </button>
              <button
                type="button"
                className="pixel-btn pixel-btn-sm"
                onClick={() => setImageUrl(null)}
              >
                이미지 지우기
              </button>
              <label className="floorplan-opacity">
                투명도
                <input
                  type="range"
                  min={0.15}
                  max={1}
                  step={0.05}
                  value={imageOpacity}
                  onChange={(e) => setImageOpacity(Number(e.target.value))}
                />
              </label>
            </>
          )}
          <span className="floorplan-count">방 {draftRooms.length}개</span>
        </div>

        <div
          ref={stageRef}
          className="floorplan-stage"
          style={{ width: STAGE_W, height: STAGE_H, touchAction: 'none' }}
          onPointerDown={handleStagePointerDown}
          onPointerMove={handleStagePointerMove}
          onPointerUp={handleStagePointerUp}
          onPointerCancel={() => {
            setDragStart(null);
            setDragCurrent(null);
          }}
        >
          {imageUrl && (
            <img
              src={imageUrl}
              alt="도면 참고 이미지"
              className="floorplan-bg-image"
              style={{ opacity: imageOpacity }}
              draggable={false}
            />
          )}

          {draftRooms.map((room) => (
            <div
              key={room.id}
              className="floorplan-room"
              style={{
                left: room.x,
                top: room.y,
                width: room.w,
                height: room.h,
                background: `${room.color}cc`,
                borderColor: darken(room.color),
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <span className="floorplan-room-name">{room.name}</span>
              <button
                type="button"
                className="floorplan-room-delete"
                onClick={() => setDraftRooms((prev) => prev.filter((r) => r.id !== room.id))}
              >
                ✕
              </button>
            </div>
          ))}

          {preview && (
            <div
              className="floorplan-preview-rect"
              style={{ left: preview.x, top: preview.y, width: preview.w, height: preview.h }}
            />
          )}

          {pendingRect && (
            <div
              className="floorplan-naming-popup"
              style={{
                left: Math.min(pendingRect.x, STAGE_W - 220),
                top: Math.min(pendingRect.y + pendingRect.h + 8, STAGE_H - 150),
              }}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <input
                className="form-input"
                autoFocus
                value={pendingName}
                onChange={(e) => setPendingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmPendingRoom();
                  if (e.key === 'Escape') setPendingRect(null);
                }}
                placeholder="방 이름 (예: 거실)"
              />
              <div className="emoji-picker floorplan-color-picker">
                {ROOM_COLOR_PRESETS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={`floorplan-swatch ${pendingColor === c ? 'floorplan-swatch-active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setPendingColor(c)}
                  />
                ))}
              </div>
              <div className="modal-actions">
                <button type="button" className="pixel-btn pixel-btn-accent pixel-btn-sm" onClick={confirmPendingRoom}>
                  추가
                </button>
                <button
                  type="button"
                  className="pixel-btn pixel-btn-sm"
                  onClick={() => setPendingRect(null)}
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="pixel-btn pixel-btn-accent" onClick={handleSave}>
            💾 저장하고 집으로
          </button>
          <button type="button" className="pixel-btn" onClick={handleResetDefault}>
            기본 구조로 초기화
          </button>
          <button
            type="button"
            className="pixel-btn pixel-btn-danger"
            onClick={() => {
              if (confirm('그린 방을 전부 지울까요?')) setDraftRooms([]);
            }}
          >
            전체 지우기
          </button>
        </div>
        <p className="modal-note">
          ⚠️ 방을 삭제하고 저장하면 그 방에 있던 물건은 화면에 보이지 않게 돼요 (물건 데이터 자체는 남아있어요).
        </p>
      </div>
    </div>
  );
}
