
import React from 'react';
import { Star } from 'lucide-react';

const PointsBadge = ({ points, tier }) => {
    const getTierColor = (t) => {
        switch (t) {
            case 'Gold': return '#f59e0b';
            case 'Silver': return '#9ca3af';
            case 'Bronze': default: return '#b45309';
        }
    };

    const color = getTierColor(tier);

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '16px',
            backgroundColor: `${color}20`, // 20% opacity
            color: color,
            border: `1px solid ${color}40`
        }}>
            <Star size={14} fill={color} />
            <span style={{ fontSize: '12px', fontWeight: '700' }}>{points} pts</span>
        </div>
    );
};

export default PointsBadge;
