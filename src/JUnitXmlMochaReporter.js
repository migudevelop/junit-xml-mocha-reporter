const dotenvFlow = require('dotenv-flow')
const { reporters, Runner } = require('mocha')

const Config = require('./Config.js')
const FileManager = require('./File.js')
const TestCase = require('./TestCase.js')
const TestSuite = require('./TestSuite.js')

dotenvFlow.config()

const {
  EVENT_RUN_BEGIN,
  EVENT_RUN_END,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN,
  EVENT_SUITE_END
} = Runner.constants

const { Base } = reporters

/**
 * JUnit XML reporter for mocha
 * @module junit-mocha-reporter
 * @param {EventEmitter} runner - Test runner
 * @param {Object} options - Mocha options
 */
class JUnitXmlMochaReporter extends Base {
  _runner = null
  _options = null
  _fileManager = null
  _testSuite = null
  _testCase = null
  _testSuites = []

  constructor(runner, options) {
    super(runner, options)
    this._runner = runner
    this._options = new Config(options).getConfig()
    this._fileManager = new FileManager(this._runner, this._options)
    this._testSuite = new TestSuite(this._runner, this._options)
    this._testCase = new TestCase(this._runner, this._options)
    this._testSuites = []

    this._runner.on(EVENT_RUN_BEGIN, this._onStart.bind(this))
    this._runner.on(EVENT_SUITE_BEGIN, this._onSuite.bind(this))
    this._runner.on(EVENT_SUITE_END, this._onSuiteEnd.bind(this))
    this._runner.on(EVENT_TEST_PASS, this._onPass.bind(this))
    this._runner.on(EVENT_TEST_FAIL, this._onFail.bind(this))
    this._runner.on(EVENT_RUN_END, this._onEnd.bind(this))
  }

  _addTest(test) {
    return this._lastSuite().push(test)
  }

  _onStart() {
    this._fileManager.checkAndRemoveOldReporter()
  }

  _onSuite(suite) {
    if (!this._testSuite.isInvalidSuite(suite)) {
      return this._testSuites.push(this._testSuite.getTestsuiteData(suite))
    }
  }

  _onSuiteEnd(suite) {
    if (!this._testSuite.isInvalidSuite(suite)) {
      const testsuite = this._lastSuite()
      if (testsuite) {
        const start = testsuite[0]._attr.timestamp
        testsuite[0]._attr.time = Date.now() - start
      }
    }
  }

  _onPass(test) {
    const testcasesArray = this._testCase.getTestcaseData(test)
    testcasesArray.map((testCase) => {
      this._addTest(testCase)
    })
  }

  _onFail(test, err) {
    const testcasesArray = this._testCase.getTestcaseData(test, err)
    testcasesArray.map((testCase) => {
      this._addTest(testCase)
    })
  }

  _onEnd() {
    this._fileManager.readAndCreateXmlFile(this._testSuites)
  }

  _lastSuite() {
    return this._testSuites.at(-1).testsuite
  }
}

module.exports = JUnitXmlMochaReporter
