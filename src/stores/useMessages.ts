import type { MessagesState } from '@stores/types'
import type { BotMessage, UserMessage } from '@models/Message'
import { now, uniqueId } from 'lodash'
import { useNotifications } from '@stores/useNotifications'
import { useSettings } from '@stores/useSettings'

export const useMessages = defineStore('messages', () => {
  const currentState = reactive<MessagesState>({
    ready: false,
    loading: false,
    messages: [],
    defaultMessages: [
      'What\'s up?',
      'Who\'s the Queen of Hearts?',
      'Where is the white rabbit?',
      'What is Python?',
      'How do I write my own AI app?',
      'Does pineapple belong on pizza?',
      'What is the meaning of life?',
      'What is the best programming language?',
      'What is the best pizza topping?',
      'What is a language model?',
      'What is a neural network?',
      'What is a chatbot?',
      'What time is it?',
      'Is AI capable of creating art?',
      'What is the best way to learn AI?',
      'Is it worth learning AI?',
      'Who is the Cheshire Cat?',
      'Is Alice in Wonderland a true story?',
      'Who is the Mad Hatter?',
      'How do I find my way to Wonderland?',
      'Is Wonderland a real place?'
    ]
  })

  const { showNotification } = useNotifications()

  const settings = useSettings()
  const { sendContent, getContent } = settings
  const { apiClient } = storeToRefs(settings)

  watchEffect(() => {
    getContent("messages", (msgs) => {
      if (!msgs) return
      let messages = JSON.parse(msgs)
      if (Array.isArray(messages) && messages.length > 0) {
        messages = messages.map(v => JSON.parse(v))
        currentState.messages = messages
      }
    })
    /**
     * Subscribes to the messages service on component mount
     * and dispatches the received messages to the store.
     * It also dispatches the error to the store if an error occurs.
     */
    apiClient.value?.onConnected(() => {
      currentState.ready = true
    }).onMessage(({ content, type, why }) => {
      if (type === 'chat') {
        addMessage({
          text: content,
          sender: 'bot',
          timestamp: now(),
          why
        })
      } else if (type === 'notification') {
        showNotification({
          type: 'info',
          text: content
        })
      }
    }).onError(error => {
      currentState.loading = currentState.ready = false
      currentState.error = error.description
    }).onDisconnected(() => {
      currentState.ready = false
    })
  })

  tryOnUnmounted(() => {
    /**
     * Unsubscribes to the messages service on component unmount
     */
    apiClient.value?.close()
  })

  /**
   * Adds a message to the list of messages
   */
  const addMessage = (message: Omit<BotMessage, 'id'> | Omit<UserMessage, 'id'>) => {
    currentState.error = undefined
    const msg = {
      id: uniqueId('m_'),
      ...message
    }
    currentState.messages.push(msg)
    sendContent("messages", JSON.stringify(msg))
    currentState.loading = msg.sender === 'user'
  }

  /**
   * Selects 5 random default messages from the messages slice.
   */
  const selectRandomDefaultMessages = () => {
    const messages = [...currentState.defaultMessages]
    const shuffled = messages.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 5)
  }

  /**
   * Sends a message to the messages service and dispatches it to the store
   */
  const dispatchMessage = async (message: string) => {
    apiClient.value?.send(message)
    addMessage({
      text: message.trim(),
      timestamp: now(),
      sender: 'user'
    })
  }

  return {
    currentState,
    addMessage,
    selectRandomDefaultMessages,
    dispatchMessage
  }
})