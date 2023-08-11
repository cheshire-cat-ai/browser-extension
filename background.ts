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
});

/*(chrome || browser).contextMenus.onClicked.addListener((info, tab) => {
    const action = info.menuItemId
    //let content
    if (tab?.id) {
        switch (action) {
            case 'textSelectionToCat':
                //content = info.selectionText
                break;
            case 'pageToCat':
                //content = info.pageUrl
                break;
            default:
                break;
        }
        //(chrome || browser).tabs.sendMessage(tab.id, { action, content })
    }
})

const addContextMenus = () => {
    (chrome || browser).contextMenus.create({
        title: 'Send text to the Cheshire Cat',
        contexts: ['selection'],
        id: 'textSelectionToCat'
    });

    (chrome || browser).contextMenus.create({
        title: 'Send page to the Cheshire Cat',
        contexts: ['page'],
        id: 'pageToCat'
    });
}*/

(chrome || browser).runtime.onInstalled.addListener(() => {
    console.log("Cheshire Cat AI extension installed successfully!")
    //addContextMenus()
});