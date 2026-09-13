import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'core/index': 'src/core/index.ts',
    'rec/index': 'src/rec/index.ts',
    'std/index': 'src/std/index.ts',
    'sdif/index': 'src/sdif/index.ts',
    'hy3/index': 'src/hy3/index.ts',
    'ev3/index': 'src/ev3/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
});
