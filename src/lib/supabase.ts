import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** anon 키 전용 클라이언트. 환경변수가 없으면 null (앱은 정적 콘텐츠만 표시). */
export const supabase =
  url && anonKey ? createClient<Database>(url, anonKey) : null;

/** Storage 경로(`banner/xxx.png`)를 공개 URL로 변환. 경로가 없으면 null. */
export function getPublicUrl(path: string | null | undefined): string | null {
  if (!path || !supabase) return null;
  return supabase.storage.from('files').getPublicUrl(path).data.publicUrl;
}
