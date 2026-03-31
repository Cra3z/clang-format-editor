import { createApp, watch } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import { i18n, setI18nLocale } from './i18n'
import { useSettingsStore } from './stores/settingsStore'
import GeneralView from './views/General.vue'
import TabsAndIndentsView from './views/TabsAndIndents.vue'
import SpacesView from './views/Spaces.vue'
import WrappingAndBracesView from './views/WrappingAndBraces.vue'
import BlankLinesView from './views/BlankLines.vue'
import AlignmentView from './views/Alignment.vue'

import './assets/styles/global.scss'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/general' },
    { path: '/general', component: GeneralView },
    { path: '/tabs-and-indents', component: TabsAndIndentsView },
    { path: '/spaces', component: SpacesView },
    { path: '/wrapping-and-braces', component: WrappingAndBracesView },
    { path: '/blank-lines', component: BlankLinesView },
    { path: '/alignment', component: AlignmentView },
  ],
})

const app = createApp(App)
const pinia = createPinia()
const settingsStore = useSettingsStore(pinia)

watch(() => settingsStore.resolvedLocale, (locale) => {
  setI18nLocale(locale)
}, { immediate: true })

app.use(pinia)
app.use(i18n)
app.use(router)
app.mount('#app')
