import { readFileSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { request } from 'https';

const data: {
  branch: string;
  modules: Record<string, string>;
} = {
  branch: 'default',
  modules: {},
};
function r(path = join(__dirname, 'main')) {
  for (const name of readdirSync(path)) {
    const p = join(path, name);
    const stat = statSync(p);
    if (stat.isDirectory()) r(p);
    else {
      console.log(p, p.slice(__dirname.length + 6, -3));
      data.modules[p.slice(__dirname.length + 6, -3)] = readFileSync(p, 'utf8').replace(
        /require\("(.+?)"\)/g,
        (_, url) => `require("./${resolve(path, url as string).slice(__dirname.length + 6)}")`,
      );
    }
  }
}
r();
request({
  hostname: 'screeps.com',
  port: 443,
  path: '/api/user/code',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'X-Token': '0d25ea03-eb4f-4bcb-a9ff-4ecce4e0291b',
  },
})
  .end(JSON.stringify(data))
  .on('error', (e) => console.log('Error', e))
  .on('response', (response) => {
    const chunks: Uint8Array[] = [];
    response.on('data', (chunk) => chunks.push(chunk as Uint8Array));
    response.on('end', () => {
      console.log('End', JSON.parse(Buffer.concat(chunks).toString()));
    });
  });
