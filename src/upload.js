;(async () => {
  const text = await Bun.file('dist.js').text()

  const ignoreFunctions = new Set([
    'getUsedCPU',
    'profileFunction',
    'wrapped',
    'profileObject',
    'logProfiler',
    'hookUpProfiler',
  ])
  await fetch('https://screeps.com/api/user/code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-Token': process.env.TOKEN,
    },
    body: JSON.stringify({
      branch: 'default',
      modules: {
        main: text.replace('export {', 'module.exports = {').replace(
          'function hookUpProfiler() {',
          `function hookUpProfiler() {\n  ${[...text.matchAll(/function\s([^\(]+)/g)]
              .filter((x) => !ignoreFunctions.has(x[1]))
              .map((x) => `  ${x[1]} = profileFunction(${x[1]})`)
              .join('\n')}`,
        ),
      },
    }),
  })
})()
