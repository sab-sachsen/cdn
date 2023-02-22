import SRIToolbox from 'sri-toolbox';

export default function getIntegrity(data: Buffer): string {
  return SRIToolbox.generate({ algorithms: ['sha384'] }, data);
}
