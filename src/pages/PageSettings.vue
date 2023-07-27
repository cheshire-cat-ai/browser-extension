<script setup lang="ts">
import { useSettings } from '@stores/useSettings'
import { capitalize } from 'lodash';

const settingsStore = useSettings()
const { getSetting, updateSetting } = settingsStore
const { settings, isDark } = storeToRefs(settingsStore)

const ciaone = ref()

onMounted(async () => {
	await updateSetting('ciao', 'suca')
	ciaone.value = await getSetting('ciao')
})

const getType = (type: string) => {
	let inputType = 'text'
	switch (type) {
		case 'number':
			inputType = 'number'
			break;
		case 'boolean':
			inputType = 'checkbox'
			break;
		default:
			break;
	}
	return inputType
}

const getClasses = (type: string) => {
	let classes = 'input input-primary input-sm w-full !transition-all'
	switch (type) {
		case 'number':
			classes += ' pl-2 pr-0'
			break;
		case 'boolean':
			classes = '!toggle !toggle-success'
			break;
		default:
			break;
	}
	return classes
}
</script>

<template>
	<div :data-theme="isDark ? 'dark' : 'light'"
		class="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 p-2">
		<template v-for="[key, val] in Object.entries(settings)" :key="key">
			<div class="form-control">
				<label class="label">
					<span class="label-text font-medium text-primary">
						{{ key.split(/(?=[A-Z])/).map(k => capitalize(k)).join(" ") }}
					</span>
				</label>
				<input v-model="(settings as any)[key]" :type="getType(typeof val)" :class="getClasses(typeof val)">
			</div>
		</template>
	</div>
</template>