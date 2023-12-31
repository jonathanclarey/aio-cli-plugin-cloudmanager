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
const { resetCurrentOrgId, setCurrentOrgId } = require('@adobe/aio-lib-ims')
const { init, mockSdk } = require('@adobe/aio-lib-cloudmanager')
const GetCurrentExecution = require('../../../src/commands/cloudmanager/current-execution/get')
const execution1010 = require('../../data/execution1010.json')

beforeEach(() => {
  resetCurrentOrgId()
})

test('get-current-execution - missing arg', async () => {
  expect.assertions(2)

  const runResult = GetCurrentExecution.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toThrow(/^Missing 1 required arg/)
})

test('get-current-execution - missing config', async () => {
  expect.assertions(1)

  const runResult = GetCurrentExecution.run(['5', '--programId', '5'])
  await expect(runResult).rejects.toThrow('[CloudManagerCLI:NO_IMS_CONTEXT] Unable to find IMS context aio-cli-plugin-cloudmanager.')
})

test('get-current-execution - configured', async () => {
  setCurrentOrgId('good')

  expect.assertions(8)

  const runResult = GetCurrentExecution.run(['5', '--programId', '5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await runResult
  await expect(init.mock.calls.length).toEqual(1)
  await expect(init).toHaveBeenCalledWith('good', 'test-client-id', 'fake-token', 'https://cloudmanager.adobe.io')
  await expect(mockSdk.getCurrentExecution.mock.calls.length).toEqual(1)
  await expect(mockSdk.getCurrentExecution).toHaveBeenCalledWith('5', '5')

  await expect(Object.keys(cli.table.mock.calls[0][1])).toEqual([
    'pipelineId',
    'id',
    'createdAt',
    'status',
    'trigger',
    'currentStep',
    'currentStepStatus',
  ])
  await expect(cli.table.mock.calls[0][1].currentStep.get(execution1010)).toEqual('Prod Deploy')
  await expect(cli.table.mock.calls[0][1].currentStepStatus.get(execution1010)).toEqual('WAITING')
})
