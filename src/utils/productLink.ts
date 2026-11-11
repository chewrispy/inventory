/** 상품 페이지 링크에서 대표 이미지·이름·브랜드를 가져오기 (microlink 무료 API, 하루 50회 정도) */
import type { ClothType } from '../types';

const TYPE_HINTS: [ClothType, RegExp][] = [
  ['아우터', /자켓|재킷|점퍼|코트|패딩|블루종|바람막이|아노락|베스트|조끼|가디건|카디건|jacket|coat|parka|blazer|블레이저/i],
  ['원피스', /원피스|드레스|dress|점프수트/i],
  ['하의', /팬츠|바지|슬랙스|데님|진\b|청바지|스커트|치마|쇼츠|반바지|레깅스|조거|pants|jeans|skirt|shorts/i],
  ['신발', /스니커즈|운동화|신발|로퍼|부츠|샌들|슬리퍼|구두|뮬|플랫|힐|sneaker|shoe|boots|loafer/i],
  ['가방', /가방|백팩|토트|숄더백|크로스백|클러치|파우치|bag|backpack/i],
  ['액세서리', /모자|캡|비니|목도리|머플러|스카프|벨트|장갑|양말|귀걸이|목걸이|반지|시계|안경|선글라스|cap|hat|beanie|scarf|belt/i],
  ['상의', /티셔츠|셔츠|블라우스|니트|스웨터|맨투맨|후드|탑|크루넥|tee|t-shirt|shirt|knit|sweater|hoodie/i],
];

export function guessClothType(title?: string): ClothType | undefined {
  if (!title) return undefined;
  return TYPE_HINTS.find(([, re]) => re.test(title))?.[0];
}

export interface ProductInfo {
  imageUrl?: string;
  title?: string;
  brand?: string;
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i;

export function looksLikeImageUrl(url: string) {
  return IMAGE_EXT.test(url) || /\/(images?|img|goods_img)\//i.test(url);
}

function cleanTitle(t: string, publisher?: string) {
  // "상품명 - 사이즈 & 후기 | 무신사", "상품명 | UNIQLO KR", "상품명 - The Harvard Shop" → "상품명"
  let out = t.split(/\s[|｜]\s/)[0].split(/\s-\s(사이즈|구매|후기)/)[0].trim();
  const parts = out.split(/\s[-–—]\s/);
  const last = parts[parts.length - 1];
  if (parts.length > 1 && (last === publisher || /shop|store|official|몰|스토어|공식/i.test(last))) {
    out = parts.slice(0, -1).join(' - ');
  }
  return out.trim();
}

/** 상품명에 들어 있으면 쇼핑몰 이름보다 우선하는 브랜드 */
const KNOWN_BRANDS = [
  'Patagonia', 'The North Face', 'Nike', 'Adidas', 'New Balance', 'Arc\'teryx', 'Columbia', 'Ralph Lauren', 'Polo',
  'Lacoste', 'Levi\'s', 'Uniqlo', 'Zara', 'COS', 'H&M', 'Muji', 'Gap', 'J.Crew', 'Champion', 'Carhartt', 'Stussy',
  'Converse', 'Vans', 'Birkenstock', 'Dr. Martens', 'Asics', 'Salomon', 'Hoka', 'On', 'Lululemon', 'Gucci', 'Prada',
  'Burberry', 'Maison Kitsune', 'Ami', 'Acne Studios', 'Apple', 'Samsung',
];

function brandFromTitle(title: string) {
  return KNOWN_BRANDS.filter((b) => b.length > 2).find((b) =>
    new RegExp(`(^|[^A-Za-z])${b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z]|$)`, 'i').test(title),
  );
}

/** 큰 원본 사진을 작게 줄여서 보여주는 주소 (images.weserv.nl) — 실패하면 원본으로 */
export function thumbUrl(url: string, size = 400) {
  if (!/^https?:/.test(url)) return url;
  return `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=${size}&h=${size}&fit=inside&output=jpg&q=80`;
}

export async function fetchProductInfo(url: string): Promise<ProductInfo> {
  if (looksLikeImageUrl(url)) return { imageUrl: url };
  // 처음 보는 페이지는 응답이 느릴 때가 있어서 한 번 더 시도
  const first = await fetchOnce(url);
  return first.imageUrl || first.title ? first : fetchOnce(url);
}

/** 보미 Vercel 계정의 inventory-api (server/api/og.js) */
const OWN_API = 'https://inventory-api-chewrispys-projects.vercel.app/api/og';

async function fetchOwn(url: string): Promise<ProductInfo | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(`${OWN_API}?url=${encodeURIComponent(url)}`, { signal: ctrl.signal });
    if (!res.ok) return null;
    const d = (await res.json()) as { url?: string; title?: string; siteName?: string; brand?: string; image?: string };
    const productId = new URL(url).pathname.match(/\d{5,}/)?.[0];
    if (productId && d.url && !d.url.includes(productId)) return {};
    const title = d.title ? cleanTitle(d.title, d.siteName) : undefined;
    const fromTitle = title?.match(/^([^\s]+\([^)]+\))\s/)?.[1];
    const known = title ? brandFromTitle(title) : undefined;
    const usable = d.image && !/\.svg(\?|$)/i.test(d.image) && !/logo/i.test(d.image);
    return {
      imageUrl: usable ? d.image : undefined,
      title: fromTitle ? title!.slice(fromTitle.length).trim() : title,
      brand: d.brand || fromTitle || known || undefined,
    };
  } catch {
    return null; // 서버에 못 닿으면 다른 방법으로
  } finally {
    clearTimeout(timer);
  }
}

async function fetchOnce(url: string): Promise<ProductInfo> {
  const own = await fetchOwn(url);
  if (own && (own.imageUrl || own.title)) return own;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30000);
  try {
    const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`, { signal: ctrl.signal });
    const json = (await res.json()) as {
      status: string;
      data?: { url?: string; title?: string; publisher?: string; image?: { url?: string; type?: string } };
    };
    if (json.status !== 'success' || !json.data) return {};
    // 판매 종료 등으로 다른 페이지로 넘어갔으면(상품 번호가 사라짐) 엉뚱한 배너 대신 실패 처리
    const productId = new URL(url).pathname.match(/\d{5,}/)?.[0];
    if (productId && json.data.url && !json.data.url.includes(productId)) return {};
    const img = json.data.image;
    const usable = img?.url && img.type !== 'svg' && !/logo/i.test(img.url);
    // "엠엘비(MLB) 울 빅럭스..." 처럼 제목 앞에 브랜드가 오는 경우
    const publisher = json.data.publisher?.replace(/\s+KR$/i, '');
    const title = json.data.title ? cleanTitle(json.data.title, json.data.publisher) : undefined;
    const fromTitle = title?.match(/^([^\s]+\([^)]+\))\s/)?.[1];
    const known = title ? brandFromTitle(title) : undefined;
    const isStore = publisher && /무신사|29cm|musinsa|shop|store|몰/i.test(publisher);
    return {
      imageUrl: usable ? img!.url : undefined,
      title: fromTitle ? title!.slice(fromTitle.length).trim() : title,
      brand: fromTitle ?? known ?? (publisher && !isStore ? publisher : undefined),
    };
  } catch {
    return {};
  } finally {
    clearTimeout(timer);
  }
}
