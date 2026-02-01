import { Database } from './supabase';

export type Lineup = Database['public']['Tables']['lineups']['Row'];

export interface Filters {
    side: { t: boolean; ct: boolean };
    utility: { smoke: boolean; flash: boolean; molotov: boolean; he: boolean };
}

export type CreateStep = 'placement' | 'details' | 'upload';

export interface NewLineupState {
    landing: { x: number; y: number } | null;
    origin: { x: number; y: number } | null;
    title: string;
    side: 't' | 'ct';
    type: 'smoke' | 'flash' | 'molotov' | 'he';
    description: string;
    images: {
        pos: File | null;
        aim: File | null;
        result: File | null;
    };
}
