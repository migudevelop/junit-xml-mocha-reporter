# junit-xml-mocha-reporter
![NPM Version](https://img.shields.io/npm/v/junit-xml-mocha-reporter)
![GitHub Release](https://img.shields.io/github/v/release/migudevelop/junit-xml-mocha-reporter)
![GitHub License](https://img.shields.io/github/license/migudevelop/junit-xml-mocha-reporter)

This mocha reporter produces JUnit-style XML test results and allows you to split the same test into different test cases by jira id.

## Table of Contents

<details>
<summary><strong>Details</strong></summary>

- [Installation](#installation)
- [Usage](#usage)
  * [Split the same test case by id of jira](#split-the-same-test-case-by-id-of-jira)
  * [Append properties to testsuite](#append-properties-to-testsuite)
  * [Results Report](#results-report)
  * [Configuration options](#configuration-options)
- [Debug mode](#debug-mode)
- [License](#license)

</details>

## Installation

```shell
 pnpm install junit-xml-mocha-reporter --save-dev
```

```shell
 npm install junit-xml-mocha-reporter --save-dev
```

## Usage
Run mocha with `junit-xml-mocha-reporter`:

```shell
 mocha test --reporter junit-xml-mocha-reporter
```
This will output a results file at `./results.xml`.
You may optionally declare an alternate location for results XML file by setting
the environment variable `MOCHA_FILE` or specifying `mochaFile` in `reporterOptions`:

```shell
 MOCHA_FILE=./path_to_your/file.xml mocha test --reporter junit-xml-mocha-reporter
```
or
```shell
 mocha test --reporter junit-xml-mocha-reporter --reporter-options mochaFile=./path_to_your/file.xml
```
or
```javascript
const mocha = new Mocha({
    reporter: 'junit-xml-mocha-reporter',
    reporterOptions: {
        mochaFile: './path_to_your/file-results.xml'
    }
});
```

### Split the same test case by id of jira

You can also add the jira key in the `reporterOptions` or in environment variables to split the same test into different test cases. This is useful if you want to test different tests in the same test in Cypress without affecting performance. If you want provided more than one jira id you should divide the ids with the `,` separator. e.g: `title one JIRA.KEY.1,JIRA.KEY.2,JIRA.KEY.3`
>[!IMPORTANT]
> You shoult put the jira ids in the end of the title. e.g: `title one JIRA.KEY.1,JIRA.KEY.2,JIRA.KEY.3`.

To do this, enter them using the environment variable:
```shell
PROPERTIES=JIRA.KEY mocha test --reporter junit-xml-mocha-reporter
```
or
```javascript
const mocha = new Mocha({
    reporter: 'junit-xml-mocha-reporter',
    reporterOptions: {
        jiraId: 'JIRA.KEY'
    }
})
```
If the test case it's this:
```js
describe("test", () => {
  it("testcase JIRA.KEY.1,JIRA.KEY.2,JIRA.KEY.3", () => {
      expect(2).to.be.greaterThan(1);
    }
  );
});
```

the result it's this:
```xml
<testsuites>
  <testsuite>
    <testcase name="test testcase JIRA.KEY.1" time="0.022" classname="test test JIRA.KEY.1">
    </testcase>
    <testcase name="test testcase JIRA.KEY.2" time="0.022" classname="test test JIRA.KEY.2">
    </testcase>
    <testcase name="test testcase JIRA.KEY.3" time="0.022" classname="test test JIRA.KEY.3">
    </testcase>
  </testsuite>
</testsuites>
```


### Append properties to testsuite

You can also add properties to the report under `testsuite`. This is useful if you want your CI environment to add extra build props to the report for analytics purposes

```xml
<testsuites>
  <testsuite>
    <properties>
      <property name="PROPERTY_ID" value="12345"/>
    </properties>
    <testcase/>
  </testsuite>
</testsuites>
```

To do so pass them in via env variable:
```shell
PROPERTIES=PROPERTY_ID:12345 mocha test --reporter junit-xml-mocha-reporter
```
or
```javascript
const mocha = new Mocha({
    reporter: 'junit-xml-mocha-reporter',
    reporterOptions: {
        properties: {
            PROPERTY_ID: 12345
        }
    }
})
```

### Results Report

Results XML filename can contain `[hash]`, e.g. `./path_to_your/results.[hash].xml`. `[hash]` is replaced by MD5 hash of test results XML. This enables support of parallel execution of multiple `junit-xml-mocha-reporter`'s writing test results in separate files. In addition to this these placeholders can also be used:

| placeholder         | output                                            |
| ------------------- | ------------------------------------------------- |
| `[testSuitesTitle]` | will be replaced by the `testSuitesTitle` setting |
| `[rootSuiteTitle]`  | will be replaced by the `rootSuiteTitle` setting  |
| `[suiteFilename]`   | will be replaced by the filename of the spec file |
| `[suiteName]`       | will be replaced by the name the first test suite |


In order to display full suite title (including parents) just specify `testSuitesTitle` option
```javascript
const mocha = new Mocha({
    reporter: 'junit-xml-mocha-reporter',
    reporterOptions: {
        testSuitesTitle: true,
    }
});
```

You can also configure the `testsuites.name` attribute by setting `reporterOptions.testSuitesTitle` and the root suite's `name` attribute by setting `reporterOptions.rootSuiteTitle`.


### Configuration options

| Parameter                      | Default                | Effect                                                                                                                  |
| ------------------------------ | ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| mochaFile                      | `results.xml`     | Configures the file to write reports to                                                                                 |
| jiraId                     | `null`                 | A key to check if testcaase titles contain jira ids with the key provided.                                                              |
| properties                     | `null`                 | A hash of additional properties to add to each test suite                                                               |
| rootSuiteTitle                 | `Root Suite`           | The name for the root suite. (defaults to 'Root Suite')                                                                 |
| testSuitesTitle                | `Mocha Tests`          | The name for the `testsuites` tag (defaults to 'Mocha Tests')                                                           |

## Debug mode

If you need see the log when it's executed you can provide the `DEBUG` envionment variable.
```shell
DEBUG=true
```

## License

MIT, see [LICENSE](./LICENSE) for details.
