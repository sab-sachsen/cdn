const semver = require('semver')
const PackageCache = require('../PackageCache')
const PackageInfo = require('../PackageInfo')
const PackageURL = require('../PackageURL')

/**
 * Fetch the package from the registry and store a local copy on disk.
 * Redirect if the URL does not specify an exact version number.
 */
function fetchPackage(req, res, next) {
  PackageInfo.get(req.packageName, function (error, packageInfo) {
    if (error) {
      console.error(error)
      return res.status(500).type('text').send(`Cannot get info for package "${req.packageName}"`)
    }

    if (packageInfo == null || packageInfo.versions == null)
      return res.status(404).type('text').send(`Cannot find package "${req.packageName}"`)

    req.packageInfo = packageInfo

    const { versions, 'dist-tags': tags } = req.packageInfo

    if (req.packageVersion in versions) {
      // A valid request for a package we haven't downloaded yet.
      req.packageConfig = versions[req.packageVersion]

      PackageCache.get(req.packageConfig, function (error, outputDir) {
        if (error) {
          console.error(error)
          res.status(500).type('text').send(`Cannot fetch package ${req.packageSpec}`)
        } else {
          req.packageDir = outputDir
          next()
        }
      })
    } else if (req.packageVersion in tags) {
      // Cache tag redirects for 1 minute.
      res.set({
        'Cache-Control': 'public, max-age=60',
        'Cache-Tag': 'redirect'
      }).redirect(PackageURL.create(req.packageName, tags[req.packageVersion], req.filename, req.search))
    } else {
      const maxVersion = semver.maxSatisfying(Object.keys(versions), req.packageVersion)

      if (maxVersion) {
        // Cache semver redirects for 1 minute.
        res.set({
          'Cache-Control': 'public, max-age=60',
          'Cache-Tag': 'redirect'
        }).redirect(PackageURL.create(req.packageName, maxVersion, req.filename, req.search))
      } else {
        res.status(404).type('text').send(`Cannot find package ${req.packageSpec}`)
      }
    }
  })
}

module.exports = fetchPackage
