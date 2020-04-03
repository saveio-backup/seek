<template>
	<div class="decode-file">
		<el-dialog
			center
			width='600px'
			:before-close="closeDialog"
			:close-on-click-modal='false'
			:visible.sync="decodeFileToggle"
		>
			<div slot="title">
				<h2>{{decodeDone ?$t('dialog.openFile') : $t('dialog.decodeFile')}}</h2>
				<div class="dialog-title-border"></div>
			</div>
			<div v-if="!decodeDone" class="decode-file-wrapper loading-content decode-file-loading">
				<div>
					<p class="mt20 ft14 tl">{{$t('dialog.filePath')}}: </p>
					<p class="grey-color mb20  ft14 tl break-word">{{path}} {{$t('dialog.file')}}</p>
				</div>
				<el-form
					class="mb90"
					ref="dialogForm"
					:model="dialogForm"
					:rules="dialogRules"
					@submit.native.prevent
				>
					<el-form-item
						class="theme-font-blue-bold"
						:label="$t('dialog.filePassword')"
						prop="password"
					>
						<el-input
							v-model="dialogForm.password"
							:placeholder="$t('dialog.pleaseInputFilePasswordPassword')"
							class="grey-theme"
							@keyup.enter.native='decodeFile'
							show-password
							type="password"
						></el-input>
					</el-form-item>
				</el-form>
				<div slot="footer">
					<ripper-button @click="closeDialog">{{$t('public.cancel')}}</ripper-button>
					<ripper-button
						type="primary"
						class="primary ml10"
						@click="decodeFile"
					>{{$t('dialog.decodes')}}</ripper-button>
				</div>
			</div>
			<div class="text-center open-decode-file-wrapper" v-else>
				<div>
					<p class="mt20 ft14 tl">
						{{$t('dialog.fileAddr')}}:
					</p>
					<p class="mb50 ft14 tl grey-color">
					 {{decodePath}}
					</p>
				</div>
				<div slot="footer">
					<ripper-button @click="closeDialog">{{$t('public.cancel')}}</ripper-button>
					<ripper-button
						type="primary"
						class="primary ml10"
						@click="goDecodeFile"
					>{{$t('dialog.openFile')}}</ripper-button>
				</div>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { ipcRenderer, dialog, remote, shell } from "electron";
export default {
	name: 'DecodeFile',
	props: {
		path: {
			default: '',
			type: String
		}
	},
  data() {
    return {
      decodeFileToggle: false,
			decodeFiling: null,
			dialogForm: {
				password: ""
			},
			decodeDone: false,
			decodePath: '',
			dialogRules: {
				password: [
					{
						required: true,
						message: this.$t('public.pleaseFillPassword'),
						trigger: "blur"
					}
				]
			},
    }
  },
  methods: {
		goDecodeFile() {
			shell.openItem(this.decodePath);
			this.closeDialog();
		},
    decodeFile() {
			const vm = this;
			vm.decodeFiling = vm.$loading({
				text: vm.$t('dialog.decoding'),
				target: ".loading-content.decode-file-loading",
        lock: true
			});
			this.$axios.post(this.$api.decrypt, {
				Password: vm.dialogForm.password,
				Path: vm.path
			}).then(res => {
				vm.decodeFiling && vm.decodeFiling.close();
				if(res.Error === 0) {
					vm.$message.success(vm.$t('dialog.decodeSuccess'));
					vm.decodeDone = true;
					vm.decodePath = res.Result.Path;
				} else {
					vm.$message.error(vm.$t(`error["${res.Error}"]`));
				}
			}).catch(err => {
				vm.decodeFiling && vm.decodeFiling.close();
				if (err.message.includes("timeout")) {
					vm.$message.error("Request Timeout!");
				}
			})
    },
    closeDialog() {
			this.$parent.decodeFilePath = '';
			this.$emit("closeDialog", { timeout: 0 });
		}
	},
	watch: {
		lang() {
			this.dialogRules = {
				password: [
					{
						required: true,
						message: this.$t('public.pleaseFillPassword'),
						trigger: "blur"
					}
				]
			}
		},
		path() {
			this.decodeDone = false;
			this.decodePath = '';
		}
	},
	computed: {
		lang() {
			return this.$i18n.locale;
		}
	},
	mounted() {
		this.decodeDone = false;
		this.decodePath = '';
		this.decodeFileToggle = true;
	}
}
</script>
<style lang="scss">
.decode-file {
	width: 100%;
	height: 100%;
	.decode-file-wrapper {
		width: 440px;
		margin: 0 auto;
	}
	.open-decode-file-wrapper {
		width: 440px;
		margin: 0 auto;
	}
}
</style>