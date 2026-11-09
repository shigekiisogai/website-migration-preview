import {defineConfig} from 'astro/config';
import {deploymentBase} from './src/lib/deployment.mjs';
const github=process.env.DEPLOY_TARGET==='github';
export default defineConfig({
 output:'static',
 site:github?'https://sisogai.github.io':undefined,
 base:deploymentBase(),
 outDir:github?'./dist-github':'./dist-cloudflare',
 trailingSlash:'always',
 devToolbar:{enabled:false},
});
