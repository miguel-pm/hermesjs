const fs = require('fs')
const { exec } = require('child_process')

const dependencies = []
const REMOVABLE_ELEMENTS = [
  './node_modules',
  './src',
  './.babelrc',
  './.eslintignore',
  './.eslintrc',
  './package-lock.json',
  './rollup.config.js',
  './tsconfig.json'
]

/**
 * Add the dev dependencies when the package is installed with npm
 */
const installDependencies = deps => new Promise((resolve, reject) => {
  const depsString = deps.join(' ')
  console.log('Installing!', depsString)
  exec(`npm i -D ${depsString}`, (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`)
    console.log(`stderr: ${stderr}`)
    if (error !== null && error !== undefined) {
      return reject(error)
    }
    return resolve(stdout)
  })
})

/**
 * Run the `npm run build` script to build the TypeScript code
 */
const buildCode = () => new Promise((resolve, reject) => {
  console.log('building code')
  exec('npm run build', (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`)
    console.log(`stderr: ${stderr}`)
    if (error !== null && error !== undefined) {
      return reject(error)
    }
    return resolve(stdout)
  })
})

/**
 * Remove generic files that are not used by the built code
 */
const treeShaking = () => new Promise((resolve, reject) => {
  console.log('Removing unused files!')
  exec(`rm -rf ${REMOVABLE_ELEMENTS.join(' ')}`, (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`)
    console.log(`stderr: ${stderr}`)
    if (error !== null && error !== undefined) {
      return reject(error)
    }
    return resolve(stdout)
  })
});

/**
 * Main process. Install the specified dev dependencies since they won't get installed by npm when
 * a git package is specified, once this is finished execute the build command to get the compiled
 * Javascript code out of the Typescript source and then remove all unused elements with the tree shaking function.
 */
(async function main () {
  const packageJSONStr = fs.readFileSync('./package.json')
  const packageJSONContent = JSON.parse(packageJSONStr)

  const { devDependencies } = packageJSONContent
  for (const [depName, depVersion] of Object.entries(devDependencies)) {
    dependencies.push(`${depName}@${depVersion}`)
  }
  console.log(dependencies)
  await installDependencies(dependencies)
  await buildCode()
  // await treeShaking()
}()).catch(err => {
  console.error(err)
  process.exit(1)
})
