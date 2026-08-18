import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** anon 키 전용 클라이언트. 환경변수가 없으면 null (앱은 정적 콘텐츠만 표시). */
export const supabase =
  url && anonKey ? createClient<Database>(url, anonKey) : null;

/**
 * Supabase 없이는 성립하지 않는 경로(관리자 기능, 쓰기 작업)에서 사용한다.
 * 공개 페이지는 supabase가 null이어도 정적 콘텐츠를 보여줘야 하므로 여기를 쓰지 말 것.
 *
 * env가 빠진 채 배포되면 이 함수를 타는 순간 끊겨 원인을 바로 알 수 있다.
 * (모듈 최상단에서 throw하면 앱 전체가 흰 화면이 되므로 호출 시점으로 미룬다.)
 */
export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 없습니다. 로컬은 .env, 배포는 워크플로우 build 스텝의 env를 확인하세요.',
    );
  }
  return supabase;
}

/** Storage 경로(`banner/xxx.png`)를 공개 URL로 변환. 경로가 없으면 null. */
export function getPublicUrl(path: string | null | undefined): string | null {
  if (!path || !supabase) return null;
  return supabase.storage.from('files').getPublicUrl(path).data.publicUrl;
}
