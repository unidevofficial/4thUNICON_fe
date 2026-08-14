import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { WORK_LIST_COLUMNS, type Work } from '../data/works';

type State = {
  works: Work[];
  loading: boolean;
  error: string | null;
};

/**
 * 출품작 목록을 한 번만 받아온다. 검색·필터·정렬은 전부 클라이언트에서 처리한다.
 * (한글 부분검색 ilike는 인덱스를 못 타고, 서버 랜덤 정렬은 요청마다 순서가 바뀐다)
 */
export function useWorks(): State {
  const [state, setState] = useState<State>({ works: [], loading: true, error: null });

  useEffect(() => {
    let alive = true;

    supabase
      .from('project_with_genres')
      .select(WORK_LIST_COLUMNS)
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) {
          setState({ works: [], loading: false, error: error.message });
          return;
        }
        setState({ works: (data ?? []) as Work[], loading: false, error: null });
      });

    return () => {
      alive = false;
    };
  }, []);

  return state;
}
