<template>
	<div id="settings">
		<div class="settings-content">
			<div class="settings-box">
				<div class="ft20">Setting</div>
				<!-- <p class="active-blue ft14">Clear browsing data</p> -->
			</div>
			<div class="settings-box">
				<div class="tag">
					<span>Chain Environment</span>
					<div class="dark-grey">Select chain environment</div>
				</div>
				<el-select
					v-model="settings.ChainId"
					@change="switchChainId(settings.ChainId)"
				>
					<el-option
						v-for="(item,index) in netConfig.list"
						:key="index"
						:label="netConfig.default[item] ||'Private'+' (' + item +')'"
						:value="item"
					></el-option>
				</el-select>
			</div>
			<div class="settings-box">
				<div class="tag">Auto openDevTools</div>
				<el-select
					v-model="settings.console"
					@change="updateSettings('console',settings.console)"
				>
					<el-option
						label="Open"
						:value="true"
					></el-option>
					<el-option
						label="Close"
						:value="false"
					></el-option>
				</el-select>
			</div>
		</div>
	</div>
</template>
<script>
import { ipcRenderer } from "electron";
import { DEFAULT_CHAINID } from "../../main/windowManager/defaultOption";
export default {
	mounted() {
		document.title = "Settings";
		this.getSettingsAll();
		this.getChainList();
		this.getChainId();
	},
	data() {
		return {
			switchToggle: {
				console: true
			},
			settings: {},
			netConfig: {
				list: [],
				default: {
					"0": "DevNet",
					"1": "TestNet",
					"2": "MainNet"
				}
			}
		};
	},
	methods: {
		getSettingsAll() {
			this.settings = ipcRenderer.sendSync("getAllSettings");
		},
		updateSettings(key, value) {
			try {
				const result = ipcRenderer.sendSync("updateSettings", key, value);
			} catch (error) {}
		},
		getChainList() {
			this.$axios.get(this.$api.getchainidlist).then(res => {
				if (res.Error === 0) {
					this.netConfig.list = res.Result.Ids;
				}
			});
		},
		getChainId() {
			this.$axios.get(this.$api.chainId).then(res => {
				if (res.Error === 0) {
					if (res.Result.ChainId) {
						this.updateSettings("ChainId", res.Result.ChainId);
						this.settings.ChainId = res.Result.ChainId;
					} else {
						this.switchChainId(DEFAULT_CHAINID);
					}
				} else {
					if (res.Error !== 40007) {
						this.$message.error(
							this.$i18n.error[res.Error]
								? this.$i18n.error[res.Error][this.$language]
								: `error code is ${res.Error}`
						);
					}
				}
			});
		},
		switchChainId(id) {
			console.log("switch chainid", id);
			this.$axios.post(this.$api.switchChainId, { ChainId: id }).then(res => {
				if (res.Error === 0) {
					this.updateSettings("ChainId", id);
					this.settings.ChainId = id;
					this.$message({
						message: "Switch Success",
						type: "success"
					});
				} else {
					this.$message.error(
						this.$i18n.error[res.Error]
							? this.$i18n.error[res.Error][this.$language]
							: `error code is ${res.Error}`
					);
				}
			});
		}
	}
};
</script>
<style lang="scss">
#settings {
	padding-top: 20px;
	.settings-content {
		width: 60%;
		margin: 0px auto 0px;
		.settings-box {
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-bottom: solid 1px rgba(125, 125, 125, 0.1);
			padding: 20px 0px;
			.tag {
				font-size: 14px;
			}
			.el-select {
				input {
					width: 200px;
					border: 1px solid rgba(4, 15, 57, 0.2);
					border-radius: 2px;
					// color: rgba(32, 32, 32, 0.4);
					color: rgba(32, 32, 32, 0.7);
				}
			}
		}
	}
}
</style>