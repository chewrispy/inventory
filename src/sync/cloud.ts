import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signInWithCredential,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  connectFirestoreEmulator,
  doc,
  getDoc,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  setDoc,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { create } from 'zustand';
import { useInventoryStore } from '../store/useInventoryStore';
import type { InventoryItem } from '../types';
import { applyDataFixes } from '../data/fixes';

/** 웹 앱 설정값 — 원래 웹페이지에 공개되는 값. 실제 보호는 Firestore 보안 규칙이 담당 */
const firebaseConfig = {
  apiKey: 'AIzaSyD3_BMX3il8eIeyfZuX90djKWZsIxeCMRU',
  authDomain: 'inventory-5452b.firebaseapp.com',
  projectId: 'inventory-5452b',
  storageBucket: 'inventory-5452b.firebasestorage.app',
  messagingSenderId: '264889027486',
  appId: '1:264889027486:web:92f2e5b8a110c70d63e48f',
};

/** 우리 집 데이터 위치: homes/main (방·장바구니 등) + homes/main/items/{id} (물건 하나하나) */
const HOME_ID = 'main';

const useEmulator = new URLSearchParams(location.search).has('emulator');

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
  localCache: useEmulator ? undefined : persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
if (useEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  // 테스트 전용: 에뮬레이터에서만 가짜 구글 계정으로 로그인
  (window as unknown as Record<string, unknown>).__testLogin = (email: string) =>
    signInWithCredential(
      auth,
      GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, email_verified: true })),
    );
}

export type SyncStatus = 'off' | 'loading' | 'synced' | 'saving' | 'offline' | 'denied' | 'error';

interface SyncState {
  user: User | null;
  status: SyncStatus;
  message?: string;
}

export const useSyncStore = create<SyncState>(() => ({ user: null, status: 'off' }));
const setSync = (patch: Partial<SyncState>) => useSyncStore.setState(patch);

/* ---------- 로그인 ---------- */

export async function login() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    const code = (e as { code?: string }).code ?? '';
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider);
    } else if (code !== 'auth/popup-closed-by-user' && code !== 'auth/cancelled-popup-request') {
      setSync({ status: 'error', message: '로그인하지 못했어요. 잠시 후 다시 해주세요.' });
    }
  }
}

export async function logout() {
  await signOut(auth);
}

/* ---------- 동기화 ---------- */

type Meta = Pick<
  ReturnType<typeof useInventoryStore.getState>,
  'rooms' | 'sellBin' | 'shoppingList' | 'lowWalls'
>;

const pickMeta = (s: ReturnType<typeof useInventoryStore.getState>): Meta => ({
  rooms: s.rooms,
  sellBin: s.sellBin,
  shoppingList: s.shoppingList,
  lowWalls: s.lowWalls,
});

// Firestore는 undefined를 저장하지 않으므로 비교도 JSON 기준으로
const stable = (v: unknown) => JSON.stringify(v);

let unsubs: Unsubscribe[] = [];
let applyingRemote = false;
let lastMeta = '';
let lastItems = new Map<string, string>();
let pushTimer: ReturnType<typeof setTimeout> | undefined;
/** 클라우드 데이터를 처음 받기 전에는 올리지 않음 (다른 기기의 옛 데이터가 섞이지 않게) */
let ready = false;

function stop() {
  ready = false;
  unsubs.forEach((u) => u());
  unsubs = [];
  clearTimeout(pushTimer);
  lastMeta = '';
  lastItems = new Map();
}

function applyRemote(fn: () => void) {
  applyingRemote = true;
  try {
    fn();
  } finally {
    applyingRemote = false;
  }
}

async function push() {
  const s = useInventoryStore.getState();
  const metaRef = doc(db, 'homes', HOME_ID);
  const meta = pickMeta(s);
  const metaJson = stable(meta);
  const ops: { kind: 'set' | 'del'; id: string; data?: InventoryItem }[] = [];
  const current = new Map(s.items.map((it) => [it.id, stable(it)]));
  for (const it of s.items) {
    if (lastItems.get(it.id) !== current.get(it.id)) ops.push({ kind: 'set', id: it.id, data: it });
  }
  for (const id of lastItems.keys()) if (!current.has(id)) ops.push({ kind: 'del', id });
  if (metaJson === lastMeta && ops.length === 0) return;

  setSync({ status: navigator.onLine ? 'saving' : 'offline' });
  try {
    if (metaJson !== lastMeta) {
      await setDoc(metaRef, { ...meta, updatedAt: Date.now() });
      lastMeta = metaJson;
    }
    // 한 번에 최대 400개씩
    for (let i = 0; i < ops.length; i += 400) {
      const batch = writeBatch(db);
      for (const op of ops.slice(i, i + 400)) {
        const ref = doc(db, 'homes', HOME_ID, 'items', op.id);
        if (op.kind === 'set') batch.set(ref, op.data!);
        else batch.delete(ref);
      }
      await batch.commit();
    }
    for (const op of ops) {
      if (op.kind === 'set') lastItems.set(op.id, current.get(op.id)!);
      else lastItems.delete(op.id);
    }
    setSync({ status: navigator.onLine ? 'synced' : 'offline' });
  } catch (e) {
    handleError(e);
  }
}

