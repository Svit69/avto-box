import { spawnSync } from 'node:child_process';

function executeRequiredCommand(command, argumentsList) {
  const result = spawnSync(command, argumentsList, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Команда завершилась с ошибкой: ${command} ${argumentsList.join(' ')}`);
}
try {
  for (const script of ['capture', 'build', 'check', 'test']) {
    executeRequiredCommand(process.execPath, [`scripts/${script}.js`]);
  }
  executeRequiredCommand('git', ['add', 'public/snapshot']);
  const changes = spawnSync('git', ['diff', '--cached', '--quiet']);
  if (changes.status === 1) {
    executeRequiredCommand('git', ['commit', '-m', 'Refresh browser-captured KHL match snapshot']);
    executeRequiredCommand('git', ['push']);
  } else if (changes.status === 0) console.log('Снимок не изменился.');
  else throw new Error('Не удалось проверить изменения Git.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
