<template>
	<div id="menu-dialog">
		<export-private-key></export-private-key>
		<logout></logout>
	</div>
</template>
<script>
import ExportPrivateKey from "./Dialog/ExportPrivateKey.vue";
import Logout from "./Dialog/Logout.vue";
export default {
	components: {
		ExportPrivateKey,
		Logout
	},
	data() {
		return {};
	}
};
</script>