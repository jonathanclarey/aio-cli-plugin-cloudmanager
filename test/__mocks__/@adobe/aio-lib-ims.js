/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

let currentOrgId

let organizations

let profile

module.exports = {
  getToken: jest.fn(ctx => 'fake-token'),
  context: {
    get: jest.fn(() => {
      if (currentOrgId) {
        return {
          data: {
            client_id: 'test-client-id',
            ims_org_id: currentOrgId,
          },
        }
      } else {
        return {
          data: undefined,
        }
      }
    }),
    set: jest.fn(),
  },
  setCurrentOrgId: (o) => {
    currentOrgId = o
  },
  resetCurrentOrgId: () => {
    currentOrgId = undefined
  },
  Ims: {
    fromToken: jest.fn((token) => {
      return {
        token: token,
        ims: {
          getOrganizations: jest.fn(() => organizations),
          get: jest.fn(() => profile),
        },
      }
    }),
  },
  setOrganizations: (value) => {
    organizations = value
  },
  setProfile: (value) => {
    profile = value
  },
}
