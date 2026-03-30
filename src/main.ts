import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'

import './assets/styles/global.scss'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/general' },
    { path: '/general', component: () => import('./views/General.vue') },
    { path: '/tabs-and-indents', component: () => import('./views/TabsAndIndents.vue') },
    { path: '/spaces', component: () => import('./views/Spaces.vue') },
    { path: '/wrapping-and-braces', component: () => import('./views/WrappingAndBraces.vue') },
    { path: '/blank-lines', component: () => import('./views/BlankLines.vue') },
    { path: '/alignment', component: () => import('./views/Alignment.vue') },
  ],
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
