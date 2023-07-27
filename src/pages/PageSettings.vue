<script setup lang="ts">
import { useSettings } from '@stores/useSettings'

const settingsStore = useSettings()
const { getSetting, updateSetting } = settingsStore
const { settings, isDark } = storeToRefs(settingsStore)

const ciaone = ref("none")

//updateSetting('ciao', 'minchia').then(async () => ciaone.value = await getSetting('ciao'))
</script>

<template>
	<div :data-theme="isDark ? 'dark' : 'light'"
		class="p-2">
		Bella fra<br>
		{{ settings }}<br>
		prova:<br>
		{{ ciaone }}<br>
	</div>
</template>