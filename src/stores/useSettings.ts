import { type CatSettings } from "ccat-api"

export const useSettings = defineStore('settings', () => {
  const settings = reactive<CatSettings>({
    baseUrl: 'localhost',
    port: '1865',
    authKey: 'meow',
    secure: false,
  })

  const isDark = usePreferredDark()

  const getSetting = async (key: string) => {
    const got = await (chrome || browser).storage.sync.get(key)
    return got.key
  }

  const updateSetting = async (key: string, value: any) => {
    await (chrome || browser).storage.sync.set({ [key]: value })
  }

  return {
    settings,
    isDark,
    getSetting,
    updateSetting
  }
})