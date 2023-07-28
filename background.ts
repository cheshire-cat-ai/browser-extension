import { CatClient } from 'ccat-api'

let apiClient = new CatClient({
    authKey: 'meow',
    baseUrl: 'localhost',
    port: '1865',
    secure: false
});

(chrome || browser).runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    const { action, content } = msg
    switch (action) {
        case 'setSettings': {
            (chrome || browser).storage.sync.set({ 'settings': content })
            apiClient = new CatClient(content)
            break
        }
        case 'getSettings': {
            const got = (await (chrome || browser).storage.sync.get('settings'))
            sendResponse(got['settings'])
            break
        }
        case 'getClient': {
            sendResponse(apiClient)
            break
        }
        default:
            break
    }
})