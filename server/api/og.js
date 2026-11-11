// 상품 페이지에서 대표 이미지·이름·브랜드를 읽어 주는 함수 (우리집 인벤토리 옷장용)
const ALLOWED = ['https://chewrispy.github.io', 'https://bomi.kim', 'http://localhost:4173', 'http://localhost:5173'];

const decode = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));

function meta(html, key) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${key}["']`,
    'i',
  );
  const m = html.match(re);
  return m ? decode((m[1] || m[2]).trim()) : undefined;
}

function jsonLdProduct(html) {
  const blocks = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const b of blocks) {
    try {
      const data = JSON.parse(b[1].trim());
      const list = Array.isArray(data) ? data : data['@graph'] || [data];
      const p = list.find((x) => x && (x['@type'] === 'Product' || (Array.isArray(x['@type']) && x['@type'].includes('Product'))));
      if (p) {
        const img = Array.isArray(p.image) ? p.image[0] : typeof p.image === 'object' ? p.image?.url : p.image;
        const brand = typeof p.brand === 'object' ? p.brand?.name : p.brand;
        return { name: p.name, image: img, brand };
      }
    } catch {
      /* 잘못된 JSON-LD는 무시 */
    }
  }
  return {};
}

function isPrivateHost(host) {
  return /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?$|.*\.internal$)/i.test(host);
}

export default async function handler(req, res) {
  const origin = req.headers.origin || '';
  if (ALLOWED.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  if (req.method === 'OPTIONS') return res.status(204).end();

  let target;
  try {
    target = new URL(String(req.query.url || ''));
  } catch {
    return res.status(400).json({ error: 'bad-url' });
  }
  if (!/^https?:$/.test(target.protocol) || isPrivateHost(target.hostname)) {
    return res.status(400).json({ error: 'bad-url' });
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(target, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    const html = (await r.text()).slice(0, 2_000_000);
    const ld = jsonLdProduct(html);
    const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1];
    let image = meta(html, 'og:image') || meta(html, 'og:image:secure_url') || meta(html, 'twitter:image') || ld.image;
    if (image) image = new URL(image, r.url).toString();
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).json({
      url: r.url,
      status: r.status,
      title: ld.name || meta(html, 'og:title') || (titleTag ? decode(titleTag.trim()) : undefined),
      siteName: meta(html, 'og:site_name'),
      brand: ld.brand || meta(html, 'product:brand') || meta(html, 'og:brand'),
      image,
    });
  } catch (e) {
    return res.status(502).json({ error: 'fetch-failed', message: String(e && e.name) });
  } finally {
    clearTimeout(timer);
  }
}
