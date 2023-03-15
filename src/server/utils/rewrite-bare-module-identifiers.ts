import { transform } from '@babel/core';

import unpkgRewrite from '../plugins/unpkg-rewrite';

const origin = process.env.ORIGIN || 'https://unpkg.com';

export default function rewriteBareModuleIdentifiers(
  code: string,
  packageConfig: any
): string | null | undefined {
  const dependencies = Object.assign(
    {},
    packageConfig.peerDependencies,
    packageConfig.dependencies
  );

  const options = {
    // Ignore .babelrc and package.json babel config
    // because we haven't installed dependencies so
    // we can't load plugins; see #84
    babelrc: false,
    // Make a reasonable attempt to preserve whitespace
    // from the original file. This ensures minified
    // .mjs stays minified; see #149
    retainLines: true,
    plugins: [
      unpkgRewrite(origin, dependencies),
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator'
    ]
  };

  return transform(code, options)?.code;
}
