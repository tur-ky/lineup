import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Lineup, Filters } from '../types/app';

export const useLineups = (activeMap: string, filters: Filters) => {
    const [lineups, setLineups] = useState<Lineup[]>([]);
    const [loading, setLoading] = useState(true);

    // Memoize the fetch function so it can be exposed and manually triggered
    const refreshLineups = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('lineups')
            .select('*')
            .eq('map_name', activeMap.toLowerCase());

        if (error) {
            console.error('Error fetching lineups:', error);
        } else {
            setLineups(data || []);
        }
        setLoading(false);
    }, [activeMap]);

    // Initial Fetch & Realtime Subscription
    useEffect(() => {
        // 1. Initial Load
        refreshLineups();

        // 2. Subscribe to Realtime Changes (as a backup/sync mechanism)
        const channel = supabase
            .channel('public:lineups')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'lineups',
                },
                (payload: any) => {
                    // We can choose to either re-fetch or optimistically update.
                    // Given the goal is "immediate UI updates" via manual trigger, 
                    // we keep this as a passive listener for other users' changes.
                    // But we'll implementing optimistic updates here just in case.

                    const activeMapLower = activeMap.toLowerCase();

                    if (payload.eventType === 'INSERT') {
                        const newLineup = payload.new as Lineup;
                        if (newLineup.map_name === activeMapLower) {
                            setLineups(prev => {
                                // De-duplicate in case manual refresh already got it
                                if (prev.some(l => l.id === newLineup.id)) return prev;
                                return [...prev, newLineup];
                            });
                        }
                    } else if (payload.eventType === 'DELETE') {
                        setLineups(prev => prev.filter(l => l.id !== payload.old.id));
                    } else if (payload.eventType === 'UPDATE') {
                        setLineups(prev => prev.map(l => l.id === payload.new.id ? payload.new as Lineup : l));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [refreshLineups, activeMap]);

    // Client-side Filtering (for smooth toggle performance)
    const filteredLineups = useMemo(() => {
        return lineups.filter(lineup => {
            if (!filters.side[lineup.side]) return false;
            if (!filters.utility[lineup.utility_type]) return false;
            return true;
        });
    }, [lineups, filters]);

    return { lineups: filteredLineups, loading, refreshLineups };
};
