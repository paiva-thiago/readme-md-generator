const ejs = require('ejs')
const ora = require('ora')
const { promisify } = require('util')
const getYear = require('date-fns/get_year')
const fs = require('fs')
const { isNil } = require('lodash')

const chooseTemplate = require('./choose-template')
const chooseLanguage = require('./choose-language')

const README_PATH = 'README.md'

/**
 * Create readme file from the given readmeContent
 *
 * @param {string} readmeContent
 */
const writeReadme = async readmeContent => {
  const spinner = ora('Creating README').start()

  try {
    await promisify(fs.writeFile)(README_PATH, readmeContent)
    spinner.succeed('README created')
  } catch (err) {
    spinner.fail('README creation fail')
    throw err
  }
}

/**
 * Get README template content from the given templatePath
 *
 * @param {string} templatePath
 */
const getReadmeTemplate = async templatePath => {
  const spinner = ora('Loading README template').start()

  try {
    const template = await promisify(fs.readFile)(templatePath, 'utf8')
    spinner.succeed('README template loaded')
    return template
  } catch (err) {
    spinner.fail('README template loading fail')
    throw err
  }
}

/**
 * Build README content with the given context and templatePath
 *
 * @param {Object} readmeLanguage
 * @param {Object} context
 * @param {string} templatePath
 */
const buildReadmeContent = async (readmeLanguage, context, templatePath) => {
  const currentYear = getYear(new Date())
  const template = await getReadmeTemplate(templatePath)

  return ejs.render(template, {
    i18n:readmeLanguage,
    filename: templatePath,
    currentYear,
    ...context
  })
}

/**
 * Validate template path
 *
 * @param {string} templatePath
 */
const validateReadmeTemplatePath = templatePath => {
  const spinner = ora('Resolving README template path').start()

  try {
    fs.lstatSync(templatePath).isFile()
  } catch (err) {
    spinner.fail(`The template path '${templatePath}' is not valid.`)
    throw err
  }

  spinner.succeed('README template path resolved')
}

/**
 * Get readme template path
 * (either a custom template, or a template that user will choose from prompt)
 *
 * @param {String} customTemplate
 */
const getReadmeTemplatePath = async (customTemplate, useDefaultAnswers) => {
  const templatePath = isNil(customTemplate)
    ? await chooseTemplate(useDefaultAnswers)
    : customTemplate

  validateReadmeTemplatePath(templatePath)

  return templatePath
}

/**
 * Get readme language
 *
 * @param {String} useDefaultAnswers
 */
const getReadmeLanguage = async (useDefaultAnswers) => {
  const readmeLanguage = await chooseLanguage(useDefaultAnswers)

  return readmeLanguage
}
module.exports = {
  writeReadme,
  buildReadmeContent,
  README_PATH,
  getReadmeTemplatePath,
  getReadmeLanguage
}
