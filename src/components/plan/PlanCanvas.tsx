import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import type { InventoryItem, Placement, Pt } from '../../types';
import {
  WALL_THICKNESS,
  dist,
  formatArea,
  formatLen,
  labelPoint,
  planBounds,
  snapPoint,
  wallSegments,
} from '../../utils/geometry';
import { darken, ROOM_COLOR_PRESETS } from '../../utils/color';

interface View {
  cx: number;
  cy: number;
  s: number; // 화면 px / cm
}

type Gesture =
  | { type: 'none' }
  | { type: 'pan'; start: Pt; view: View; moved: boolean; target: TapTarget }
  | { type: 'pinch'; d0: number; mid0: Pt; view: View }
  | { type: 'item'; id: string; start: Pt; orig: Placement; moved: boolean }
  | { type: 'vertex'; roomId: string; index: number; moved: boolean };

type TapTarget =
  | { kind: 'empty' }
  | { kind: 'room'; id: string }
  | { kind: 'roomchip'; id: string }
  | { kind: 'item'; id: string };

const MIN_S = 0.15;
const MAX_S = 6;

function readTarget(el: EventTarget | null): TapTarget {
  const node = (el as Element | null)?.closest?.('[data-item],[data-roomchip],[data-room],[data-vertex]');
  if (!node) return { kind: 'empty' };
  const d = (node as HTMLElement).dataset;
  if (d.item) return { kind: 'item', id: d.item };
  if (d.roomchip) return { kind: 'roomchip', id: d.roomchip };
  if (d.room) return { kind: 'room', id: d.room };
  return { kind: 'empty' };
}

