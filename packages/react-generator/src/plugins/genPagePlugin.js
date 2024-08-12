import { mergeOptions } from '../utils/mergeOptions'
import prettier from 'prettier'
import parserHtml from 'prettier/parser-html'
import parseCss from 'prettier/parser-postcss'
import parseTypescript from 'prettier/parser-typescript'
import parserBabel from 'prettier/parser-babel'
// import { genSFCWithDefaultPlugin } from '../generator'

const defaultOption = {
  pageBasePath: './src/views'
}

function genPagePlugin(options = {}) {
  const realOptions = mergeOptions(defaultOption, options)

  const { pageBasePath, sfcConfig = {} } = realOptions

  /**
   * 
   * @param {} codeList 
   */
  const prettierCode = (codeList) => {
    const pageFiles = []

    const formatTypePluginMap = {
      babel: [parserBabel],
      vue: [parserHtml, parserBabel, parseCss],
      javascript: [parserBabel],
      typescript: [parseTypescript, parserBabel],
      css: [parseCss],
      less: [parseCss],
      sass: [parseCss],
      json: [parserBabel]
    }
  
    const blockList = codeList.filter((item) => item.type === 'Block').map((item) => item.panelName)
    codeList.forEach(({ panelName, panelValue = '', prettierOpts, type }) => {
      if (panelName) {
        if (prettierOpts?.parser && formatTypePluginMap[prettierOpts.parser]) {
          panelValue = prettier.format(panelValue, {
            ...prettierOpts,
            plugins: formatTypePluginMap[prettierOpts.parser]
          })
        }
        if (type === 'Page' && blockList.length) {
          blockList.forEach((blockName) => {
            panelValue = panelValue.replace(`./${blockName}`, `${basePaths.blocks.replace('src/', '@/')}${blockName}`)
          })
        }
        const [fileName, fileType] = panelName.split('.')
        pageFiles.push({
          fileType: `${fileType}`,
          fileName: `${fileName}.${fileType}`,
          path: `${pageBasePath}/${fileName || ''}`,
          fileContent: `${panelValue}`
        })
      }
    })
  
    return pageFiles
  }

  return {
    name: 'tinyEngine-generateCode-plugin-page',
    description: 'transform page schema to code',
    /**
     * 将页面 schema 转换成高代码
     * @param {tinyEngineDslVue.IAppSchema} schema
     * @returns
     */
    run(schema) {
      // 先做一点小改造, 后面再改回来
      // const pages = schema.pageSchema
      const pages = schema.reactData

      return prettierCode(pages)
    }
  }
}

export default genPagePlugin