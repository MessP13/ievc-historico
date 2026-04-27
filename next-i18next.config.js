/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en', 'sn', 'ts', 'nd'],
  },
  defaultNS: 'common',
  localePath: typeof window === 'undefined'
    ? require('path').resolve('./public/locales')
    : '/locales',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}