export default function PlanCanvas() {
  const rooms = useInventoryStore((s) => s.rooms);
  const items = useInventoryStore((s) => s.items);
  const background = useInventoryStore((s) => s.background);
  const planMode = useInventoryStore((s) => s.planMode);
  const editTool = useInventoryStore((s) => s.editTool);
  const selectedItemId = useInventoryStore((s) => s.selectedItemId);
  const selectedRoomId = useInventoryStore((s) => s.selectedRoomId);
  const selectItem = useInventoryStore((s) => s.selectItem);
  const selectRoom = useInventoryStore((s) => s.selectRoom);
  const updatePlacement = useInventoryStore((s) => s.updatePlacement);
  const updateRoom = useInventoryStore((s) => s.updateRoom);
  const addRoom = useInventoryStore((s) => s.addRoom);
  const rescalePlan = useInventoryStore((s) => s.rescalePlan);
  const setViewCenter = useInventoryStore((s) => s.setViewCenter);
  const setEditTool = useInventoryStore((s) => s.setEditTool);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 400, h: 700 });
  const [view, setView] = useState<View>({ cx: 400, cy: 400, s: 0.6 });
  const pointers = useRef(new Map<number, Pt>());
  const gesture = useRef<Gesture>({ type: 'none' });
  const fitted = useRef(false);

  const [drawPts, setDrawPts] = useState<Pt[]>([]);
  const [pendingRoom, setPendingRoom] = useState<Pt[] | null>(null);
  const [pendingName, setPendingName] = useState('');
  const [pendingColor, setPendingColor] = useState(ROOM_COLOR_PRESETS[0]);
  const [calPts, setCalPts] = useState<Pt[]>([]);
  const [calInput, setCalInput] = useState('');

  const placed = useMemo(
    () =>
      items
        .filter((it): it is InventoryItem & { placement: Placement } => !!it.placement)
        .sort(
          (a, b) =>
            Number(a.category === 'iot') - Number(b.category === 'iot') ||
            (a.placement.z ?? 0) - (b.placement.z ?? 0) ||
            b.placement.w * b.placement.d - a.placement.w * a.placement.d,
        ),
    [items],
  );

  const stuffCount = useMemo(() => {
    const m = new Map<string, number>();
    for (const it of items) if (it.locationId) m.set(it.locationId, (m.get(it.locationId) ?? 0) + 1);
    return m;
  }, [items]);

  const walls = useMemo(() => wallSegments(rooms), [rooms]);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const fit = useCallback(() => {
    const b = planBounds(
      rooms,
      placed.map((p) => p.placement),
    );
    if (rooms.length === 0 && background) {
      b.minX = background.x;
      b.minY = background.y;
      b.maxX = background.x + background.naturalWidth * background.cmPerPx;
      b.maxY = background.y + background.naturalHeight * background.cmPerPx;
    }
    const pad = 36;
    const top = 70; // 상단 바
    const bottom = 150; // 하단 바
    const s = Math.min(
      (size.w - pad) / Math.max(100, b.maxX - b.minX),
      (size.h - top - bottom) / Math.max(100, b.maxY - b.minY),
    );
    const clamped = Math.min(MAX_S, Math.max(MIN_S, s));
    setView({
      cx: (b.minX + b.maxX) / 2,
      cy: (b.minY + b.maxY) / 2 + (bottom - top) / 2 / clamped,
      s: clamped,
    });
  }, [rooms, placed, background, size]);

  useEffect(() => {
    if (!fitted.current && size.w > 0) {
      fitted.current = true;
      fit();
    }
  }, [fit, size]);

  // 이미지 새로 올리면 맞춰서 보기
  const bgKey = background ? `${background.dataUrl.length}:${background.naturalWidth}` : '';
  useEffect(() => {
    if (bgKey) fit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgKey]);

  useEffect(() => {
    setViewCenter({ x: view.cx, y: view.cy });
  }, [view.cx, view.cy, setViewCenter]);

  // 도구 바뀌면 그리던 것 초기화
  useEffect(() => {
    setDrawPts([]);
    setCalPts([]);
  }, [editTool, planMode]);

  useEffect(() => {
    const handler = () => fit();
    window.addEventListener('plan:fit', handler);
    return () => window.removeEventListener('plan:fit', handler);
  }, [fit]);

  const toPlan = useCallback(
    (sp: Pt, v: View = view): Pt => ({
      x: (sp.x - size.w / 2) / v.s + v.cx,
      y: (sp.y - size.h / 2) / v.s + v.cy,
    }),
    [view, size],
  );

  const localPt = (e: React.PointerEvent | React.WheelEvent): Pt => {
    const r = wrapRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const allVertices = useMemo(() => rooms.flatMap((r) => r.points), [rooms]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (pendingRoom || calPts.length >= 2) return;
    const p = localPt(e);
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    pointers.current.set(e.pointerId, p);

    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        type: 'pinch',
        d0: dist(a, b),
        mid0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        view,
      };
      return;
    }
    if (pointers.current.size > 2) return;

    const vertexEl = (e.target as Element).closest?.('[data-vertex]') as HTMLElement | null;
    if (vertexEl && planMode === 'edit' && editTool === 'select' && selectedRoomId) {
      gesture.current = {
        type: 'vertex',
        roomId: selectedRoomId,
        index: Number(vertexEl.dataset.vertex),
        moved: false,
      };
      return;
    }

    const target = readTarget(e.target);
    if (target.kind === 'item' && planMode === 'arrange') {
      const it = items.find((i) => i.id === target.id);
      if (it?.placement) {
        gesture.current = { type: 'item', id: it.id, start: p, orig: { ...it.placement }, moved: false };
        return;
      }
    }
    gesture.current = { type: 'pan', start: p, view, moved: false, target };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = localPt(e);
    pointers.current.set(e.pointerId, p);
    const g = gesture.current;

    if (g.type === 'pinch' && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const s = Math.min(MAX_S, Math.max(MIN_S, (g.view.s * dist(a, b)) / Math.max(1, g.d0)));
      const anchor = toPlan(g.mid0, g.view);
      setView({
        s,
        cx: anchor.x - (mid.x - size.w / 2) / s,
        cy: anchor.y - (mid.y - size.h / 2) / s,
      });
    } else if (g.type === 'pan') {
      const dx = p.x - g.start.x;
      const dy = p.y - g.start.y;
      if (!g.moved && Math.hypot(dx, dy) < 6) return;
      g.moved = true;
      setView({ ...g.view, cx: g.view.cx - dx / g.view.s, cy: g.view.cy - dy / g.view.s });
    } else if (g.type === 'item') {
      const dx = p.x - g.start.x;
      const dy = p.y - g.start.y;
      if (!g.moved && Math.hypot(dx, dy) < 5) return;
      if (!g.moved) selectItem(g.id);
      g.moved = true;
      updatePlacement(g.id, {
        x: Math.round((g.orig.x + dx / view.s) / 5) * 5,
        y: Math.round((g.orig.y + dy / view.s) / 5) * 5,
      });
    } else if (g.type === 'vertex') {
      g.moved = true;
      const room = rooms.find((r) => r.id === g.roomId);
      if (!room) return;
      const others = [
        ...rooms.filter((r) => r.id !== room.id).flatMap((r) => r.points),
        ...room.points.filter((_, i) => i !== g.index),
      ];
      const np = snapPoint(toPlan(p), { vertices: others, tolerance: 14 / view.s });
      updateRoom(room.id, { points: room.points.map((pt, i) => (i === g.index ? np : pt)) });
    }
  };

  const handleTap = (sp: Pt, target: TapTarget) => {
    const pp = toPlan(sp);
    if (planMode === 'arrange') {
      if (target.kind === 'item') selectItem(target.id);
      else if (target.kind === 'roomchip') selectRoom(target.id);
      else selectItem(null);
      return;
    }
    // 도면 편집
    if (editTool === 'draw') {
      const tol = 16 / view.s;
      if (drawPts.length >= 3 && dist(pp, drawPts[0]) <= tol) {
        finishDrawing();
        return;
      }
      const np = snapPoint(pp, {
        prev: drawPts[drawPts.length - 1],
        vertices: [...allVertices, ...drawPts],
        tolerance: tol,
      });
      setDrawPts((prev) => [...prev, np]);
    } else if (editTool === 'calibrate') {
      const np = snapPoint(pp, { vertices: allVertices, tolerance: 10 / view.s });
      const next = [...calPts, np];
      setCalPts(next);
      if (next.length === 2) setCalInput('');
    } else {
      if (target.kind === 'room' || target.kind === 'roomchip') selectRoom(target.id);
      else selectRoom(null);
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    const p = localPt(e);
    pointers.current.delete(e.pointerId);
    if (g.type === 'pan' && !g.moved) handleTap(p, g.target);
    if (g.type === 'item' && !g.moved) selectItem(g.id);
    if (pointers.current.size === 0) gesture.current = { type: 'none' };
    else if (g.type === 'pinch') {
      // 손가락 하나 남으면 이어서 이동
      const [rest] = [...pointers.current.values()];
      gesture.current = { type: 'pan', start: rest, view, moved: true, target: { kind: 'empty' } };
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    const sp = localPt(e);
    const anchor = toPlan(sp);
    const s = Math.min(MAX_S, Math.max(MIN_S, view.s * Math.exp(-e.deltaY * 0.0015)));
    setView({ s, cx: anchor.x - (sp.x - size.w / 2) / s, cy: anchor.y - (sp.y - size.h / 2) / s });
  };

  const finishDrawing = () => {
    if (drawPts.length < 3) return;
    setPendingRoom(drawPts);
    setPendingName(`방 ${rooms.length + 1}`);
    setPendingColor(ROOM_COLOR_PRESETS[rooms.length % ROOM_COLOR_PRESETS.length]);
    setDrawPts([]);
  };

  const savePendingRoom = () => {
    if (!pendingRoom) return;
    addRoom({ name: pendingName.trim() || '이름 없는 방', points: pendingRoom, color: pendingColor });
    setPendingRoom(null);
  };

  const applyCalibration = () => {
    const real = Number(calInput);
    const measured = calPts.length === 2 ? dist(calPts[0], calPts[1]) : 0;
    if (real > 0 && measured > 0) {
      rescalePlan(real / measured);
      setTimeout(() => window.dispatchEvent(new Event('plan:fit')), 0);
      setEditTool('draw');
    }
    setCalPts([]);
  };

  const inv = 1 / view.s; // 화면 1px = inv cm
  const isEdit = planMode === 'edit';
  const transform = `translate(${size.w / 2 - view.cx * view.s} ${size.h / 2 - view.cy * view.s}) scale(${view.s})`;
  const gridStep = view.s < 0.35 ? 100 : 50;

  return (
    <div className="plan-wrap" ref={wrapRef}>
      <svg
        className="plan-svg"
        width={size.w}
        height={size.h}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <defs>
          <pattern
            id="grid"
            width={gridStep}
            height={gridStep}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${gridStep} 0 L 0 0 0 ${gridStep}`}
              fill="none"
              stroke="#c9d6e6"
              strokeWidth={inv}
            />
          </pattern>
        </defs>
        <g transform={transform}>
          <rect x={-20000} y={-20000} width={40000} height={40000} fill="url(#grid)" />

          {background && (
            <image
              href={background.dataUrl}
              x={background.x}
              y={background.y}
              width={background.naturalWidth * background.cmPerPx}
              height={background.naturalHeight * background.cmPerPx}
              opacity={background.opacity}
              preserveAspectRatio="none"
              style={{ pointerEvents: 'none' }}
            />
          )}

          {rooms.map((r) => (
            <polygon
              key={r.id}
              data-room={r.id}
              points={r.points.map((p) => `${p.x},${p.y}`).join(' ')}
              fill={r.color}
              fillOpacity={isEdit && background ? 0.45 : 0.95}
              stroke={isEdit && selectedRoomId === r.id ? '#ff6f91' : 'none'}
              strokeWidth={4 * inv}
            />
          ))}

          <path
            d={walls.map((w) => `M${w.a.x},${w.a.y} L${w.b.x},${w.b.y}`).join(' ')}
            stroke="#5b5170"
            strokeOpacity={isEdit && background ? 0.75 : 1}
            strokeWidth={WALL_THICKNESS}
            strokeLinecap="square"
            fill="none"
            style={{ pointerEvents: 'none' }}
          />

          {/* 가구·가전 */}
          <g opacity={isEdit ? 0.35 : 1} style={{ pointerEvents: isEdit ? 'none' : 'auto' }}>
            {placed.map((it) => {
              const p = it.placement;
              const sel = it.id === selectedItemId;
              const color = it.color ?? '#efe3d3';
              const isThin = p.d <= 20; // 문·창문·TV
              const iconSize = Math.max(14 * inv, Math.min(46, Math.min(p.w, Math.max(p.d, 30)) * 0.55));
              const count = stuffCount.get(it.id) ?? 0;
              const rad = (p.rot * Math.PI) / 180;
              const halfH = Math.abs((p.w / 2) * Math.sin(rad)) + Math.abs((p.d / 2) * Math.cos(rad));
              const halfW = Math.abs((p.w / 2) * Math.cos(rad)) + Math.abs((p.d / 2) * Math.sin(rad));
              // IoT 기기는 실제 크기 대신 화면에 늘 보이는 핀으로
              if (it.category === 'iot') {
                return (
                  <g key={it.id} data-item={it.id} transform={`translate(${p.x} ${p.y}) scale(${inv})`} className="plan-item plan-pin">
                    <circle r={15} fill="#fff" stroke={sel ? '#ff6f91' : '#4aa8e8'} strokeWidth={sel ? 3.5 : 2.5} />
                    <text className="plan-emoji" fontSize={15} y={1} textAnchor="middle" dominantBaseline="middle">
                      {it.emoji}
                    </text>
                    {(sel || view.s > 0.9) && (
                      <text className="plan-item-name" y={28} textAnchor="middle">
                        {it.name}
                      </text>
                    )}
                  </g>
                );
              }
              return (
                <g key={it.id} data-item={it.id} transform={`translate(${p.x} ${p.y})`} className="plan-item">
                  <g transform={`rotate(${p.rot})`}>
                    <rect
                      x={-p.w / 2}
                      y={-p.d / 2}
                      width={p.w}
                      height={p.d}
                      rx={Math.min(8, p.w / 6, p.d / 3)}
                      fill={color}
                      fillOpacity={p.h <= 2 ? 0.6 : 1}
                      stroke={sel ? '#ff6f91' : darken(color, 0.3)}
                      strokeWidth={(sel ? 3.5 : 1.5) * inv}
                    />
                    {/* 정면 표시 (아래쪽이 앞) */}
                    {!isThin && p.h > 2 && (
                      <line
                        x1={-p.w / 2 + 4}
                        x2={p.w / 2 - 4}
                        y1={p.d / 2 - 4}
                        y2={p.d / 2 - 4}
                        stroke={darken(color, 0.25)}
                        strokeWidth={2 * inv}
                        strokeLinecap="round"
                      />
                    )}
                  </g>
                  <text
                    className="plan-emoji"
                    fontSize={iconSize}
                    y={iconSize * 0.05}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {it.emoji}
                  </text>
                  {(sel || halfW * 2 * view.s > 90) && (
                    <g transform={`translate(0 ${halfH + 2}) scale(${inv})`}>
                      <text className="plan-item-name" y={10} textAnchor="middle">
                        {it.name}
                        {sel ? ` · ${p.w}×${p.d}` : ''}
                      </text>
                    </g>
                  )}
                  {count > 0 && (
                    <g transform={`translate(${halfW} ${-halfH}) scale(${inv})`}>
                      <circle r={9} fill="#ff5c72" stroke="#fff" strokeWidth={2} />
                      <text className="plan-badge" textAnchor="middle" dominantBaseline="central">
                        {count}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* 방 이름 칩 */}
          {rooms.map((r) => {
            const lp = labelPoint(r.points);
            const count = stuffCount.get(r.id) ?? 0;
            const label = count > 0 ? `${r.name} · 📦${count}` : r.name;
            const w = label.length * 11 + 22;
            return (
              <g
                key={r.id}
                data-roomchip={r.id}
                transform={`translate(${lp.x} ${lp.y}) scale(${inv})`}
                className="plan-roomchip"
              >
                <rect x={-w / 2} y={-14} width={w} height={isEdit ? 40 : 28} rx={14} fill="#fff" fillOpacity={0.92} />
                <text y={1} textAnchor="middle" dominantBaseline="middle" className="plan-roomchip-name">
                  {label}
                </text>
                {isEdit && (
                  <text y={18} textAnchor="middle" dominantBaseline="middle" className="plan-roomchip-area">
                    {formatArea(r.points)}
                  </text>
                )}
              </g>
            );
          })}

          {/* 편집: 벽 길이 */}
          {isEdit &&
            rooms.map((r) =>
              r.points.map((a, i) => {
                const b = r.points[(i + 1) % r.points.length];
                const L = dist(a, b);
                if (L * view.s < 50) return null;
                return (
                  <g
                    key={`${r.id}-${i}`}
                    transform={`translate(${(a.x + b.x) / 2} ${(a.y + b.y) / 2}) scale(${inv})`}
                    style={{ pointerEvents: 'none' }}
                  >
                    <text className="plan-dim" textAnchor="middle" dominantBaseline="middle">
                      {formatLen(L)}
                    </text>
                  </g>
                );
              }),
            )}

          {/* 편집: 선택한 방 꼭짓점 */}
          {isEdit &&
            editTool === 'select' &&
            rooms
              .filter((r) => r.id === selectedRoomId)
              .flatMap((r) =>
                r.points.map((p, i) => (
                  <circle
                    key={`${r.id}-v${i}`}
                    data-vertex={i}
                    cx={p.x}
                    cy={p.y}
                    r={11 * inv}
                    fill="#fff"
                    stroke="#ff6f91"
                    strokeWidth={3 * inv}
                  />
                )),
              )}

          {/* 방 그리는 중 */}
          {drawPts.length > 0 && (
            <g style={{ pointerEvents: 'none' }}>
              <polyline
                points={drawPts.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="#ff6f91"
                fillOpacity={0.12}
                stroke="#ff6f91"
                strokeWidth={WALL_THICKNESS * 0.7}
                strokeLinejoin="round"
              />
              {drawPts.map((p, i) => (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={(i === 0 ? 12 : 6) * inv}
                  fill={i === 0 ? '#fff' : '#ff6f91'}
                  stroke="#ff6f91"
                  strokeWidth={3 * inv}
                />
              ))}
              {drawPts.slice(1).map((p, i) => {
                const a = drawPts[i];
                return (
                  <g key={`d${i}`} transform={`translate(${(a.x + p.x) / 2} ${(a.y + p.y) / 2}) scale(${inv})`}>
                    <text className="plan-dim plan-dim-accent" textAnchor="middle" dominantBaseline="middle">
                      {formatLen(dist(a, p))}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* 치수 맞추기 */}
          {calPts.length > 0 && (
            <g style={{ pointerEvents: 'none' }}>
              {calPts.length === 2 && (
                <line
                  x1={calPts[0].x}
                  y1={calPts[0].y}
                  x2={calPts[1].x}
                  y2={calPts[1].y}
                  stroke="#2ecc9b"
                  strokeWidth={4 * inv}
                  strokeDasharray={`${8 * inv} ${5 * inv}`}
                />
              )}
              {calPts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={8 * inv} fill="#2ecc9b" stroke="#fff" strokeWidth={2 * inv} />
              ))}
            </g>
          )}
        </g>
      </svg>

      <button className="plan-fit-btn" onClick={fit} aria-label="전체 보기">
        ⤢
      </button>

      {pendingRoom && (
        <div className="plan-popup pixel-panel">
          <div className="plan-popup-title">방 이름을 정해주세요</div>
          <div className="plan-popup-sub">{formatArea(pendingRoom)}</div>
          <input
            className="form-input"
            value={pendingName}
            onChange={(e) => setPendingName(e.target.value)}
            autoFocus
          />
          <div className="floorplan-color-picker">
            {ROOM_COLOR_PRESETS.map((c) => (
              <button
                key={c}
                className={`floorplan-swatch ${pendingColor === c ? 'floorplan-swatch-active' : ''}`}
                style={{ background: c }}
                onClick={() => setPendingColor(c)}
                aria-label={c}
              />
            ))}
          </div>
          <div className="modal-actions">
            <button className="pixel-btn" onClick={() => setPendingRoom(null)}>
              취소
            </button>
            <button className="pixel-btn pixel-btn-accent" onClick={savePendingRoom}>
              저장
            </button>
          </div>
        </div>
      )}

      {calPts.length === 2 && (
        <div className="plan-popup pixel-panel">
          <div className="plan-popup-title">이 길이는 실제로 몇 cm인가요?</div>
          <div className="plan-popup-sub">
            도면에 적힌 치수를 넣으면 전체 크기가 그에 맞게 조정돼요. (지금: {formatLen(dist(calPts[0], calPts[1]))})
          </div>
          <input
            className="form-input"
            type="number"
            inputMode="numeric"
            placeholder="예: 3600"
            value={calInput}
            onChange={(e) => setCalInput(e.target.value)}
            autoFocus
          />
          <div className="modal-actions">
            <button className="pixel-btn" onClick={() => setCalPts([])}>
              다시 찍기
            </button>
            <button className="pixel-btn pixel-btn-mint" onClick={applyCalibration} disabled={!(Number(calInput) > 0)}>
              맞추기
            </button>
          </div>
        </div>
      )}

      {isEdit && editTool === 'draw' && drawPts.length > 0 && !pendingRoom && (
        <div className="plan-draw-actions">
          <button className="pixel-btn pixel-btn-sm" onClick={() => setDrawPts((p) => p.slice(0, -1))}>
            ↶ 점 취소
          </button>
          <button
            className="pixel-btn pixel-btn-sm pixel-btn-accent"
            disabled={drawPts.length < 3}
            onClick={finishDrawing}
          >
            ✓ 방 완성
          </button>
        </div>
      )}
    </div>
  );
}
