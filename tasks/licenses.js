/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { getInstalledPackages } from '../src/dev/npm';
import {
  assertLicensesValid,
  LICENSE_WHITELIST,
  DEV_ONLY_LICENSE_WHITELIST,
  LICENSE_OVERRIDES,
} from '../src/dev/license_checker';

export default function licenses(grunt) {
  grunt.registerTask('licenses', 'Checks dependency licenses', async function () {
    const done = this.async();

    try {
      const dev = Boolean(grunt.option('dev'));

      // Get full packages list according dev flag
      const packages = await getInstalledPackages({
        directory: grunt.config.get('root'),
        licenseOverrides: LICENSE_OVERRIDES,
        dev
      });
      // Filter the packages only used in production
      const prodPackages = packages.filter(pkg => !pkg.isDevOnly);

      // Assert if the found licenses in the production
      // packages are valid
      assertLicensesValid({
        packages: prodPackages,
        validLicenses: LICENSE_WHITELIST
      });

      // Do the same as above for the packages only used in development
      // if the dev flag is found
      if (dev) {
        const devPackages = packages.filter(pkg => pkg.isDevOnly);

        assertLicensesValid({
          packages: devPackages,
          validLicenses: LICENSE_WHITELIST.concat(DEV_ONLY_LICENSE_WHITELIST)
        });
      }

      done();
    } catch (err) {
      grunt.fail.fatal(err);
      done(err);
    }
  });
}
