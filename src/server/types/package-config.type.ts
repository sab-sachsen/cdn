export type PackageConfig = {
  browser: string;
  main: string;
  module: string;
  type: string;
  unpkg: string;
  'jsnext:main': string;
  'dist-tags': string[];
  versions: { [version: string]: any };
};
