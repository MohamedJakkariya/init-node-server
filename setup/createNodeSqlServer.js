/** @format */

const commander = require('commander');
const chalk = require('chalk');

const packageJson = require('./package.json');
const program = new commander.Command(packageJson.name);

const log = console.log;

function init() {
  program
    .version(packageJson.version)
    .arguments('<project-directory>')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action(name => {
      projectName = name;
    })
    .option('--info', 'print environment debug info')
    .option('--template <path-to-template>', 'specify a template for the created project')
    .allowUnknownOption()
    .on('--help', () => {
      log(`    Only ${chalk.green('<project-directory>')} is required.`);
      log();

      log(
        `      - a local path relative to the current working directory: ${chalk.green('file:../my-node-sql-template')}`
      );

      log();
      log(`    If you have any problems, do not hesitate to file an issue:`);
      log(`      ${chalk.cyan('https://github.com/MohamedJakkariya/init-node-server/issues')}`);
      log();
    })
    .parse(process.argv);
}

module.exports = {
  init
};
