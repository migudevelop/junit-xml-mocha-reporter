const {
  isFunction,
  isUndefined,
  isEmptyArray,
  isString
} = require('@migudevelop/types-utils')
const { reporters } = require('mocha')
const xmlSanitizer = require('xml-sanitizer')
const { Base } = reporters

class TestCase {
  _runner = null
  _options = {}

  constructor(runner, options) {
    this._runner = runner
    this._options = options
  }

  /**
   * Produces an xml config for a given test case.
   * @param {object} test - test case
   * @param {object} err - if test failed, the failure object
   * @returns {object}
   */
  getTestcaseData(test, err) {
    const name = xmlSanitizer(test.fullTitle())
    const classname = xmlSanitizer(test.title)

    const testcase = []

    if (isString(this._options.jiraId) && name.includes(this._options.jiraId)) {
      const testCaseJiraData = this._getJiraIds(name, classname)
      testCaseJiraData.jiraIds.forEach((jiraId) => {
        const newName = `${testCaseJiraData.name} ${jiraId.trim()}`
        const newClassName = `${testCaseJiraData.classname} ${jiraId.trim()}`
        testcase.push({
          testcase: [
            this._createTestCaseElement({
              name: newName,
              duration: test?.duration,
              classname: newClassName
            })
          ]
        })
      })
    } else {
      testcase.push({
        testcase: [
          this._createTestCaseElement({
            name,
            duration: test?.duration,
            classname
          })
        ]
      })
    }

    // We need to merge console.logs and attachments into one <system-out> -
    //  see JUnit schema (only accepts 1 <system-out> per test).
    let systemOutLines = []
    if (this._options.outputs && !isEmptyArray(test?.consoleOutputs)) {
      systemOutLines = systemOutLines.concat(test.consoleOutputs)
    }
    if (this._options.attachments && !isEmptyArray(test?.attachments)) {
      systemOutLines = systemOutLines.concat(
        test.attachments.map(function (file) {
          return '[[ATTACHMENT|' + file + ']]'
        })
      )
    }
    if (systemOutLines?.length > 0) {
      testcase.map((data) =>
        data.testcase.push({
          'system-out': xmlSanitizer(systemOutLines.join('\n'))
        })
      )
    }

    if (this._options.outputs && !isEmptyArray(test?.consoleErrors)) {
      testcase.map((data) =>
        data.testcase.push({
          'system-err': xmlSanitizer(test.consoleErrors.join('\n'))
        })
      )
    }

    this._checkFailure(testcase, err)

    return testcase
  }

  _checkFailure(testcase, err) {
    if (err) {
      const message = this._getMessage(err)
      let failureMessage = err.stack || message
      if (!Base.hideDiff && !isUndefined(err.expected)) {
        const oldUseColors = Base.useColors
        Base.useColors = false
        failureMessage += `\n${Base.generateDiff(err.actual, err.expected)}`
        Base.useColors = oldUseColors
      }
      const failureElement = this._createFailureElement(
        err,
        message,
        failureMessage
      )

      testcase.map((data) => data.testcase.push({ failure: failureElement }))
    }
  }

  _getMessage(err) {
    if (isFunction(err?.message?.toString)) {
      return err.message
    }
    if (isFunction(err.inspect)) {
      return err.inspect()
    }
    return ''
  }

  _createFailureElement(err, message, failureMessage) {
    return {
      _attr: {
        message: xmlSanitizer(message) || '',
        type: err.name || ''
      },
      _cdata: xmlSanitizer(failureMessage)
    }
  }

  _createTestCaseElement({ name, duration, classname }) {
    return {
      _attr: {
        name,
        time: isUndefined(duration) ? 0 : duration / 1000,
        classname
      }
    }
  }

  _getJiraIds(name, classname = '') {
    const firstJiraIdPosition = name.indexOf(this._options.jiraId)
    const firstJiraIdPositionOfClassName = classname.indexOf(
      this._options.jiraId
    )
    const nameWitoutJiraIds = name.substring(0, firstJiraIdPosition).trim()
    const calssNameWitoutJiraIds = name
      .substring(0, firstJiraIdPositionOfClassName)
      .trim()
    const jiraIds = name.substring(firstJiraIdPosition).trim().split(',')
    return {
      name: nameWitoutJiraIds,
      classname: calssNameWitoutJiraIds,
      jiraIds
    }
  }
}

module.exports = TestCase
