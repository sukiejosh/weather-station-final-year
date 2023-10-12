<template>
	<el-config-provider namespace="ep">
		<BaseHeader />
		<div class="flex w-full main-container">
			<BaseSide class="hidden md:block" />
			<div class="flex w-full p-4">
				<!-- <Stats2 /> -->
				<router-view />
			</div>
		</div>
	</el-config-provider>
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
	import { useRouter } from "vue-router";
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
			localStorage.removeItem("weather_app_user");
			router.push({ path: "/login" });
		}
	});

	const logout = () => {};
</script>
