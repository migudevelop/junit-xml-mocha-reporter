const chalk = require('chalk')
const APP_TEXT = 'junit-mocha-reporter'

function log(text) {
  if (process.env.DEBUG === 'true') {
    console.log(chalk.magenta(`[${APP_TEXT}]${text}`))
  }
}

class Logger {
  static info(text) {
    log(chalk.cyan(`[info]: ${chalk.white(text)}`))
  }

  static warn(text) {
    log(chalk.yellow(`[warn]: ${chalk.white(text)}`))
  }

  static success(text) {
    log(chalk.green(`[success]: ${chalk.white(text)}`))
  }

  static error(text) {
    log(chalk.red(`[error]: ${chalk.white(text)}`))
  }
}

module.exports = Logger
