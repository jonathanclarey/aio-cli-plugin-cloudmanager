/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { cli } = require('cli-ux')
const { init, generateNewMock } = require('@adobe/aio-lib-cloudmanager')
const { resetCurrentOrgId, setCurrentOrgId } = require('@adobe/aio-lib-ims')
const GetQualityGateResults = require('../../../src/commands/cloudmanager/execution/get-quality-gate-results')

let mockSdk

beforeEach(() => {
  resetCurrentOrgId()
  mockSdk = generateNewMock()
})

test('get-quality-gate-results - missing arg', async () => {
  expect.assertions(2)

  const runResult = GetQualityGateResults.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toThrow(/^Missing 3 required args/)
})

test('get-quality-gate-results - missing config', async () => {
  expect.assertions(2)

  const runResult = GetQualityGateResults.run(['5', '--programId', '7', '1001', 'codeQuality'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toThrow('[CloudManagerCLI:NO_IMS_CONTEXT] Unable to find IMS context aio-cli-plugin-cloudmanager.')
})

test('get-quality-gate-results - happy path', async () => {
  setCurrentOrgId('good')

  expect.assertions(6)

  const runResult = GetQualityGateResults.run(['5', '--programId', '15', '1002', 'codeQuality'])
  await expect(runResult instanceof Promise).toBeTruthy()

  await runResult
  await expect(init.mock.calls.length).toEqual(1)
  await expect(init).toHaveBeenCalledWith('good', 'test-client-id', 'fake-token', 'https://cloudmanager.adobe.io')
  await expect(mockSdk.getQualityGateResults.mock.calls.length).toEqual(1)
  await expect(mockSdk.getQualityGateResults).toHaveBeenCalledWith('15', '5', '1002', 'codeQuality')

  await expect(cli.table.mock.calls[0][1].severity.get({ severity: 'major' })).toEqual('Major')
})

test('get-quality-gate-results - no metrics', async () => {
  setCurrentOrgId('good')
  mockSdk.getQualityGateResults = jest.fn(() => Promise.resolve({}))

  expect.assertions(6)

  const runResult = GetQualityGateResults.run(['5', '--programId', '15', '1002', 'codeQuality'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toEqual(new Error('[CloudManagerCLI:MISSING_METRICS] Metrics for action codeQuality on execution 1002 could not be found.'))
  await expect(init.mock.calls.length).toEqual(1)
  await expect(init).toHaveBeenCalledWith('good', 'test-client-id', 'fake-token', 'https://cloudmanager.adobe.io')
  await expect(mockSdk.getQualityGateResults.mock.calls.length).toEqual(1)
  await expect(mockSdk.getQualityGateResults).toHaveBeenCalledWith('15', '5', '1002', 'codeQuality')
})

test('get-quality-gate-results - experienceAudit', async () => {
  setCurrentOrgId('good')

  expect.assertions(11)

  const runResult = GetQualityGateResults.run(['5', '--programId', '15', '1002', 'experienceAudit'])
  await expect(runResult instanceof Promise).toBeTruthy()

  await runResult
  await expect(init.mock.calls.length).toEqual(1)
  await expect(init).toHaveBeenCalledWith('good', 'test-client-id', 'fake-token', 'https://cloudmanager.adobe.io')
  await expect(mockSdk.getQualityGateResults.mock.calls.length).toEqual(1)
  await expect(mockSdk.getQualityGateResults).toHaveBeenCalledWith('15', '5', '1002', 'contentAudit')

  await expect(cli.table.mock.calls[0][1].kpi.get({ kpi: 'pwa' })).toEqual('PWA')
  await expect(cli.table.mock.calls[0][1].kpi.get({ kpi: 'seo' })).toEqual('SEO')
  await expect(cli.table.mock.calls[0][1].kpi.get({ kpi: 'sqale rating' })).toEqual('Maintainability Rating')
  await expect(cli.table.mock.calls[0][1].kpi.get({ kpi: 'security rating' })).toEqual('Security Rating')
  await expect(cli.table.mock.calls[0][1].passed.get({ passed: true })).toEqual('Yes')
  await expect(cli.table.mock.calls[0][1].passed.get({ passed: false })).toEqual('No')
})
