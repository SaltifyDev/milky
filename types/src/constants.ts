import packageJson from '../package.json';

export const milkyPackageVersion = packageJson.version;
export const milkyVersion = milkyPackageVersion.split('.').slice(0, 2).join('.');
