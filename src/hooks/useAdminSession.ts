import { useEffect, useRef, useState } from 'react';
import { requireSupabase, supabase } from '../lib/supabase';

type AdminSession = {
  /** 로그인 여부 */
  signedIn: boolean;
  /** admin 테이블에 등록된 계정인지. 실제 차단은 RLS가 하고, 이건 UI 편의용이다. */
  isAdmin: boolean;
  loading: boolean;
};

/**
 * 세션만 확인하면 "로그인은 됐지만 관리자가 아닌" 계정도 통과하므로
 * is_admin() RPC까지 함께 판정한다.
 */
export function useAdminSession(): AdminSession {
  const [state, setState] = useState<AdminSession>({
    signedIn: false,
    isAdmin: false,
    loading: true,
  });
  /** 마지막으로 판정한 로그인 여부. state는 비동기라 이벤트 비교에 쓸 수 없다. */
  const signedInRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!supabase) {
      setState({ signedIn: false, isAdmin: false, loading: false });
      return;
    }

    let alive = true;

    async function resolve(signedIn: boolean) {
      signedInRef.current = signedIn;
      if (!signedIn) {
        if (alive) setState({ signedIn: false, isAdmin: false, loading: false });
        return;
      }
      const { data, error } = await requireSupabase().rpc('is_admin');
      if (!alive) return;
      setState({ signedIn: true, isAdmin: !error && data === true, loading: false });
    }

    supabase.auth.getSession().then(({ data }) => {
      void resolve(Boolean(data.session));
    });

    // 로그인/로그아웃 후 가드가 즉시 반영되도록 구독한다.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = Boolean(session);
      /*
       * supabase는 탭이 다시 보일 때(visibilitychange)와 토큰 갱신 때도
       * SIGNED_IN을 재통지한다. 그때마다 loading을 켜면 AdminGuard가 children을
       * 언마운트해서 작성 중이던 폼 입력까지 날아간다. 로그인 여부가 실제로
       * 바뀐 경우에만 다시 판정한다.
       */
      if (signedInRef.current === next) return;

      setState((prev) => ({ ...prev, loading: true }));
      void resolve(next);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
