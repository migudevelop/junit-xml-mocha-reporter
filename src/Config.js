const {
  isFunction,
  isUndefined,
  isNullish
} = require('@migudevelop/types-utils')

const Logger = require('./Logger.js')

class Config {
  _options = {}

  constructor(optionsData) {
    const options = this._getReporterOptions(optionsData)
    Logger.info(`options: ${JSON.stringify(options, null, 2)}`)
    this._options.mochaFile = this._getSetting(
      options.mochaFile,
      'MOCHA_FILE',
      'results.xml'
    )
    this._options.jiraId = this._getSetting(options.jiraId, 'JIRA_ID', null)
    this._options.rootSuiteTitle = this._getSetting(
      options.rootSuiteTitle,
      'ROOT_SUITE_TITLE',
      'Root Suite'
    )
    this._options.testSuitesTitle = this._getSetting(
      options.testSuitesTitle,
      'TEST_SUITES_TITLE',
      'Mocha Tests'
    )
  }

  getConfig() {
    return this._options
  }

  /**
   * Determine an option value.
   * 1. If `key` is present in the environment, then use the environment value
   * 2. If `value` is specified, then use that value
   * 3. Fall back to `defaultVal`
   * @module junit-mocha-reporter
   * @param {Object} value - the value from the reporter options
   * @param {String} key - the environment variable to check
   * @param {Object} defaultVal - the fallback value
   * @param {function} transform - a transformation function to be used when loading values from the environment
   */
  _getSetting(value, key, defaultVal, transform) {
    if (!isUndefined(process.env[key])) {
      const envVal = process.env[key]
      return isFunction(transform) ? transform(envVal) : envVal
    }
    if (!isUndefined(value)) {
      return value
    }
    return defaultVal
  }

  _getReporterOptions(options) {
    if (isNullish(options)) {
      return {}
    }
    if (options.reporterOptions) {
      return options.reporterOptions
    }
    return options
  }
}

module.exports = Config
