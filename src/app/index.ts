import './lib/webext-polyfill';

import Vue from 'vue';
import VueI18n from 'vue-i18n'
import { loadi18nMessages } from './lib/i18n'
import App from './App.vue';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: navigator.language.replace('-', '_'),
  fallbackLocale: 'en',
  messages: loadi18nMessages(),
})

new Vue({
  el: '#app',
  render: h => h(App),
  i18n
});
