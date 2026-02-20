import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ['react-map-gl', 'mapbox-gl', '@deck.gl/react', '@deck.gl/layers', '@deck.gl/mapbox', 'recharts', 'victory-vendor', 'd3-scale', 'd3-time'],
};

export default nextConfig;
