<script lang="ts">
	import { SuiteFavicons } from '@ramo-libre/ui-themes';
	import { VERSION } from '$lib/utils/version';
	import { shareLab, hydrateFromUrl } from '$lib/share';
	import { db } from '$lib/state/index.svelte';
	import { onMount } from 'svelte';
	import { Link2, FolderOpen, Settings, Check } from '@lucide/svelte'; // Importamos Check
	import Datos from './Datos.svelte';
	import Apariencia from './Apariencia.svelte';
	import Entornos from './Entornos.svelte';
	import SourceCode from './SourceCode.svelte';

	let { onSelect = () => {} } = $props<{ onSelect?: () => void }>();

	let activeTab = $state<'entornos' | 'config'>('entornos');

	// Runa para controlar la microinteracción de copiado
	let copied = $state(false);

	onMount(async () => {
		const lab = await hydrateFromUrl();
		if (lab) db.simulaciones.loadActual(lab);
	});

	async function handleShareLink() {
		if (copied) return;

		const url = await shareLab(db.simulaciones.actual);
		navigator.clipboard.writeText(url).then(() => {
			copied = true;

			// Retornar al estado original tras 2 segundos
			setTimeout(() => {
				copied = false;
			}, 2000);
		});
	}
</script>

<div
	class="box-border flex h-screen max-h-screen w-screen flex-col gap-5 overflow-hidden p-6 select-none md:max-w-85 md:bg-transparent"
>
	<div class="border-base-400 bg-base-200 flex shrink-0 flex-col gap-4 rounded-xl border p-4">
		<div class="flex items-center gap-3">
			<div
				class="border-base-400 bg-base-300 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border p-2"
			>
				<img src={SuiteFavicons.lab} alt="RamoLibre Logo" class="h-5 w-5 object-contain" />
			</div>

			<div class="flex min-w-0 flex-1 items-center justify-between">
				<div class="flex flex-col justify-center">
					<h4 class="text-content truncate text-base font-bold tracking-tight">
						RamoLibre <span class="text-primary-100 font-extrabold">LAB</span>
					</h4>
					<span class="mt-0.5 text-[10px] font-medium opacity-40">Open Source Sandbox</span>
				</div>
				<span
					class="border-base-400 bg-base-300 text-content rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold opacity-70"
				>
					{VERSION}
				</span>
			</div>
		</div>

		<div class="bg-base-300 flex gap-1 rounded-lg p-1 text-sm font-medium">
			<button
				onclick={() => (activeTab = 'entornos')}
				class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md py-2 text-center transition-all duration-150
                {activeTab === 'entornos'
					? 'bg-base-100 text-content font-semibold shadow-sm'
					: 'text-content opacity-60 hover:opacity-100'}"
			>
				<FolderOpen size={16} /> Entornos
			</button>
			<button
				onclick={() => (activeTab = 'config')}
				class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md py-2 text-center transition-all duration-150
                {activeTab === 'config'
					? 'bg-base-100 text-content font-semibold shadow-sm'
					: 'text-content opacity-60 hover:opacity-100'}"
			>
				<Settings size={16} /> Config
			</button>
		</div>

		<button
			onclick={handleShareLink}
			class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg p-2.5 text-center text-sm font-semibold transition-all duration-300 active:scale-[0.99]
            {copied
				? 'bg-success-100 text-white opacity-100'
				: 'bg-primary-100 text-white hover:opacity-90'}"
		>
			{#if copied}
				<div class="animate-scale-in flex items-center gap-2">
					<Check size={15} />
					<span>¡Copiado con éxito!</span>
				</div>
			{:else}
				<div class="flex items-center gap-2">
					<Link2 size={15} />
					<span>Compartir Actual</span>
				</div>
			{/if}
		</button>
	</div>

	{#if activeTab === 'entornos'}
		<div onclick={onSelect} role="presentation" class="flex min-h-0 flex-1 flex-col">
			<Entornos />
		</div>
	{:else if activeTab === 'config'}
		<div class="flex min-h-0 flex-1 scrollbar-thin flex-col gap-4 overflow-y-auto pr-1">
			<Apariencia />
			<Datos />
			<SourceCode />
		</div>
	{/if}
</div>
