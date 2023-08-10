import { useMessages } from '@stores/useMessages'
import { useRabbitHole } from '@stores/useRabbitHole'

export const useExtension = defineStore('extension', () => {

  const { dispatchMessage } = useMessages()
  const { sendWebsite } = useRabbitHole()

  /*tryOnMounted(() => {
    (chrome || browser).runtime.onMessage.addListener(msg => {
      const { action, content } = msg
      switch (action) {
        case 'textSelectionToCat':
          dispatchMessage(content)
          break;
        case 'pageToCat':
          sendWebsite(content)
          break;
        default:
          break;
      }
    });
  })*/

  const getCurrentTab = (callback: (tabs: chrome.tabs.Tab[]) => void) => {
    (chrome || browser).tabs.query({ active: true, lastFocusedWindow: true }, callback)
  }

  return {
    getCurrentTab
  }
})