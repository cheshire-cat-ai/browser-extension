import App from '@pages/PageView.vue'
import '@/main.css'

const app = createApp(App)

app.use(createPinia())

app.mount('#app')