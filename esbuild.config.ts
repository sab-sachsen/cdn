import { type BuildOptions, build } from 'esbuild';
import copyStaticFiles from 'esbuild-copy-static-files';
import { clean } from 'esbuild-plugin-clean';

const options: BuildOptions = {
  sourceRoot: 'src',
  entryPoints: ['src/server/index.ts'],
  outfile: 'dist/index.js',
  platform: 'node',
  bundle: true,
  minify: true,
  treeShaking: true,
  sourcemap: true,
  plugins: [
    clean({
      patterns: ['./dist/*']
    }),
    copyStaticFiles({
      src: './public',
      dest: './dist/'
    })
  ]
};

try {
  build(options);
} catch (error) {
  process.exit(1);
}
