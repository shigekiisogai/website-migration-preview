export function deploymentBase(env = process.env) {
 if (env.DEPLOY_TARGET !== 'github') return '/';
 const repo = env.PAGES_REPOSITORY || 'website-migration-preview';
 if (!/^[a-zA-Z0-9_.-]+$/.test(repo)) throw new Error('Invalid repository name');
 const base = env.PAGES_BASE_PATH ?? (repo === 'sisogai.github.io' ? '/' : `/${repo}/`);
 if (!/^\/(?:[a-zA-Z0-9_.-]+\/)*$/.test(base) || base.split('/').some(p => p === '.' || p === '..')) throw new Error('Invalid Pages base path: use / or /repository/');
 return base;
}
