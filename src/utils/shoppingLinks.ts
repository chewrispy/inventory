export function coupangSearchUrl(query: string): string {
  return `https://www.coupang.com/np/search?q=${encodeURIComponent(query)}`;
}

export function naverShoppingSearchUrl(query: string): string {
  return `https://search.shopping.naver.com/search/all?query=${encodeURIComponent(query)}`;
}
