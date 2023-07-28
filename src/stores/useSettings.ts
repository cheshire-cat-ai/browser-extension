import { type CatSettings } from 'ccat-api'
import { capitalize } from "lodash"

export const useSettings = defineStore('settings', () => {
  const settings = ref<CatSettings>({
    authKey: 'meow',
    baseUrl: 'localhost',
    port: '1865',
    secure: false,
  })

  tryOnMounted(async () => {
    const got = await getSetting("settings")
    if (!got) return
    settings.value = got
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
    getSetting,
    updateSetting,
    getContent,
    sendContent
  }
})