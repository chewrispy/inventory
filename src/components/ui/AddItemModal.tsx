import { useEffect, useState } from 'react';
import { useInventoryStore } from '../../store/useInventoryStore';
import { CATEGORY_LABEL, type Category, type Condition } from '../../types';

const EMOJI_CHOICES = [
  '📦', '🍚', '🥛', '🍲', '🧻', '🧴', '🪥', '🧥', '👕', '👟',
  '📚', '🧸', '🎮', '💻', '🔧', '🍷', '☕', '🧹', '💊', '🔋',
];

const CONDITIONS: Condition[] = ['새상품', '거의새것', '사용감있음', '많이사용함'];

/** 작은 물건(소모품·옷·책 등)을 방이나 가구 안에 등록 */
export default function AddItemModal() {
  const defaultLocation = useInventoryStore((s) => s.addStuffLocation);
  const close = useInventoryStore((s) => s.closeAddStuff);
  const addItem = useInventoryStore((s) => s.addItem);
  const rooms = useInventoryStore((s) => s.rooms);
  const items = useInventoryStore((s) => s.items);
  const containers = items.filter((it) => it.placement);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('misc');
  const [locationId, setLocationId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<Condition>('사용감있음');
  const [memo, setMemo] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0]);

  const isOpen = defaultLocation !== null;
  useEffect(() => {
    if (isOpen) setLocationId(defaultLocation ?? '');
  }, [isOpen, defaultLocation]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addItem({
      name: name.trim(),
      category,
      quantity,
      emoji,
      price: price ? Number(price) : undefined,
      condition,
      memo: memo.trim() || undefined,
      locationId: locationId || undefined,
    });
    setName('');
    setQuantity(1);
    setPrice('');
    setMemo('');
    close();
  };

  return (
    <div className="modal-backdrop" onClick={close}>
      <form className="pixel-panel modal-panel" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <button type="button" className="detail-close" onClick={close}>
          ✕
        </button>
        <h3 className="modal-title">📦 물건 추가</h3>
        <p className="modal-note">소모품·옷·책처럼 작은 물건은 방이나 가구 안에 넣어둬요.</p>

        <label className="form-label">
          이름
          <input
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 키친타월"
            required
            autoFocus
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

        <label className="form-label">
          어디에 있나요?
          <select className="form-input" value={locationId} onChange={(e) => setLocationId(e.target.value)}>
            <option value="">위치 미정</option>
            <optgroup label="방">
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="가구·가전 안">
              {containers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </optgroup>
          </select>
        </label>

        <div className="form-grid">
          <label className="form-label">
            카테고리
            <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
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
