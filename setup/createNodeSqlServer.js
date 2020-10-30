/** @format */

const commander = require('commander');
const chalk = require('chalk');
const envinfo = require('envinfo');
const execSync = require('child_process').execSync;
const semver = require('semver');
const https = require('https');
const path = require('path');
const validateProjectName = require('validate-npm-package-name');
const fs = require('fs-extra');

const packageJson = require('./package.json');

const log = console.log;

let projectName;

function init() {
  // Create command line with some options of arguments
  const program = new commander.Command(packageJson.name)
    .version(packageJson.version)
    .arguments('[project-directory]')
    .usage(`${chalk.green('<project-directory>')} [options]`)
    .action(name => {
      projectName = name;
    })
    .option('--verbose', 'print additional logs')
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

  //   Check if the flax is info
  if (program.info) {
    console.log(chalk.bold('\nEnvironment Info:'));
    console.log(`\n  current version of ${packageJson.name}: ${packageJson.version}`);
    console.log(`  running from ${__dirname}`);
    return envinfo
      .run(
        {
          System: ['OS', 'CPU'],
          Binaries: ['Node', 'npm', 'Yarn'],
          Browsers: ['Chrome', 'Edge', 'Internet Explorer', 'Firefox', 'Safari'],
          npmPackages: ['mysql'],
          npmGlobalPackages: ['init-node-server']
        },
        {
          duplicates: true,
          showNotFound: true
        }
      )
      .then(console.log);
  }

  //   Check project directory name
  if (typeof projectName === 'undefined') {
    console.error('Please specify the project directory:');
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`);
    console.log();
    console.log('For example:');
    console.log(`  ${chalk.cyan(program.name())} ${chalk.green('my-node-app')}`);
    console.log();
    console.log(`Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`);
    process.exit(1);
  }

  // We first check the registry directly via the API, and if that fails, we try
  // the slower `npm view [package] version` command.
  //
  // This is important for users in environments where direct access to npm is
  // blocked by a firewall, and packages are provided exclusively via a private
  // registry.
  checkForLatestVersion()
    .catch(() => {
      try {
        return execSync('npm view init-node-server version').toString().trim();
      } catch (e) {
        return null;
      }
    })
    .then(latest => {
      //   if (latest && semver.lt(packageJson.version, latest)) {
      //     console.log();
      //   console.error(
      //     chalk.yellow(
      //       `You are running \`init-node-server\` ${packageJson.version}, which is behind the latest release (${latest}).\n\n`
      //       // +'We no longer support global installation of init-node-server.'
      //     )
      //   );
      //     console.log();
      //     console.log(
      //       'Please remove any global installs with one of the following commands:\n' +
      //         '- npm uninstall -g init-nose-derver\n' +
      //         '- yarn global remove init-nose-derver'
      //     );
      //     console.log();
      // console.log(
      //   'The latest instructions for creating a new app can be found here:\n' +
      //     'https://init-nose-derver.dev/docs/getting-started/'
      // );
      // console.log();
      //     process.exit(1);
      //   } else {
      createNodeServer(projectName, program.verbose, program.useNpm);
      // }
    });
}

function createNodeServer(name, verbose, npm) {
  const nodeVersion = 10;
  const unsupportedNodeVersion = !semver.satisfies(process.version, `>=${nodeVersion}`);

  if (unsupportedNodeVersion) {
    console.log(
      chalk.yellow(
        `You are using Node ${process.version} so the project will be bootstrapped with an old unsupported version of tools.\n\n` +
          `Please update to Node ${nodeVersion} or higher for a better, fully supported experience.\n`
      )
    );
  }

  const root = path.resolve(name);

  log('Root ', root);
  const serverName = path.basename(root);
  log('server ', serverName);

  checkServerName(serverName);

  fs.ensureDirSync(name); // Alias : createFile()

  if (!isSafeToCreateProjectIn(root, name)) {
    process.exit(1);
  }
  console.log();

  console.log(`Creating a new node-sql server in ${chalk.green(root)}.`);
  console.log();
}

// Fetch latest version from npm dist-tag and validate with current version
function checkForLatestVersion() {
  return new Promise((resolve, reject) => {
    https
      .get('https://registry.npmjs.org/-/package/init-node-server/dist-tags', res => {
        if (res.statusCode === 200) {
          let body = '';
          res.on('data', data => (body += data));
          res.on('end', () => {
            resolve(JSON.parse(body).latest);
          });
        } else {
          reject();
        }
      })
      .on('error', () => {
        reject();
      });
  });
}

// Check proper servername of package provided by npm name guidlines
function checkServerName(serverName) {
  const validationResult = validateProjectName(serverName);
  if (!validationResult.validForNewPackages) {
    console.error(
      chalk.red(`Cannot create a project named ${chalk.green(`"${serverName}"`)} because of npm naming restrictions:\n`)
    );
    [...(validationResult.errors || []), ...(validationResult.warnings || [])].forEach(error => {
      console.error(chalk.red(`  * ${error}`));
    });
    console.error(chalk.red('\nPlease choose a different project name.'));
    process.exit(1);
  }

  // TODO: there should be a single place that holds the dependencies
  const dependencies = ['debug', 'dotenv', 'express', 'mysql', 'prettier', 'morgan', 'init-node-server'].sort();
  if (dependencies.includes(serverName)) {
    console.error(
      chalk.red(
        `Cannot create a project named ${chalk.green(
          `"${serverName}"`
        )} because a dependency with the same name exists.\n` +
          `Due to the way npm works, the following names are not allowed:\n\n`
      ) +
        chalk.cyan(dependencies.map(depName => `  ${depName}`).join('\n')) +
        chalk.red('\n\nPlease choose a different project name.')
    );
    process.exit(1);
  }
}

function isSafeToCreateProjectIn(root, name) {
  const validFiles = [
    '.DS_Store',
    '.git',
    '.gitattributes',
    '.gitignore',
    '.gitlab-ci.yml',
    '.hg',
    '.hgcheck',
    '.hgignore',
    '.idea',
    '.npmignore',
    '.travis.yml',
    'docs',
    'LICENSE',
    'README.md',
    'mkdocs.yml',
    'Thumbs.db'
  ];
  // These files should be allowed to remain on a failed install, but then
  // silently removed during the next create.
  const errorLogFilePatterns = ['npm-debug.log', 'yarn-error.log', 'yarn-debug.log'];
  const isErrorLog = file => {
    return errorLogFilePatterns.some(pattern => file.startsWith(pattern));
  };

  const conflicts = fs
    .readdirSync(root)
    .filter(file => !validFiles.includes(file))
    // IntelliJ IDEA creates module files before CRA is launched
    .filter(file => !/\.iml$/.test(file))
    // Don't treat log files from previous installation as conflicts
    .filter(file => !isErrorLog(file));

  if (conflicts.length > 0) {
    console.log(`The directory ${chalk.green(name)} contains files that could conflict:`);
    console.log();
    for (const file of conflicts) {
      try {
        const stats = fs.lstatSync(path.join(root, file));
        if (stats.isDirectory()) {
          console.log(`  ${chalk.blue(`${file}/`)}`);
        } else {
          console.log(`  ${file}`);
        }
      } catch (e) {
        console.log(`  ${file}`);
      }
    }
    console.log();
    console.log('Either try using a new directory name, or remove the files listed above.');

    return false;
  }

  // Remove any log files from a previous installation.
  fs.readdirSync(root).forEach(file => {
    if (isErrorLog(file)) {
      fs.removeSync(path.join(root, file));
    }
  });
  return true;
}

module.exports = {
  init
};
