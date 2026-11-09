import {spawnSync} from 'node:child_process';
import {deploymentBase} from '../src/lib/deployment.mjs';
import {integrateInteractiveHeader} from './interactive-header.mjs';
const target=process.argv[2];
if(!['github','cloudflare'].includes(target))throw new Error('Choose github or cloudflare');
const result=spawnSync(process.execPath,['node_modules/astro/bin/astro.mjs','build'],{stdio:'inherit',env:{...process.env,DEPLOY_TARGET:target,ASTRO_TELEMETRY_DISABLED:'1'}});
if(result.status===0)integrateInteractiveHeader(`dist-${target}`,deploymentBase({...process.env,DEPLOY_TARGET:target}));
process.exit(result.status??1);
