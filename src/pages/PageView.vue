<script setup lang="ts">
import { useRabbitHole } from '@stores/useRabbitHole'
import { useMessages } from '@stores/useMessages'
import { useSettings } from '@stores/useSettings'
import { useExtension } from '@stores/useExtension'
import { AcceptedFileTypes, type AcceptedFileType, AcceptedMemoryTypes, type AcceptedMemoryType } from 'ccat-api'

const { isDark } = storeToRefs(useSettings())

if (isDark.value) import("highlight.js/styles/github.css")
else import("highlight.js/styles/github-dark.css")

const messagesStore = useMessages()
const { dispatchMessage, selectRandomDefaultMessages } = messagesStore
const { currentState: messagesState } = storeToRefs(messagesStore)

const { getCurrentTab } = useExtension()

const userMessage = ref(''), isScrollable = ref(false), isTwoLines = ref(false)

const { textarea: textArea } = useTextareaAutosize({
	input: userMessage,
	onResize: () => {
		if (textArea.value) {
			isTwoLines.value = textArea.value.clientHeight >= 72
		}
	}
})

const { isListening, isSupported, toggle: toggleRecording, result: transcript } = useSpeechRecognition()
const { open: openFile, onChange: onFileUpload } = useFileDialog()

const filesStore = useRabbitHole()
const { sendFile, sendWebsite, sendMemory } = filesStore
const { currentState: rabbitHoleState } = storeToRefs(filesStore)

const inputDisabled = computed(() => {
	return messagesState.value.loading || !messagesState.value.ready || Boolean(messagesState.value.error)
})

const randomDefaultMessages = selectRandomDefaultMessages()

const dropContentZone = ref<HTMLDivElement>()

/**
 * Calls the specific endpoints based on the mime type of the file
 */
const contentHandler = (content: string | File[] | null) => {
	if (!content) return
	if (typeof content === 'string') {
		if (content.trim().length == 0) return
		try { 
			new URL(content)
			sendWebsite(content)
		} catch (_) { 
			dispatchMessage(content)
		}
	} else {
		content.forEach(f => {
			if (AcceptedFileTypes.includes(f.type as AcceptedFileType)) sendFile(f)
			else if (AcceptedMemoryTypes.includes(f.type as AcceptedMemoryType)) sendMemory(f)
		})
	}
}

const uploadCurrentWebSite = async () => {
	const tab = await getCurrentTab()
	if (tab.url) sendWebsite(tab.url)
}

/**
 * Handles the drag & drop feature
 */
const { isOverDropZone } = useDropZone(dropContentZone, {
	onLeave: () => {
		isOverDropZone.value = false
	},
	onDrop: (files, evt) => {
		const text = evt.dataTransfer?.getData("text")
		contentHandler(text || files)
	}
})

/**
 * Handles the copy-paste feature
 */
useEventListener<ClipboardEvent>(dropContentZone, 'paste', evt => {
	if ((evt.target as HTMLElement).isEqualNode(textArea.value)) return
	const text = evt.clipboardData?.getData('text')
	const files = evt.clipboardData?.getData('file') || Array.from(evt.clipboardData?.files ?? [])
	contentHandler(text || files)
})

/**
 * Handles the file upload by calling the Rabbit Hole endpoint with the file attached
 * and calls the onUpload callback if it exists.
 */
onFileUpload(files => {
	if (files == null) return
	sendFile(files[0])
})

/**
 * When the user stops recording, the transcript will be sent to the messages service.
 */
watchEffect(() => {
	if (transcript.value === '') return
	userMessage.value = transcript.value
})

/**
 * When a new message arrives, the chat will be scrolled to bottom and the input box will be focussed.
 * If audio is enabled, a pop sound will be played.
 */
watchDeep(messagesState, () => {
	isScrollable.value = document.documentElement.scrollHeight > document.documentElement.clientHeight
	scrollToBottom()
	textArea.value?.focus()
}, { flush: 'post' })

/**
 * Dispatches the user's message to the Messages service.
 */
const sendMessage = (message: string) => {
	if (message === '') return
	userMessage.value = ''
	dispatchMessage(message)
}

/**
 * Prevent sending the message if the shift key is pressed.
 */
const preventSend = (e: KeyboardEvent) => {
	if (e.key === 'Enter' && !e.shiftKey) {
		e.preventDefault()
		sendMessage(userMessage.value)
	}
}

const generatePlaceholder = (isLoading: boolean, isRecording: boolean, error?: string) => {
	if (error) return 'Well, well, well, looks like something has gone amiss'
	if (isLoading) return 'The enigmatic Cheshire cat is pondering...'
	if (isRecording) return 'The curious Cheshire cat is all ears...'
	return 'Ask the Cheshire Cat...'
}

const scrollToBottom = () => window.scrollTo({ behavior: 'smooth', left: 0, top: document.body.scrollHeight })
</script>

