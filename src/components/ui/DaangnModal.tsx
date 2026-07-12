import type { InventoryItem } from '../../types';
import { buildDaangnDraft } from '../../utils/daangnDraft';
import DraftModal from './DraftModal';

interface Props {
  item: InventoryItem;
  onClose: () => void;
}

export default function DaangnModal({ item, onClose }: Props) {
  return (
    <DraftModal
      title="🥕 당근마켓 등록 초안"
      note='당근마켓은 외부 앱의 자동 등록을 지원하지 않아요. 아래 글을 복사해서 당근마켓 앱/웹의 "글쓰기"에 붙여넣어 주세요!'
      initialText={buildDaangnDraft(item)}
      onClose={onClose}
    />
  );
}
