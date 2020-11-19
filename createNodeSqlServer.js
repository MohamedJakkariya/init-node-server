'use strict';

const https = require('https');
const chalk = require('chalk');
const envinfo = require('envinfo');
const execSync = require('child_process').execSync;
const fs = require('fs-extra');
const hyperquest = require('hyperquest');
const os = require('os');
const path = require('path');
const semver = require('semver');
const spawn = require('cross-spawn');
const tmp = require('tmp');
const commander = require('commander');
const packageJson = require('./package.json');
const validateProjectName = require('validate-npm-package-name');

// Simplify the log statement
const log = console.log;
const error = console.error;

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
    .option('--template <path-to-template>', 'specify a template for the created project')
    .option('--verbose', 'print additional logs')
    .option('--scripts-version <alternative-package>', 'use a non-standard version of init-node-server')
    .option('--info', 'print environment debug info')
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
    log(chalk.bold('\nEnvironment Info:'));
    log(`\n  current version of ${packageJson.name}: ${packageJson.version}`);
    log(`  running from ${__dirname}`);
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
      .then(log);
  }

  //   Check project directory name
  if (typeof projectName === 'undefined') {
    error('Please specify the project directory:');
    log(`  ${chalk.cyan(program.name())} ${chalk.green('<project-directory>')}`);
    log();
    log('For example:');
    log(`  ${chalk.cyan(program.name())} ${chalk.green('my-node-app')}`);
    log();
    log(`Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`);
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
      if (latest && semver.lt(packageJson.version, latest)) {
        log();
        error(
          chalk.yellow(
            `You are running \`init-node-server\` ${packageJson.version}, which is behind the latest release (${latest}).\n\n` +
              'We no longer support global installation of init-node-server.'
          )
        );
        log();
        log(
          'Please remove any global installs with one of the following commands:\n' +
            '- npm uninstall -g init-node-server\n'
        );
        log();
        log(
          'The latest instructions for creating a new app can be found here:\n' +
            'https://init-node-server.dev/docs/getting-started/'
        );
        log();
        process.exit(1);
      } else {
        createNodeServer(projectName, program.verbose, program.useNpm, program.template);
      }
    });
}

function createNodeServer(name, verbose, useNpm, template) {
  const root = path.resolve(name);

  const serverName = path.basename(root);

  checkServerName(serverName);

  fs.ensureDirSync(name); // Alias : createFile()

  if (!isSafeToCreateProjectIn(root, name)) {
    process.exit(1);
  }
  log();

  log(`Creating a new node-sql server in ${chalk.green(root)}.`);
  log();

  const packageJson = {
    name: serverName,
    version: '0.1.0',
    main: 'server.js',
    description: 'This server is initiated by init-node-server npm package',
    scripts: {
      start: 'node ./config/www',
      devstart: 'nodemon ./config/www'
    }
  };

  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(packageJson, null, 2) + os.EOL);

  const originalDirectory = process.cwd();

  process.chdir(root);

  //   Checking Npm support
  if (!checkThatNpmCanReadCwd) process.exit(1);

  //   Surely they're used npm check
  if (useNpm) {
    const npmInfo = checkNpmVersion();
    if (!npmInfo.hasMinNpm) {
      if (npmInfo.npmVersion) {
        log(
          chalk.yellow(
            `You are using npm ${npmInfo.npmVersion} so the project will be bootstrapped with an old unsupported version of tools.\n\n` +
              `Please update to npm 6 or higher for a better, fully supported experience.\n`
          )
        );
      }
    }
  }

  run(root, serverName, verbose, originalDirectory, template);
}

// To run on the give Directory
function run(root, serverName, verbose, originalDirectory, template) {
  /**
   * Here put all our dependencies one by one
   */
  const allDependencies = [
    'express',
    'body-parser',
    'mysql',
    'debug',
    'js-logger',
    'morgan',
    'nodemon',
    'dotenv',
    'http-status-codes',
    'chalk'
  ];

  Promise.all([getTemplateInstallPackage(template, originalDirectory)]).then(([templateToInstall]) => {
    log('Installing packages. This might take a couple of minutes.');

    Promise.all([getPackageInfo(templateToInstall)])
      .then(([templateInfo]) => {
        allDependencies.push(templateToInstall);

        log(
          `Installing ${chalk.cyan(allDependencies.slice(0, -1).join(', '))} with ${chalk.cyan(templateInfo.name)} ...`
        );
        log();

        return install(allDependencies, verbose).then(() => templateInfo);
      })
      .then(async templateInfo => {
        const templateName = templateInfo.name;

        // To move a folder
        fs.copySync(`${root}\\node_modules\\${templateName}\\template`, root, function (err) {
          if (err) {
            error(err);
            return new Error(err);
          } else {
            log('folder successfully  copied');
            return;
          }
        });
      })
      .catch(reason => {
        log();
        log('Aborting installation.');
        if (reason.command) {
          log(`  ${chalk.cyan(reason.command)} has failed.`);
        } else {
          log(chalk.red('Unexpected error. Please report it as a bug:'));
          log(reason);
        }
        log();

        // On 'exit' we will delete these files from target directory.
        const knownGeneratedFiles = ['package.json', 'yarn.lock', 'node_modules'];
        const currentFiles = fs.readdirSync(path.join(root));

        currentFiles.forEach(file => {
          knownGeneratedFiles.forEach(fileToMatch => {
            // This removes all knownGeneratedFiles.
            if (file === fileToMatch) {
              log(`Deleting generated file... ${chalk.cyan(file)}`);
              fs.removeSync(path.join(root, file));
            }
          });
        });

        const remainingFiles = fs.readdirSync(path.join(root));
        if (!remainingFiles.length) {
          // Delete target folder if empty
          log(`Deleting ${chalk.cyan(`${serverName}/`)} from ${chalk.cyan(path.resolve(root, '..'))}`);
          process.chdir(path.resolve(root, '..'));
          fs.removeSync(path.join(root));
        }
        log('Done.');
        process.exit(1);
      });
  });
}

