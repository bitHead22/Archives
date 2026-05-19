import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/context/AuthContext';

export function useSolvedPapers() {
  const { user } = useAuthContext();
  const [solvedPapers, setSolvedPapers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSolved() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('solved_papers')
        .select('paper_id, solved')
        .eq('user_id', user.id);
        
      if (!error && data) {
        const map = {};
        data.forEach(row => { 
          map[row.paper_id] = row.solved;
        });
        setSolvedPapers(map);
      } else if (error) {
        console.error("Error fetching solved papers", error);
      }
      setLoading(false);
    }
    
    fetchSolved();
  }, [user]);

  const toggleSolved = async (paperId, isSolved) => {
    if (!user?.id) return;
    
    // Optimistic UI update
    setSolvedPapers(prev => ({...prev, [paperId]: isSolved}));
    
    const { error } = await supabase
      .from('solved_papers')
      .upsert({
        user_id: user.id,
        paper_id: paperId,
        solved: isSolved,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,paper_id' });
      
    if (error) {
       console.error("Failed to update solved status", error);
       // revert on failure
       setSolvedPapers(prev => ({...prev, [paperId]: !isSolved}));
    }
  };

  return { solvedPapers, toggleSolved, loading };
}
