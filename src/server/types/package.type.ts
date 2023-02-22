import type { PackageConfig } from './package-config.type';
import type { PackageInfo } from './package-info.type';

export type Package = PackageInfo & {
  packageConfig: PackageConfig;
};
