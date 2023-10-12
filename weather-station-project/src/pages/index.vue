<template>
	<Stats2 />
</template>

<style>
	#app {
		text-align: center;
		color: var(--ep-text-color-primary);
	}

	.main-container {
		height: calc(100vh - var(--ep-menu-item-height) - 3px);
	}
</style>

<script lang="ts" setup>
	import { onMounted } from "vue";
	import { useStationStore } from "~/store/stations";
	import { useUserStore } from "~/store/user";
	// import { useStationStore } from "./store/stations";

	const userStore = useUserStore();
	const stationStore = useStationStore();
	const router = useRouter();
	onMounted(async () => {
		// userStore.init();
		const stations = await stationStore.getStations(userStore.token);
		console.log(stations);
		if (!stations) {
			router.push({ path: "/" });
		}
	});

	const logout = () => {};
</script>
