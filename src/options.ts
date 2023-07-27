import App from '@pages/PageSettings.vue'
import '@/main.css'

const app = createApp(App)

app.use(createPinia())

app.mount('#settings')