function schedulePush() {
  if (!ready) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => void push(), 700);
}

function handleError(e: unknown) {
  const code = (e as { code?: string }).code ?? '';
  if (code === 'permission-denied') {
    stop();
    setSync({ status: 'denied', message: '이 계정은 우리 집 데이터에 접근할 수 없어요.' });
  } else {
    console.error(e);
    setSync({ status: 'error', message: '클라우드 저장 중 문제가 생겼어요.' });
  }
}

async function start() {
  stop();
  setSync({ status: 'loading', message: undefined });
  const metaRef = doc(db, 'homes', HOME_ID);
  const itemsCol = collection(db, 'homes', HOME_ID, 'items');

  try {
    const snap = await getDoc(metaRef);
    if (!snap.exists()) {
      // 클라우드가 비어 있으면: 이 기기에 있는 데이터를 처음으로 올림
      await push();
    }
  } catch (e) {
    handleError(e);
    return;
  }

  unsubs.push(
    onSnapshot(
      metaRef,
      (snap) => {
        if (!snap.exists() || snap.metadata.hasPendingWrites) return;
        if (snap.metadata.fromCache && !ready) return;
        const d = snap.data() as Partial<Meta>;
        const meta: Meta = {
          rooms: d.rooms ?? [],
          sellBin: d.sellBin ?? [],
          shoppingList: d.shoppingList ?? [],
          lowWalls: d.lowWalls ?? false,
        };
        lastMeta = stable(meta);
        if (lastMeta !== stable(pickMeta(useInventoryStore.getState()))) {
          applyRemote(() => useInventoryStore.setState(meta));
        }
      },
      handleError,
    ),
  );

  unsubs.push(
    onSnapshot(
      itemsCol,
      { includeMetadataChanges: true },
      (snap) => {
        if (snap.metadata.hasPendingWrites) return;
        // 새 기기의 빈 캐시는 '데이터 없음'이 아니라 '아직 모름' — 서버 응답을 기다림
        if (snap.metadata.fromCache && snap.empty) return;
        const items = snap.docs.map((d) => d.data() as InventoryItem);
        lastItems = new Map(items.map((it) => [it.id, stable(it)]));
        const local = useInventoryStore.getState().items;
        const same =
          local.length === items.length && local.every((it) => lastItems.get(it.id) === stable(it));
        if (!same) {
          // 화면 순서가 흔들리지 않게 기존 순서 유지, 새 항목은 뒤에
          const order = new Map(local.map((it, i) => [it.id, i]));
          items.sort((a, b) => (order.get(a.id) ?? 1e9) - (order.get(b.id) ?? 1e9));
          applyRemote(() => useInventoryStore.setState({ items }));
        }
        if (!ready) {
          ready = true;
          // 클라우드에 있는 옛 배치도 한 번 보정 (사용자가 옮긴 가구는 그대로)
          const fixed = applyDataFixes(useInventoryStore.getState().items);
          if (fixed) useInventoryStore.setState({ items: fixed });
        }
        setSync({ status: snap.metadata.fromCache && !navigator.onLine ? 'offline' : 'synced' });
      },
      handleError,
    ),
  );

  unsubs.push(
    useInventoryStore.subscribe((s, prev) => {
      if (applyingRemote) return;
      if (
        s.items !== prev.items ||
        s.rooms !== prev.rooms ||
        s.sellBin !== prev.sellBin ||
        s.shoppingList !== prev.shoppingList ||
        s.lowWalls !== prev.lowWalls
      ) {
        schedulePush();
      }
    }),
  );
}

let started = false;
export function initCloudSync() {
  if (started) return;
  started = true;
  onAuthStateChanged(auth, (user) => {
    setSync({ user });
    if (user) void start();
    else {
      stop();
      setSync({ status: 'off', message: undefined });
    }
  });
  window.addEventListener('online', () => {
    if (useSyncStore.getState().status === 'offline') schedulePush();
  });
}
