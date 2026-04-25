import chalk from 'chalk';

function stamp(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  return chalk.dim(`${h}:${m}:${s}`);
}

export const log = {
  info(msg: string): void {
    console.log(`${stamp()} ${chalk.cyan('▸')} ${msg}`);
  },

  success(msg: string): void {
    console.log(`${stamp()} ${chalk.green('✓')} ${chalk.green(msg)}`);
  },

  warn(msg: string): void {
    console.log(`${stamp()} ${chalk.yellow('⚠')} ${chalk.yellow(msg)}`);
  },

  error(msg: string): void {
    console.error(`${stamp()} ${chalk.red('✗')} ${chalk.red(msg)}`);
  },

  fatal(msg: string): never {
    console.error(`${stamp()} ${chalk.red('✗')} ${chalk.red(msg)}`);
    process.exit(1);
  },

  status(msg: string): void {
    process.stdout.write(`${stamp()}   ${msg}  \r`);
  },

  statusClear(): void {
    process.stdout.write('\r\x1b[K');
  },

  section(title: string): void {
    console.log(`\n${stamp()} ${chalk.bold.cyan(title)}`);
  },

  blank(): void {
    console.log();
  },

  banner(): void {
    const W = 36;
    const title = 'Dota 2 Match Notifier  v1.0';
    const left = Math.floor((W - title.length) / 2);
    const right = W - title.length - left;

    const t = chalk.cyan;
    log.blank();
    console.log(`  ${t('╔')}${'═'.repeat(W)}${t('╗')}`);
    console.log(`  ${t('║')}${' '.repeat(W)}${t('║')}`);
    console.log(`  ${t('║')}${' '.repeat(left)}${chalk.bold.white(title)}${' '.repeat(right)}${t('║')}`);
    console.log(`  ${t('║')}${' '.repeat(W)}${t('║')}`);
    console.log(`  ${t('╚')}${'═'.repeat(W)}${t('╝')}`);
    log.blank();
  },
};
