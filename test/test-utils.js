const Reporter = require('../index.js')
const Logger = require('../src/Logger.js')
const { expect } = require('chai')
const { readFileSync } = require('fs')
const { join, dirname } = require('path')
const { Runner, Suite, Test } = require('mocha')

// TODO uncomment when use ES Modules
// const __dirname = dirname(fileURLToPath(import.meta.url))

function verifyMochaFile(path) {
  Logger.info('verify', new Date().toLocaleString())
  const output = readFileSync(path, 'utf-8')
  expect(output).xml.to.be.valid()
  Logger.success('done', new Date().toLocaleString())
}

function createReporter(options = {}) {
  const filePath = join(dirname(__dirname), options.mochaFile || '')

  const rootSuite = new Suite('', 'root', true)
  const runner = new Runner(rootSuite)
  const reporter = new Reporter(runner, options)
  return { filePath, reporter }
}

function createTestData({ runner }, callback, options = {}) {
  options.title = options.title || 'Suite 1'

  const { suite } = runner
  const rootSuite = suite

  const suite1 = Suite.create(rootSuite, options.title)
  suite1.addTest(
    createTest(
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
    )
  )

  const suite2 = Suite.create(rootSuite, 'Suite 2')
  suite2.addTest(createTest('new test'))

  runner.run(function (failureCount) {
    if (runner.dispose) {
      runner.dispose()
    }

    callback(failureCount)
  })
}

function createJiraIdsTestData({ runner }, callback, options = {}) {
  options.title = options.title || 'Suite 1'
  const jiraId = options.jiraId

  const { suite } = runner
  const rootSuite = suite

  const suite1 = Suite.create(rootSuite, options.title)
  suite1.addTest(
    createTest(
      `Lorem Ipsum is simply dummy text of the printing and typesetting industry. ${jiraId}1, ${jiraId}2`
    )
  )

  runner.run(function (failureCount) {
    if (runner.dispose) {
      runner.dispose()
    }

    callback(failureCount)
  })
}

function createTest(name, callback = () => {}) {
  return new Test(name, callback)
}

module.exports = {
  verifyMochaFile,
  createReporter,
  createTestData,
  createJiraIdsTestData,
  createTest
}
