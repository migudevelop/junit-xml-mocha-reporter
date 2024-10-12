const { writeFileSync, mkdirSync, existsSync, unlinkSync } = require('fs')
const { dirname } = require('path')

const { isNumber } = require('@migudevelop/types-utils')
// TODO replace md5 to hasha
const md5 = require('md5')
const xml = require('xml')

const Logger = require('./Logger.js')

class FileManager {
  _runner = null
  _options = {}

  constructor(runner, options) {
    this._runner = runner
    this._options = options
  }

  checkAndRemoveOldReporter() {
    if (existsSync(this._options.mochaFile)) {
      Logger.info('removing report file', this._options.mochaFile)
      unlinkSync(this._options.mochaFile)
    }
  }

  /**
   * Produces an XML string from the given test data.
   * @param {Array<Record<string, unknown>>} testsuites - a list of xml configs
   * @returns {string}
   */
  getXml(testsuites) {
    let totalTests = 0
    const stats = this._runner.stats || this._runner.currentRunnable
    const hasProperties = !!this._options.properties

    testsuites.forEach(function (suite) {
      const _suiteAttr = suite.testsuite[0]._attr
      // testsuite is an array: [attrs, properties?, testcase, testcase, …]
      // we want to make sure that we are grabbing test cases at the correct index
      const _casesIndex = hasProperties ? 2 : 1
      const _cases = suite.testsuite.slice(_casesIndex)

      // suiteTime has unrounded time as a Number of milliseconds
      const suiteTime = _suiteAttr.time

      _suiteAttr.time = (suiteTime / 1000 || 0).toFixed(3)
      _suiteAttr.timestamp = new Date(_suiteAttr.timestamp)
        .toISOString()
        .slice(0, -5)
      _suiteAttr.failures = 0
      _suiteAttr.skipped = 0

      _cases.forEach(function (testcase) {
        const lastNode = testcase.testcase.at(-1)

        _suiteAttr.skipped += Number('skipped' in lastNode)
        _suiteAttr.failures += Number('failure' in lastNode)
        if (isNumber(testcase.testcase[0]._attr.time)) {
          testcase.testcase[0]._attr.time =
            testcase.testcase[0]._attr.time.toFixed(3)
        }
      })

      if (!_suiteAttr.skipped) {
        delete _suiteAttr.skipped
      }

      totalTests += _suiteAttr.tests
    })
    const rootSuite = {
      _attr: {
        name: this._options.testsuitesTitle,
        time: (stats.duration / 1000 || 0).toFixed(3),
        tests: totalTests,
        failures: stats.failures
      }
    }
    if (stats.pending) {
      rootSuite._attr.skipped = stats.pending
    }
    testsuites = [rootSuite].concat(testsuites)

    return xml({ testsuites: testsuites }, { declaration: true, indent: '  ' })
  }

  /**
   * Writes a JUnit test report XML document.
   * @param {string} xml - xml string
   * @param {string} filePath - path to output file
   */
  writeXmlToDisk(xml, filePath) {
    if (filePath) {
      try {
        Logger.info(`writing file to ${filePath}`)
        mkdirSync(dirname(filePath), { recursive: true })
        writeFileSync(filePath, xml, 'utf-8')
      } catch (exc) {
        Logger.error(`problem writing results: ${exc}`)
      }
      Logger.success('results written successfully')
    }
  }

  /**
   * Writes xml to disk and ouputs content if "toConsole" is set to true.
   * @param {Array<Record<string,unknown>>} testsuites - a list of xml configs
   */
  readAndCreateXmlFile(testsuites) {
    const xmlContent = this.getXml(testsuites)

    const reportFilename = this._getReportFilename(xmlContent, testsuites)

    this.writeXmlToDisk(xmlContent, reportFilename)
  }

  /**
   * Get the report filename by replacing placeholders
   * @param {string} xml - xml string
   * @param {Array.<Object>} testsuites - a list of xml configs
   */
  _getReportFilename(xml, testsuites) {
    const reportFilename = this._options.mochaFile

    if (reportFilename.includes('[hash]')) {
      return reportFilename.replace('[hash]', md5(xml))
    }

    if (reportFilename.includes('[testsuitesTitle]')) {
      return reportFilename.replace(
        '[testsuitesTitle]',
        this._options.testsuitesTitle
      )
    }
    if (reportFilename.includes('[rootSuiteTitle]')) {
      return reportFilename.replace(
        '[rootSuiteTitle]',
        this._options.rootSuiteTitle
      )
    }
    if (reportFilename.includes('[suiteFilename]')) {
      return reportFilename.replace(
        '[suiteFilename]',
        testsuites[0]?.testsuite[0]?._attr?.file ?? 'suiteFilename'
      )
    }

    return reportFilename
  }
}

module.exports = FileManager
