import CatClient, { type CatSettings } from 'ccat-api'
import { capitalize } from "lodash"

export const useSettings = defineStore('settings', () => {
  const settings = ref<CatSettings>({
    authKey: 'meow',
    baseUrl: 'localhost',
    port: 1865,
    secure: false,
  })

  const apiClient = ref<CatClient>()

  tryOnMounted(() => {
    getSetting("settings").then(res => {
      if (res) settings.value = res
      apiClient.value = new CatClient(settings.value)
    })
  })

  const isDark = usePreferredDark()

  const getSetting = async (key: string) => {
    const got = await (chrome || browser).storage.sync.get(key)
    return got[key]
  }

  const updateSetting = async (key: string, value: any) => {
    await (chrome || browser).storage.sync.set({ [key]: value })
  }

  const getContent = (action: string, response: (response: any) => void) => {
    (chrome || browser).runtime.sendMessage({ action: `get${capitalize(action)}` }, response)
  }

  const sendContent = (action: string, content: any) => {
    (chrome || browser).runtime.sendMessage({ action: `set${capitalize(action)}`, content })
  }

  return {
    settings,
    isDark,
    apiClient,
    getSetting,
    updateSetting,
    getContent,
    sendContent
  }
})