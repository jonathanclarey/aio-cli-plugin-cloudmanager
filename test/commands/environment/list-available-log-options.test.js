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
const { init, mockSdk } = require('@adobe/aio-lib-cloudmanager')
const { setStore } = require('@adobe/aio-lib-core-config')
const { resetCurrentOrgId, setCurrentOrgId } = require('@adobe/aio-lib-ims')
const ListAvailableLogOptionsCommand = require('../../../src/commands/cloudmanager/environment/list-available-log-options')

beforeEach(() => {
  resetCurrentOrgId()
})

test('list-available-logs - missing arg', async () => {
  expect.assertions(2)

  const runResult = ListAvailableLogOptionsCommand.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toThrow(/^Missing 1 required arg/)
})

test('list-available-logs - missing programId', async () => {
  expect.assertions(2)

  const runResult = ListAvailableLogOptionsCommand.run(['1'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toThrow('[CloudManagerCLI:MISSING_PROGRAM_ID] Program ID must be specified either as --programId flag or through cloudmanager_programid config value.')
})

test('list-available-logs - missing config', async () => {
  expect.assertions(1)

  const runResult = ListAvailableLogOptionsCommand.run(['1', '--programId', '5'])
  await expect(runResult).rejects.toThrow('[CloudManagerCLI:NO_IMS_CONTEXT] Unable to find IMS context aio-cli-plugin-cloudmanager.')
})

test('list-available-logs - empty', async () => {
  setCurrentOrgId('good')
  setStore({
    cloudmanager_programid: '6',
  })

  expect.assertions(6)

  const runResult = ListAvailableLogOptionsCommand.run(['1'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await runResult
  await expect(init.mock.calls.length).toEqual(1)
  await expect(init).toHaveBeenCalledWith('good', 'test-client-id', 'fake-token', 'https://cloudmanager.adobe.io')
  await expect(mockSdk.listAvailableLogOptions.mock.calls.length).toEqual(1)
  await expect(mockSdk.listAvailableLogOptions).toHaveBeenCalledWith('6', '1')
  await expect(cli.info.mock.calls[0][0]).toBe('No log options are available for environmentId 1')
})

test('list-available-logs - some entries', async () => {
  setCurrentOrgId('good')
  setStore({
    cloudmanager_programid: '6',
  })
  mockSdk.listAvailableLogOptions = jest.fn(() => [
    {
      service: 'author',
      name: 'aemerror',
    },
    {
      service: 'author',
      name: 'aemrequest',
    },
    {
      service: 'author',
      name: 'aemaccess',
    },
    {
      service: 'publish',
      name: 'aemerror',
    },
    {
      service: 'publish',
      name: 'aemrequest',
    },
    {
      service: 'publish',
      name: 'aemaccess',
    },
    {
      service: 'dispatcher',
      name: 'httpdaccess',
    },
    {
      service: 'dispatcher',
      name: 'httpderror',
    },
    {
      service: 'dispatcher',
      name: 'aemdispatcher',
    },
  ])

  expect.assertions(8)

  const runResult = ListAvailableLogOptionsCommand.run(['42'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await runResult
  await expect(init.mock.calls.length).toEqual(1)
  await expect(init).toHaveBeenCalledWith('good', 'test-client-id', 'fake-token', 'https://cloudmanager.adobe.io')
  await expect(mockSdk.listAvailableLogOptions.mock.calls.length).toEqual(1)
  await expect(mockSdk.listAvailableLogOptions).toHaveBeenCalledWith('6', '42')
  await expect(cli.info.mock.calls).toHaveLength(0)
  await expect(cli.table.mock.calls).toHaveLength(1)
  await expect(cli.table.mock.calls[0][1].id.get({ environmentid: 'ignored' })).toEqual('42')
})
