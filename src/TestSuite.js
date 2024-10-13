const { isEmptyArray, isEmptyString } = require('@migudevelop/types-utils')
const xmlSanitizer = require('xml-sanitizer')

class TestSuite {
  _runner = null
  _options = {}

  constructor(runner, options) {
    this._runner = runner
    this._options = options
  }

  /**
   * Produces an xml node for a test suite
   * @param  {Object} suite - a test suite
   * @return {Object}       - an object representing the xml node
   */
  getTestsuiteData(suite) {
    const testSuite = { testsuite: [this._createTestSuiteElement(suite)] }

    if (suite.file) {
      testSuite.testsuite[0]._attr.file = suite.file
    }

    const properties = this._generateProperties(this._options)
    if (!isEmptyArray(properties)) {
      testSuite.testsuite.push({
        properties: properties
      })
    }

    return testSuite
  }

  isInvalidSuite(suite) {
    return (
      (!suite.root && isEmptyString(suite.title)) ||
      (isEmptyArray(suite.tests) && isEmptyArray(suite.suites))
    )
  }

  _getSuiteTitle(suite) {
    if (suite.root && isEmptyString(suite.title)) {
      return xmlSanitizer(this._options.rootSuiteTitle)
    }
    return xmlSanitizer(suite.title)
  }

  _createTestSuiteElement(suite) {
    return {
      _attr: {
        name: this._getSuiteTitle(suite),
        timestamp: Date.now(),
        tests: suite.tests.length
      }
    }
  }

  _generateProperties(options) {
    const props = options.properties
    if (!props) {
      return []
    }
    return Object.keys(props).reduce(function (properties, name) {
      const value = props[name]
      properties.push({ property: this._createProperty({ name, value }) })
      return properties
    }, [])
  }

  _createProperty({ name = '', value = '' }) {
    return { _attr: { name, value } }
  }
}

module.exports = TestSuite
