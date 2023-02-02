const builtinModules = require('module').builtinModules;
const git = require('git-rev-sync');

const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const copy = require('rollup-plugin-copy');
const json = require('rollup-plugin-json');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const url = require('rollup-plugin-url');

const entryManifest = require('./plugins/entryManifest');
const { dependencies, devDependencies } = require('./package.json');
const SKIP_WARNINGS = [
  'CIRCULAR_DEPENDENCY',
  'EVAL',
  'THIS_IS_UNDEFINED',
  'UNRESOLVED_IMPORT'
];
const buildId = process.env.BUILD_ID || git.short();
const manifest = entryManifest();

const client = ['browse', 'main'].map(entryName => {
  return {
    external: ['@emotion/core', 'react', 'react-dom'],
    input: `src/client/${entryName}.js`,
    output: {
      format: 'iife',
      dir: 'dist/client',
      entryFileNames: '[name]-[hash].js',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        '@emotion/core': 'emotionCore'
      }
    },
    onwarn(message, next) {
      if (SKIP_WARNINGS.includes(message.code)) {
        return;
      }
      next(message);
    },
    moduleContext: {
      'node_modules/react-icons/lib/esm/iconBase.js': 'window'
    },
    plugins: [
      manifest.record({ publicPath: '/client/' }),
      babel({ exclude: /node_modules/ }),
      json(),
      resolve(),
      commonjs({
        namedExports: {
          'node_modules/react/index.js': [
            'createContext',
            'createElement',
            'forwardRef',
            'Component',
            'Fragment'
          ]
        }
      }),
      replace({
        'process.env.BUILD_ID': JSON.stringify(buildId),
        'process.env.NODE_ENV': JSON.stringify(
          process.env.NODE_ENV || 'development'
        )
      }),
      url({
        limit: 5 * 1024,
        publicPath: '/client/'
      })
    ]
  };
});

const server = {
  external: [
    'react-dom/server',
    ...builtinModules,
    ...Object.keys(dependencies),
    ...Object.keys(devDependencies)
  ],
  input: 'src/server/index.js',
  output: { file: 'dist/server.js', format: 'cjs' },
  moduleContext: {
    'node_modules/react-icons/lib/esm/iconBase.js': 'global'
  },
  plugins: [
    manifest.inject({ virtualId: 'entry-manifest' }),
    babel({ exclude: /node_modules/ }),
    json(),
    resolve(),
    commonjs(),
    url({
      limit: 5 * 1024,
      publicPath: '/client/',
      emitFiles: false
    }),
    replace({
      'process.env.BUILD_ID': JSON.stringify(buildId)
    }),
    copy({ targets: [{ src: 'public', dest: 'dist/public' }] })
  ]
};

module.exports = client.concat(server);
