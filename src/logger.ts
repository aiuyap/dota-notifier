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
    const pad = ' '.repeat(22);
    console.log();
    console.log(chalk.cyan('  ╔' + '═'.repeat(36) + '╗'));
    console.log(chalk.cyan('  ║') + pad + chalk.cyan('║'));
    console.log(chalk.cyan('  ║  ') + chalk.bold.white('Dota 2 Match Notifier  v1.0') + chalk.cyan('  ║'));
    console.log(chalk.cyan('  ║') + pad + chalk.cyan('║'));
    console.log(chalk.cyan('  ╚' + '═'.repeat(36) + '╝'));
    console.log();
  },
};
