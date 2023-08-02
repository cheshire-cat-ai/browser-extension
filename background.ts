const conversation: string[] = [];

(chrome || browser).runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    const { action, content } = msg
    switch (action) {
        case 'setSettings': {
            (chrome || browser).storage.sync.set({ 'settings': content })
            break
        }
        case 'getSettings': {
            const got = await (chrome || browser).storage.sync.get('settings')
            sendResponse(JSON.stringify(got['settings']))
            break
        }
        case 'getMessages': {
            sendResponse(JSON.stringify(conversation))
            break
        }
        case 'setMessages': {
            conversation.push(content)
            break
        }
        default:
            break
    }
})