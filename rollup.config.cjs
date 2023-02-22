const builtinModules = require('module').builtinModules;
const git = require('git-rev-sync');

const babel = require('rollup-plugin-babel');
const commonjs = require('rollup-plugin-commonjs');
const copy = require('rollup-plugin-copy');
const json = require('rollup-plugin-json');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');

const { dependencies, devDependencies } = require('./package.json');
const buildId = process.env.BUILD_ID || git.short();

module.exports = {
  external: [
    'react-dom/server',
    ...builtinModules,
    ...Object.keys(dependencies),
    ...Object.keys(devDependencies)
  ],
  input: 'src/server/index.js',
  output: { file: 'dist/server.js', format: 'cjs' },
  plugins: [
    babel({ exclude: /node_modules/ }),
    json(),
    resolve(),
    commonjs(),
    replace({
      'process.env.BUILD_ID': JSON.stringify(buildId)
    }),
    copy({ targets: [{ src: 'public', dest: 'dist/public' }] })
  ]
};
