'use client';

import { useControl, useMap, IControl } from 'react-map-gl/mapbox';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { useMapStore } from '@/store/map-store';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useEffect } from 'react';

import { neonDrawStyles } from '@/lib/map-draw-styles';

type DrawControlProps = {
    onCreate: (evt: any) => void;
    onUpdate: (evt: any) => void;
    onDelete: (evt: any) => void;
    mode?: string;
};

export default function DrawControl(props: DrawControlProps) {
    const { current: map } = useMap();

    const draw = useControl<IControl>(
        () => new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                polygon: true,
                trash: true
            },
            // @ts-ignore
            styles: neonDrawStyles
        }),
        {
            position: 'top-left'
        }
    );

    // Effect to update mode
    useEffect(() => {
        if (draw && props.mode) {
            // @ts-ignore
            if (draw.getMode() !== props.mode) {
                // @ts-ignore
                draw.changeMode(props.mode);
            }
        }
    }, [draw, props.mode]);

    useEffect(() => {
        if (!map) return;

        // @ts-ignore
        map.on('draw.create', (e) => {
            props.onCreate(e);
        });
        // @ts-ignore
        map.on('draw.update', props.onUpdate);
        // @ts-ignore
        map.on('draw.delete', props.onDelete);

        return () => {
            // @ts-ignore
            map.off('draw.create', props.onCreate);
            // @ts-ignore
            map.off('draw.update', props.onUpdate);
            // @ts-ignore
            map.off('draw.delete', props.onDelete);
        };
    }, [map, props.onCreate, props.onUpdate, props.onDelete]);

    return null;
}
