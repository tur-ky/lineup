import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lineup, Filters } from '../types/app';

export const useLineups = (activeMap: string, filters: Filters) => {
    const [lineups, setLineups] = useState<Lineup[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Fetch & Realtime Subscription
    useEffect(() => {
        setLoading(true);

        // 1. Fetch Initial Data
        const fetchLineups = async () => {
            const { data, error } = await supabase
                .from('lineups')
                .select('*')
                .eq('map_name', activeMap.toLowerCase());

            if (error) console.error('Error fetching lineups:', error);
            else setLineups(data || []);
            setLoading(false);
        };

        fetchLineups();

        // 2. Subscribe to Realtime Changes
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
                    const activeMapLower = activeMap.toLowerCase();

                    if (payload.eventType === 'INSERT') {
                        const newLineup = payload.new as Lineup;
                        if (newLineup.map_name === activeMapLower) {
                            setLineups(prev => [...prev, newLineup]);
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
    }, [activeMap]);

    // Client-side Filtering (for smooth toggle performance)
    const filteredLineups = lineups.filter(lineup => {
        if (!filters.side[lineup.side]) return false;
        if (!filters.utility[lineup.utility_type]) return false;
        return true;
    });

    return { lineups: filteredLineups, loading };
};
