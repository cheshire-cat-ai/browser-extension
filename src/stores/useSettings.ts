import { type CatSettings } from "ccat-api"

export const useSettings = defineStore('settings', () => {
  const settings = reactive<CatSettings>({
    baseUrl: 'localhost'
  })

  const isDark = usePreferredDark()

  const getSetting = async (key: string) => {
    const got = await chrome.storage.sync.get(key)
    return got.key
  }

  const updateSetting = async (key: string, value: any) => {
    await chrome.storage.sync.set({ [key]: value })
  }

  return {
    settings,
    isDark,
    getSetting,
    updateSetting
  }
})