<template>
	<div :data-theme="isDark ? 'dark' : 'light'"
		class="relative flex h-full min-h-full w-full flex-col scroll-smooth p-2 transition-colors selection:bg-primary">
		<NotificationStack />
		<div ref="dropContentZone"
			class="relative flex h-full w-full flex-col justify-center gap-4 self-center text-sm"
			:class="[ isTwoLines ? 'pb-20' : 'pb-16' ]">
			<div v-if="isOverDropZone" class="flex h-full w-full grow flex-col items-center justify-center py-4">
				<div class="relative flex w-full grow items-center justify-center rounded-md border-2 border-dashed border-primary p-2">
					<p class="text-lg">
						Drop 
						<span class="font-medium text-primary">
							files
						</span>
						to send to the Cheshire Cat, meow!
					</p>
					<button class="btn btn-circle btn-error btn-sm absolute right-2 top-2" @click="isOverDropZone = false">
						<heroicons-x-mark-20-solid class="h-6 w-6" />
					</button>
				</div>
			</div>
			<div v-else-if="!messagesState.ready" class="flex grow items-center justify-center self-center">
				<p v-if="messagesState.error" class="w-fit rounded-md bg-error p-4 font-semibold text-base-100">
					{{ messagesState.error }}
				</p>
				<p v-else class="flex flex-col items-center justify-center gap-2">
					<span class="loading loading-spinner loading-lg text-primary" />
					<span class="text-lg font-medium text-neutral">Getting ready...</span>
				</p>
			</div>
			<div v-else-if="messagesState.messages.length"
				class="flex grow flex-col overflow-y-auto">
				<MessageBox v-for="msg in messagesState.messages"
					:key="msg.id"
					:sender="msg.sender"
					:text="msg.text" />
				<p v-if="messagesState.error" class="w-fit rounded-md bg-error p-4 font-semibold text-base-100">
					{{ messagesState.error }}
				</p>
				<div v-else-if="!messagesState.error && messagesState.loading" class="mb-2 ml-2 flex items-center gap-2">
					<span class="text-lg">😺</span>
					<p class="flex items-center gap-2">
						<span class="loading loading-dots loading-xs" />
						Cheshire Cat is thinking...
					</p>
				</div>
			</div>
			<div v-else class="flex grow cursor-pointer flex-col items-center justify-center gap-4 overflow-y-auto p-4">
				<div v-for="(msg, index) in randomDefaultMessages" :key="index" 
					class="btn btn-neutral font-medium normal-case text-base-100 shadow-lg"
					@click="sendMessage(msg)">
					{{ msg }}
				</div>
			</div>
			<div class="fixed bottom-0 left-0 flex w-full items-center justify-center p-2">
				<div class="flex w-full items-center gap-2">
					<div class="relative w-full">
						<textarea ref="textArea" v-model.trim="userMessage" :disabled="inputDisabled"
							class="textarea block max-h-20 w-full resize-none overflow-auto bg-base-200 !outline-offset-0" 
							:class="[ isTwoLines ? 'pr-10' : 'pr-20' ]"
							:placeholder="generatePlaceholder(messagesState.loading, isListening, messagesState.error)" @keydown="preventSend" />
						<div :class="[ isTwoLines ? 'flex-col-reverse' : '' ]" class="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1">
							<button :disabled="inputDisabled || userMessage.length === 0"
								class="btn btn-circle btn-ghost btn-sm self-center"
								@click="sendMessage(userMessage)">
								<heroicons-paper-airplane-solid class="h-6 w-6" />
							</button>
							<div class="dropdown dropdown-end dropdown-top self-center">
								<button tabindex="0" :disabled="inputDisabled" class="btn btn-circle btn-ghost btn-sm">
									<heroicons-bolt-solid class="h-6 w-6" />
								</button>
								<ul tabindex="0" class="dropdown-content join join-vertical !-right-1/4 z-10 mb-5 p-0">
									<li>
										<button :disabled="rabbitHoleState.loading" 
											class="btn join-item h-auto w-full flex-nowrap p-2" @click="uploadCurrentWebSite()">
											<span class="grow normal-case">Upload current page</span>
											<span class="rounded-lg bg-info p-1 text-base-100">
												<heroicons-globe-alt class="h-6 w-6" />
											</span>
										</button>
									</li>
									<li>
										<button :disabled="rabbitHoleState.loading" 
											class="btn join-item h-auto w-full flex-nowrap p-2" 
											@click="openFile({ multiple: false, accept: AcceptedFileTypes.join(',') })">
											<span class="grow normal-case">Upload file</span>
											<span class="rounded-lg bg-warning p-1 text-base-100">
												<heroicons-document-text-solid class="h-6 w-6" />
											</span>
										</button>
									</li>
								</ul>
							</div>
						</div>
					</div>
					<button v-if="isSupported" 
						class="btn btn-circle btn-primary" :class="[isListening ? 'glass btn-outline' : '']"
						:disabled="inputDisabled" @click="toggleRecording()">
						<heroicons-microphone-solid class="h-6 w-6" />
					</button>
				</div>
				<button v-if="isScrollable" class="btn btn-circle btn-primary btn-outline btn-sm absolute bottom-28 right-4 bg-base-100"
					@click="scrollToBottom">
					<heroicons-arrow-down-20-solid class="h-5 w-5" />
				</button>
			</div>
		</div>
	</div>
</template>
