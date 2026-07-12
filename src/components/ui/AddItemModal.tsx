import { useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { CATEGORY_LABEL, type Category, type Condition } from '../../types';
import { ROOMS } from '../../data/rooms';

const EMOJI_CHOICES = [
  '📦', '🛋️', '🛏️', '📺', '🧊', '🍲', '🍚', '📚', '🧥', '🧻',
  '🌀', '🪴', '🎮', '👕', '👟', '🧸', '💻', '⚽', '🍷', '🔧',
];

const CONDITIONS: Condition[] = ['새상품', '거의새것', '사용감있음', '많이사용함'];

export default function AddItemModal() {
  const isOpen = useInventoryStore((s) => s.isAddModalOpen);
  const close = useInventoryStore((s) => s.closeAddModal);
  const addItem = useInventoryStore((s) => s.addItem);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('misc');
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<Condition>('사용감있음');
  const [memo, setMemo] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);

  if (!isOpen) return null;

  const reset = () => {
    setName('');
    setCategory('misc');
    setRoomId(ROOMS[0].id);
    setQuantity(1);
    setPrice('');
    setCondition('사용감있음');
    setMemo('');
    setEmoji(EMOJI_CHOICES[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addItem({
      name: name.trim(),
      category,
      roomId,
      position: { x: 0.2 + Math.random() * 0.6, z: 0.2 + Math.random() * 0.6 },
      quantity,
      emoji,
      price: price ? Number(price) : undefined,
      condition,
      memo: memo.trim() || undefined,
    });
    reset();
    close();
  };

  return (
    <div className="modal-backdrop" onClick={close}>
      <form
        className="pixel-panel modal-panel"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <button type="button" className="detail-close" onClick={close}>
          ✕
        </button>
        <h3 className="modal-title">📦 새 물건 추가</h3>

        <label className="form-label">
          이름
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 에어프라이어"
            required
          />
        </label>

        <div className="emoji-picker">
          {EMOJI_CHOICES.map((e) => (
            <button
              type="button"
              key={e}
              className={`emoji-choice ${emoji === e ? 'emoji-choice-active' : ''}`}
              onClick={() => setEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>

        <div className="form-grid">
          <label className="form-label">
            카테고리
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            방
            <select className="form-input" value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              {ROOMS.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            수량
            <input
              type="number"
              min={1}
              className="form-input"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            />
          </label>

          <label className="form-label">
            상태
            <select
              className="form-input"
              value={condition}
              onChange={(e) => setCondition(e.target.value as Condition)}
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="form-label">
            가격 (선택)
            <input
              type="number"
              min={0}
              className="form-input"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="원"
            />
          </label>
        </div>

        <label className="form-label">
          메모
          <textarea
            className="form-input"
            rows={2}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="상태나 특이사항을 적어주세요"
          />
        </label>

        <div className="modal-actions">
          <button type="submit" className="pixel-btn pixel-btn-accent">
            추가하기
          </button>
        </div>
      </form>
    </div>
  );
}
