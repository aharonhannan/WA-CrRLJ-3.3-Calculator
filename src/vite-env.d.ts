/// <reference types="vite/client" />

// SVG imports with vite-plugin-svgr
declare module '*.svg?react' {
  import type { FC, SVGProps } from 'react';
  const content: FC<SVGProps<SVGSVGElement>>;
  export default content;
}
