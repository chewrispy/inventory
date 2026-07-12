import { CATEGORY_LABEL, type InventoryItem } from '../types';

export function buildDaangnDraft(item: InventoryItem, qty: number = item.quantity): string {
  const lines = [
    `[${item.name}] 팝니다`,
    item.price ? `희망가격: ${item.price.toLocaleString()}원` : '가격: 나눔/제안 환영',
    `카테고리: ${CATEGORY_LABEL[item.category]}`,
    item.condition ? `상태: ${item.condition}` : undefined,
    qty > 1 ? `수량: ${qty}개` : undefined,
    item.memo ? `\n${item.memo}` : undefined,
    '\n집 정리하다가 내놓아요. 직거래 환영합니다 🥕',
  ].filter(Boolean);
  return lines.join('\n');
}

export function buildDaangnBulkDraft(
  entries: { item: InventoryItem; qty: number }[],
): string {
  const header = '집 정리하며 한번에 내놓는 물건들이에요 🥕\n';
  const body = entries
    .map(({ item, qty }) => {
      const price = item.price ? `${item.price.toLocaleString()}원` : '가격 제안';
      return `- ${item.name} x${qty} (${price})`;
    })
    .join('\n');
  return `${header}\n${body}\n\n댓글이나 채팅으로 문의 주세요!`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const DAANGN_URL = 'https://www.daangn.com/';
