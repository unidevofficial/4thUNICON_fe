import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!supabase) {
      setState({ signedIn: false, isAdmin: false, loading: false });
      return;
    }

    let alive = true;

    async function resolve(signedIn: boolean) {
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
      setState((prev) => ({ ...prev, loading: true }));
      void resolve(Boolean(session));
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
