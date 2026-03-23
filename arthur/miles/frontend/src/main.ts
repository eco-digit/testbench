import { createApp } from 'vue'
require('./assets/main.scss')
import App from './App.vue'
import { i18n } from '@/i18n/i18n';

createApp(App)
.use(i18n)
.mount('#app')
