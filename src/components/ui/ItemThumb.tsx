import type { InventoryItem } from '../../types';
import { thumbUrl } from '../../utils/productLink';

/** 물건(옷 포함)에 붙은 사진 주소 — 직접 찍은 사진 우선 */
export function itemPhoto(it: InventoryItem): { src: string; original?: string } | null {
  const photo = it.photo ?? it.clothing?.photo;
  if (photo) return { src: photo };
  const url = it.imageUrl ?? it.clothing?.imageUrl;
  return url ? { src: thumbUrl(url, 300), original: url } : null;
}

export default function ItemThumb({ item, className = 'mini-swatch' }: { item: InventoryItem; className?: string }) {
  const ph = itemPhoto(item);
  return (
    <span className={`${className} thumb`} style={!ph && item.placement ? { background: item.color } : undefined}>
      {ph ? (
        <img
          src={ph.src}
          alt=""
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            if (ph.original && e.currentTarget.src !== ph.original) e.currentTarget.src = ph.original;
          }}
        />
      ) : (
        item.emoji
      )}
    </span>
  );
}
