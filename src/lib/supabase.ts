import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 빌드 스텝에 env가 빠지면 런타임에 조용히 undefined가 되어 원인 찾기가 어렵다.
// 배포 워크플로우에 VITE_SUPABASE_* 를 넣었는지 즉시 알 수 있도록 여기서 끊는다.
if (!url || !anonKey) {
  throw new Error(
    'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 없습니다. 로컬은 .env, 배포는 워크플로우 build 스텝의 env를 확인하세요.',
  );
}

/** anon 키 전용 클라이언트. service_role 키는 절대 프론트에 두지 않는다. */
export const supabase = createClient<Database>(url, anonKey);

/** Storage 경로(`banner/xxx.png`)를 공개 URL로 변환. 경로가 없으면 null. */
export function getPublicUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return supabase.storage.from('files').getPublicUrl(path).data.publicUrl;
}