// install all dependencies
function install(dependencies, verbose) {
  return new Promise((resolve, reject) => {
    let command;
    let args;

    // Now only we use npm later we'll migrate to yarn also
    command = 'npm';
    args = ['install', '--save', '--save-exact', '--loglevel', 'error'].concat(dependencies);

    if (verbose) {
      args.push('--verbose');
    }

    const child = spawn(command, args, { stdio: 'inherit' });

    child.on('close', code => {
      if (code !== 0) {
        reject({
          command: `${command} ${args.join(' ')}`
        });
        return;
      }
      resolve();
    });
  });
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
    error(
      chalk.red(`Cannot create a project named ${chalk.green(`"${serverName}"`)} because of npm naming restrictions:\n`)
    );
    [...(validationResult.errors || []), ...(validationResult.warnings || [])].forEach(err => {
      error(chalk.red(`  * ${err}`));
    });
    error(chalk.red('\nPlease choose a different project name.'));
    process.exit(1);
  }

  // TODO: there should be a single place that holds the dependencies
  const dependencies = ['debug', 'dotenv', 'express', 'mysql', 'prettier', 'morgan'].sort();

  if (dependencies.includes(serverName)) {
    error(
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
    log(`The directory ${chalk.green(name)} contains files that could conflict:`);
    log();
    for (const file of conflicts) {
      try {
        const stats = fs.lstatSync(path.join(root, file));
        if (stats.isDirectory()) {
          log(`  ${chalk.blue(`${file}/`)}`);
        } else {
          log(`  ${file}`);
        }
      } catch (e) {
        log(`  ${file}`);
      }
    }
    log();
    log('Either try using a new directory name, or remove the files listed above.');

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

// Check npm can read the cwd
function checkThatNpmCanReadCwd() {
  const cwd = process.cwd();
  let childOutput = null;
  try {
    // Note: intentionally using spawn over exec since
    // the problem doesn't reproduce otherwise.
    // `npm config list` is the only reliable way I could find
    // to reproduce the wrong path. Just printing process.cwd()
    // in a Node process was not enough.
    childOutput = spawn.sync('npm', ['config', 'list']).output.join('');
  } catch (err) {
    // Something went wrong spawning node.
    // Not great, but it means we can't do this check.
    // We might fail later on, but let's continue.
    return true;
  }
  if (typeof childOutput !== 'string') {
    return true;
  }
  const lines = childOutput.split('\n');
  // `npm config list` output includes the following line:
  // "; cwd = C:\path\to\current\dir" (unquoted)
  // I couldn't find an easier way to get it.
  const prefix = '; cwd = ';
  const line = lines.find(line => line.startsWith(prefix));
  if (typeof line !== 'string') {
    // Fail gracefully. They could remove it.
    return true;
  }
  const npmCWD = line.substring(prefix.length);
  if (npmCWD === cwd) {
    return true;
  }
  error(
    chalk.red(
      `Could not start an npm process in the right directory.\n\n` +
        `The current directory is: ${chalk.bold(cwd)}\n` +
        `However, a newly started npm process runs in: ${chalk.bold(npmCWD)}\n\n` +
        `This is probably caused by a misconfigured system terminal shell.`
    )
  );
  if (process.platform === 'win32') {
    error(
      chalk.red(`On Windows, this can usually be fixed by running:\n\n`) +
        `  ${chalk.cyan('reg')} delete "HKCU\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n` +
        `  ${chalk.cyan('reg')} delete "HKLM\\Software\\Microsoft\\Command Processor" /v AutoRun /f\n\n` +
        chalk.red(`Try to run the above two lines in the terminal.\n`) +
        chalk.red(
          `To learn more about this problem, read: https://blogs.msdn.microsoft.com/oldnewthing/20071121-00/?p=24433/`
        )
    );
  }
  return false;
}

function checkNpmVersion() {
  let hasMinNpm = false;
  let npmVersion = null;
  try {
    npmVersion = execSync('npm --version').toString().trim();
    hasMinNpm = semver.gte(npmVersion, '6.0.0');
  } catch (err) {
    // ignore
  }
  return {
    hasMinNpm: hasMinNpm,
    npmVersion: npmVersion
  };
}

// Extract package name from tarball url or path.
function getPackageInfo(installPackage) {
  if (installPackage.match(/^.+\.(tgz|tar\.gz)$/)) {
    return getTemporaryDirectory()
      .then(obj => {
        let stream;
        if (/^http/.test(installPackage)) {
          stream = hyperquest(installPackage);
        } else {
          stream = fs.createReadStream(installPackage);
        }
        return extractStream(stream, obj.tmpdir).then(() => obj);
      })
      .then(obj => {
        const { name, version } = require(path.join(obj.tmpdir, 'package.json'));
        obj.cleanup();
        return { name, version };
      })
      .catch(err => {
        // The package name could be with or without semver version, e.g. init-nose-server-0.2.0-alpha.1.tgz
        // However, this function returns package name only without semver version.
        log(`Could not extract the package name from the archive: ${err.message}`);
        const assumedProjectName = installPackage.match(/^.+\/(.+?)(?:-\d+.+)?\.(tgz|tar\.gz)$/)[1];
        log(`Based on the filename, assuming it is "${chalk.cyan(assumedProjectName)}"`);
        return Promise.resolve({ name: assumedProjectName });
      });
  } else if (installPackage.startsWith('git+')) {
    // Pull package name out of git urls e.g:
    // git+https://github.com/MohamedJakkariya/ins-template.git
    // git+ssh://github.com/mycompany/ins-template.git#v1.2.3
    return Promise.resolve({
      name: installPackage.match(/([^/]+)\.git(#.*)?$/)[1]
    });
  } else if (installPackage.match(/.+@/)) {
    // Do not match @scope/ when stripping off @version or @tag
    return Promise.resolve({
      name: installPackage.charAt(0) + installPackage.substr(1).split('@')[0],
      version: installPackage.split('@')[1]
    });
  } else if (installPackage.match(/^file:/)) {
    const installPackagePath = installPackage.match(/^file:(.*)?$/)[1];
    const { name, version } = require(path.join(installPackagePath, 'package.json'));
    return Promise.resolve({ name, version });
  }
  return Promise.resolve({ name: installPackage });
}

// Get template install package
function getTemplateInstallPackage(template, originalDirectory) {
  let templateToInstall = 'ins-template';
  if (template) {
    if (template.match(/^file:/)) {
      templateToInstall = `file:${path.resolve(originalDirectory, template.match(/^file:(.*)?$/)[1])}`;
    } else if (template.includes('://') || template.match(/^.+\.(tgz|tar\.gz)$/)) {
      // for tar.gz or alternative paths
      templateToInstall = template;
    } else {
      // Add prefix 'ins-template-' to non-prefixed templates, leaving any
      // @scope/ and @version intact.
      const packageMatch = template.match(/^(@[^/]+\/)?([^@]+)?(@.+)?$/);
      const scope = packageMatch[1] || '';
      const templateName = packageMatch[2] || '';
      const version = packageMatch[3] || '';

      if (templateName === templateToInstall || templateName.startsWith(`${templateToInstall}-`)) {
        // Covers:
        // - ins-template
        // - @SCOPE/ins-template
        // - ins-template-NAME
        // - @SCOPE/ins-template-NAME
        templateToInstall = `${scope}${templateName}${version}`;
      } else if (version && !scope && !templateName) {
        // Covers using @SCOPE only
        templateToInstall = `${version}/${templateToInstall}`;
      } else {
        // Covers templates without the `ins-template` prefix:
        // - NAME
        // - @SCOPE/NAME
        templateToInstall = `${scope}${templateToInstall}-${templateName}${version}`;
      }
    }
  }

  return Promise.resolve(templateToInstall);
}

// Create temporary directory
function getTemporaryDirectory() {
  return new Promise((resolve, reject) => {
    // Unsafe cleanup lets us recursively delete the directory if it contains
    // contents; by default it only allows removal if it's empty
    tmp.dir({ unsafeCleanup: true }, (err, tmpdir, callback) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          tmpdir: tmpdir,
          cleanup: () => {
            try {
              callback();
            } catch (ignored) {
              // Callback might throw and fail, since it's a temp directory the
              // OS will clean it up eventually...
            }
          }
        });
      }
    });
  });
}

function extractStream(stream, dest) {
  return new Promise((resolve, reject) => {
    stream.pipe(
      unpack(dest, err => {
        if (err) {
          reject(err);
        } else {
          resolve(dest);
        }
      })
    );
  });
}

module.exports = {
  init,
  getTemplateInstallPackage
};
