import { useMemo } from 'react';
import { Lineup } from '../types/app';

interface Point {
    x: number;
    y: number;
}

export type ClusterItem =
    | { type: 'single', data: Lineup }
    | {
        type: 'cluster',
        x: number,
        y: number,
        items: Lineup[],
        utility_type: 'smoke' | 'flash' | 'molotov' | 'he'
    };

// Distance formula (squared euclidean to avoid sqrt for performance)
const getDistanceSq = (p1: Point, p2: Point) => {
    return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;
};

// Simple greedy clustering
export const useClusters = (lineups: Lineup[], radius: number = 30): ClusterItem[] => { // Default radius 30px (generous overlap)
    return useMemo(() => {
        if (!lineups.length) return [];

        const clusters: ClusterItem[] = [];
        const processed = new Set<string>();
        const radiusSq = radius * radius;

        // Sort by y to optimize search
        const sortedLineups = [...lineups].sort((a, b) => a.landing_y - b.landing_y);

        for (let i = 0; i < sortedLineups.length; i++) {
            const current = sortedLineups[i];
            if (processed.has(current.id)) continue;

            // Start a new potential cluster
            const group: Lineup[] = [current];
            processed.add(current.id);

            // Find neighbors
            for (let j = i + 1; j < sortedLineups.length; j++) {
                const neighbor = sortedLineups[j];
                if (processed.has(neighbor.id)) continue;

                // Requirement: Same utility type
                if (neighbor.utility_type !== current.utility_type) continue;

                // Optimization: if Y distance is already too big, stop checking
                if (Math.abs(neighbor.landing_y - current.landing_y) > radius) {
                    // Since sorted by Y, we can't break immediately because next item might be closer in Y but further in index?
                    // Actually yes we can break if strict Y diff > radius, because all subsequent items will have even larger Y diff.
                    break;
                }

                const distSq = getDistanceSq(
                    { x: current.landing_x, y: current.landing_y },
                    { x: neighbor.landing_x, y: neighbor.landing_y }
                );

                if (distSq <= radiusSq) {
                    group.push(neighbor);
                    processed.add(neighbor.id);
                }
            }

            if (group.length > 1) {
                // Determine center of cluster (average)
                // Or just use the first point as anchor? 
                // Using average position provides better visual centering
                const totalX = group.reduce((sum, item) => sum + item.landing_x, 0);
                const totalY = group.reduce((sum, item) => sum + item.landing_y, 0);

                clusters.push({
                    type: 'cluster',
                    x: totalX / group.length,
                    y: totalY / group.length,
                    items: group,
                    utility_type: group[0].utility_type
                });
            } else {
                clusters.push({ type: 'single', data: current });
            }
        }

        return clusters;
    }, [lineups, radius]);
};
