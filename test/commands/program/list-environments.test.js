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
const { resetCurrentOrgId, setCurrentOrgId } = require('@adobe/aio-lib-ims')
const { setStore } = require('@adobe/aio-lib-core-config')
const ListEnvironmentsCommand = require('../../../src/commands/cloudmanager/program/list-environments')

beforeEach(() => {
  resetCurrentOrgId()
})

test('list-environments - missing arg', async () => {
  expect.assertions(2)

  const runResult = ListEnvironmentsCommand.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toThrow('[CloudManagerCLI:MISSING_PROGRAM_ID] Program ID must be specified either as --programId flag or through cloudmanager_programid config value.')
})

test('list-environments - missing config', async () => {
  expect.assertions(2)

  const runResult = ListEnvironmentsCommand.run(['--programId', '5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toThrow('[CloudManagerCLI:NO_IMS_CONTEXT] Unable to find IMS context aio-cli-plugin-cloudmanager.')
})

test('list-environments - configured', async () => {
  setCurrentOrgId('good')
  setStore({
    cloudmanager_programid: '6',
  })

  expect.assertions(7)

  const runResult = ListEnvironmentsCommand.run([])
  await expect(runResult instanceof Promise).toBeTruthy()

  await runResult
  await expect(init.mock.calls.length).toEqual(1)
  await expect(init).toHaveBeenCalledWith('good', 'test-client-id', 'fake-token', 'https://cloudmanager.adobe.io')
  await expect(mockSdk.listEnvironments.mock.calls.length).toEqual(1)
  await expect(mockSdk.listEnvironments).toHaveBeenCalledWith('6')

  await expect(cli.table.mock.calls[0][1].description.get({})).toBe('')
  await expect(cli.table.mock.calls[0][1].description.get({ description: 'foo' })).toBe('foo')
})
