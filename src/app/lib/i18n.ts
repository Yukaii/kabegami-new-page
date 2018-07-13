const langs = ['en', 'zh_TW']

export function loadi18nMessages () {
  return langs.reduce((lang, l) => {
    const locales = require(`../../_locales/${l}/messages.json`)

    return {
      ...lang,
      [l]: flattenExtMessage(locales)
    }
  }, {})
}

function flattenExtMessage (extMessage) {
  return Object.keys(extMessage).reduce((mes, key) => {
    return {
      ...mes,
      [key]: extMessage[key].message
    }
  }, {})
}
