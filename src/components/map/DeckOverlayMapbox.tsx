import { useControl } from 'react-map-gl/mapbox'; // Use mapbox export
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { DeckProps } from '@deck.gl/core';

interface DeckGLOverlayProps extends DeckProps {
    interleaved?: boolean;
}

export function DeckGLOverlay(props: DeckGLOverlayProps) {
    const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay(props));
    overlay.setProps(props);
    return null;
}
