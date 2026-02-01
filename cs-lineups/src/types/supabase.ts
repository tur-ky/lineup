export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            lineups: {
                Row: {
                    id: string
                    created_at: string
                    title: string
                    map_name: string
                    side: 't' | 'ct'
                    utility_type: 'smoke' | 'flash' | 'molotov' | 'he'
                    landing_x: number
                    landing_y: number
                    origin_x: number | null
                    origin_y: number | null
                    image_pos_path: string | null
                    image_aim_path: string | null
                    image_result_path: string | null
                    description: string | null
                    user_id: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    title: string
                    map_name: string
                    side: 't' | 'ct'
                    utility_type: 'smoke' | 'flash' | 'molotov' | 'he'
                    landing_x: number
                    landing_y: number
                    origin_x?: number | null
                    origin_y?: number | null
                    image_pos_path?: string | null
                    image_aim_path?: string | null
                    image_result_path?: string | null
                    description?: string | null
                    user_id?: string // Handled by RLS usually, but useful for types
                }
                Update: {
                    id?: string
                    created_at?: string
                    title?: string
                    map_name?: string
                    side?: 't' | 'ct'
                    utility_type?: 'smoke' | 'flash' | 'molotov' | 'he'
                    landing_x?: number
                    landing_y?: number
                    origin_x?: number | null
                    origin_y?: number | null
                    image_pos_path?: string | null
                    image_aim_path?: string | null
                    image_result_path?: string | null
                    description?: string | null
                    user_id?: string
                }
            }
        }
    }
}
