/* eslint-disable import-x/no-nodejs-modules */
import { writeFileSync } from 'node:fs'

import { transformSync } from '@babel/core'

const ignoreProfileFunctions = new Set([
  'getUsedCPU',
  'profileFunction',
  'wrapped',
  'profileObject',
  'logProfiler',
  'hookUpProfiler',
])
const build = await Bun.build({
  entrypoints: ['./src/index.ts'],
  // sourcemap: 'inline',
  target: 'node',
})
for (const log of build.logs) console.log(log)
let content = await build.outputs[0]!.text()
content = content.replace('export {', 'module.exports = {')
content = content.replace(
  'function hookUpProfiler() {',
  `function hookUpProfiler() {\n  ${[...content.matchAll(/^function\s([^(]+)/g)]
    .filter(x => !ignoreProfileFunctions.has(x[1]!))
    .map(x => `  ${x[1]} = profileFunction(${x[1]})`)
    .join('\n')}`,
)
content = transformSync(content, {
  presets: ['@babel/preset-env'],
  targets: {
    node: '10',
  },
})!.code!
writeFileSync('dist.js', content)

await fetch('https://screeps.com/api/user/code', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Token': process.env.TOKEN,
  } as HeadersInit,
  body: JSON.stringify({
    branch: 'default',
    modules: {
      main: content,
    },
  }),
})
