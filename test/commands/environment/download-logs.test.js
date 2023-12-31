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

const { resetCurrentOrgId, setCurrentOrgId } = require('@adobe/aio-lib-ims')
const { cli } = require('cli-ux')
const path = require('path')
const { init, mockSdk } = require('@adobe/aio-lib-cloudmanager')
const DownloadLogs = require('../../../src/commands/cloudmanager/environment/download-logs')

beforeEach(() => {
  resetCurrentOrgId()
})

test('download-logs - missing arg', async () => {
  expect.assertions(2)

  const runResult = DownloadLogs.run([])
  await expect(runResult instanceof Promise).toBeTruthy()
  await expect(runResult).rejects.toThrow(/^Missing 3 required args/)
})

test('download-logs - missing config', async () => {
  expect.assertions(1)

  const runResult = DownloadLogs.run(['5', 'author', 'aemerror', '--programId', '5'])
  await expect(runResult).rejects.toThrow('[CloudManagerCLI:NO_IMS_CONTEXT] Unable to find IMS context aio-cli-plugin-cloudmanager.')
})

test('download-logs - success single', async () => {
  setCurrentOrgId('good')

  expect.assertions(9)

  const runResult = DownloadLogs.run(['17', 'author', 'aemerror', '--programId', '5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await runResult
  await expect(init.mock.calls.length).toEqual(1)
  await expect(init).toHaveBeenCalledWith('good', 'test-client-id', 'fake-token', 'https://cloudmanager.adobe.io')
  await expect(mockSdk.downloadLogs.mock.calls.length).toEqual(1)
  await expect(mockSdk.downloadLogs).toHaveBeenCalledWith('5', '17', 'author', 'aemerror', '1', '.')

  await expect(cli.action.start.mock.calls.length).toEqual(1)
  await expect(cli.action.stop.mock.calls.length).toEqual(1)
  await expect(cli.action.stop.mock.calls[0][0]).toEqual(`downloaded 1 file to ${path.resolve('.')}`)

  await expect(cli.table.mock.calls[0][1].path.get({ path: '.' })).toEqual(path.resolve(''))
})

test('download-logs - success multiple', async () => {
  setCurrentOrgId('good')
  mockSdk.downloadLogs = jest.fn(() => Promise.resolve([{
    path: './1-author-aemerror-2019-09-8.log',
  },
  {
    path: './1-author-aemerror-2019-09-7.log',
  }]))

  expect.assertions(8)

  const runResult = DownloadLogs.run(['17', 'author', 'aemerror', '--programId', '5'])
  await expect(runResult instanceof Promise).toBeTruthy()
  await runResult
  await expect(init.mock.calls.length).toEqual(1)
  await expect(init).toHaveBeenCalledWith('good', 'test-client-id', 'fake-token', 'https://cloudmanager.adobe.io')
  await expect(mockSdk.downloadLogs.mock.calls.length).toEqual(1)
  await expect(mockSdk.downloadLogs).toHaveBeenCalledWith('5', '17', 'author', 'aemerror', '1', '.')

  await expect(cli.action.start.mock.calls.length).toEqual(1)
  await expect(cli.action.stop.mock.calls.length).toEqual(1)
  await expect(cli.action.stop.mock.calls[0][0]).toEqual(`downloaded 2 files to ${path.resolve('.')}`)
})
