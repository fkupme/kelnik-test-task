// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2025-07-15',
	devtools: { enabled: true },

	modules: ['@pinia/nuxt', '@nuxt/fonts', '@nuxt/icon', '@vueuse/nuxt'],

	ssr: false,

	css: ['~/assets/scss/main.scss'],

	vite: {
		css: {
			preprocessorOptions: {
				scss: {
					additionalData: '@use "~/assets/scss/variables" as *;',
				},
			},
		},
	},
  components:[
    {path:'~/components/views', prefix: 'View', pathPrefix: true }, 
    { path: '~/components/ui', prefix: 'UI',pathPrefix: true },
    // { path: '~/components/ui/controls', prefix: 'Controls', pathPrefix: true },
    // { path: '~/components/ui/feedback', prefix: 'Feedback', pathPrefix: true },
    // { path: '~/components/ui/cards', prefix: 'Card', pathPrefix: true },
    { path: '~/components/apartments', prefix: 'Apartment', pathPrefix: true }
  ],

	typescript: {
		typeCheck: false,
	},
});
