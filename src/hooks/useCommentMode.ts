import { useCallback, useEffect, useState } from 'react';
import { requireSupabase } from '../lib/supabase';

/**
 * 코멘트 모드 세션. 검증된 단체 코드를 브라우저에 보관한다.
 *
 * 코드 자체를 저장하는 이유: 목록 조회 RPC 가 매 호출마다 코드를 요구한다(서버에서 열람 권한을
 * 확인하므로). 따라서 클라이언트가 코드를 들고 있어야 한다. 코드는 어차피 사용자가 입력한 값이고
 * 단체 공용이라 개인정보가 아니지만, 그래도 노출면을 줄이려고 코멘트 기능에서만 읽는다.
 */
const STORAGE_KEY = 'unicon.comment-mode';

export type CommentSession = {
  code: string;
  orgName: string;
};

function read(): CommentSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CommentSession>;
    if (typeof parsed.code !== 'string' || typeof parsed.orgName !== 'string') return null;
    return { code: parsed.code, orgName: parsed.orgName };
  } catch {
    return null;
  }
}

/** 탭이 여러 개 열려 있을 때 한쪽에서 활성화하면 나머지도 따라오게 한다. */
const listeners = new Set<(session: CommentSession | null) => void>();

function broadcast(session: CommentSession | null) {
  for (const listener of listeners) listener(session);
}

export function useCommentMode() {
  const [session, setSession] = useState<CommentSession | null>(read);

  useEffect(() => {
    listeners.add(setSession);

    // 다른 탭에서 바뀐 경우
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setSession(read());
    };
    window.addEventListener('storage', onStorage);

    return () => {
      listeners.delete(setSession);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  /** 코드를 서버에 검증시키고, 통과하면 세션을 연다. 실패 사유는 문자열로 돌려준다. */
  const activate = useCallback(async (code: string): Promise<string | null> => {
    const trimmed = code.trim();
    if (!trimmed) return '코드를 입력해 주세요.';

    const { data, error } = await requireSupabase().rpc('verify_comment_code', {
      p_code: trimmed,
    });

    if (error) return '유효하지 않은 코드입니다.';

    const org = data?.[0];
    if (!org) return '유효하지 않은 코드입니다.';

    const next = { code: trimmed, orgName: org.org_name };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    broadcast(next);
    return null;
  }, []);

  const deactivate = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    broadcast(null);
  }, []);

  return { session, activate, deactivate };
}
