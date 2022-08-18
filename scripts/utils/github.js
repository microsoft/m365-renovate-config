export const defaultRepo = 'microsoft/m365-renovate-config';
export const defaultBranch = 'main';
export const primaryBranches = [defaultBranch, 'v1'];
export const isGithub = !!process.env.CI;

/** @type {(err: string, file?: string) => void} */
export const logError = (err, file) =>
  console.error(isGithub ? `::error${file ? ` file=${file}` : ''}::${err}` : err);
export const logGroup = (name) => console.log(isGithub ? `::group::${name}` : name);
export const logEndGroup = () => console.log(isGithub ? '::endgroup::' : '');
