<template>
	<div id="history" class="theme-font-color">
		<div
			class="card-container"
			v-for="(dayTimestamp,index) in list['allTimestampKeyList']"
			:key="dayTimestamp + index"
		>
			<div class="card-title">
				{{$dateFormat.formatYearMonthDayByTimestamp(dayTimestamp*86400000)}}
			</div>
			<div
				class="item-container"
				v-for="(item,index2) in list[dayTimestamp]"
				:key="item.id + index2"
			>
				<div
					class="item-container-time"
					:title="$dateFormat.formatTimeByTimestamp(item.timestamp)"
				>
					{{$dateFormat.formatTimeByTimestamp(item.timestamp)}}
				</div>
				<div class="item-container-img">
					<img
						v-show="item.src"
						:src="item.src"
						height="18"
						alt=""
						class="item-container-icon"
						@error="item.src = false;$forceUpdate()"
					>
					<span
						v-show="!item.src"
						class="el-icon-link ftpx20"
					></span>
				</div>
				<div class="item-container-name">
					<a
						@click="openPage(item.href)"
						:title="`${item.title} -- ${item.href}`"
					>
						{{item.title}}
					</a>
				</div>
				<div class="item-container-host">
					{{url.parse(item.href).protocol + '//' + url.parse(item.href).hostname}}
				</div>
			</div>
		</div>
		<div class="list-loading ft14 grey-xs">
			<span v-if="loading && !isAll">
				{{$t('history.loading')}}
				<i class="el-icon-loading"></i>
			</span>
			<span v-if="isAll">{{$t('history.noLoadingContent')}}</span>
		</div>
	</div>
</template>

<script>
import { ipcRenderer, remote } from "electron";
import { DEFAULT_URL } from "./../../../main/windowManager/defaultOption";
import url from "url";
export default {
	name: "history",
	data() {
		return {
			url,
			list: {
				allTimestampKeyList: []
			},
			timezoneOffset: new Date().getTimezoneOffset() * 60000,
			offset: 0,
			limit: 100,
			loading: false,
			isAll: false,
			defautImageSrc: DEFAULT_URL + "/static/images/logo/save.png"
		};
	},
	methods: {
		init() {
			const vm = this;
			vm.getList({ offset: vm.offset, limit: vm.limit });
		},
		getList({ offset, limit }) {
			const vm = this;
			if (this.isAll) return;
			vm.loading = true;

			const list = ipcRenderer.sendSync("getListHistory", {
				offset: offset,
				limit: limit
			});
			console.log(list);

			for (let i = 0; i < list.length; i++) {
				let prexTimestamp;
				if (i === 0) {
					let allTimestampKeyList = vm.list["allTimestampKeyList"] || [];
					prexTimestamp = allTimestampKeyList[allTimestampKeyList.length - 1];
				} else {
					// prexTimestamp = Math.ceil((list[i - 1].timestamp)/86400000);
					prexTimestamp = parseInt(
						(list[i - 1].timestamp - this.timezoneOffset) / 86400000
					);
				}
				// let currentTimestamp = Math.ceil((list[i].timestamp)/86400000);
				let currentTimestamp = parseInt(
					(list[i].timestamp - this.timezoneOffset) / 86400000
				);

				if (prexTimestamp != currentTimestamp) {
					vm.list[currentTimestamp] = [];
					vm.list["allTimestampKeyList"].push(currentTimestamp);
				}

				vm.list[currentTimestamp].push(list[i]);
			}

			if (list.length < this.limit) {
				this.isAll = true;
			} else {
				this.offset = this.offset + this.limit;
			}
			this.loading = false;
		},
		scrollInit() {
			const scrollTop =
				document.documentElement.scrollTop || document.body.scrollTop;
			// scrollTop滚动条的垂直位置，innerheight	返回窗口的文档显示区的高度。
			const bottomwindow =
				scrollTop + window.innerHeight + 5 >
				document.getElementById("app").offsetHeight;
			if (bottomwindow && !this.loading && !this.isAll) {
				this.getList({ offset: this.offset, limit: this.limit });
			}
		},
		openPage(href) {
			if (href.startsWith("seek://")) {
				let path = href.slice(7);
				let activeView = (remote.getCurrentWindow().views || []).find(
					view => view.isActive
				);
				activeView.openComponent(path);
			} else {
				window.open(href);
			}
		}
	},
	computed: {
		lang() {
			return this.$i18n.locale;
		}
	},
	watch: {
		lang() {
			document.title = this.$t("history.historyRecord");
		}
	},
	mounted() {
		document.title = this.$t("history.historyRecord");
		this.init();
		document.addEventListener("scroll", this.scrollInit);
	},
	beforeDestroy() {
		document.removeEventListener("scroll", this.scrollInit);
	}
};
</script>

<style lang="scss">
#history {
	padding: 10px 0px;
	min-height: 100%;
	.card-container {
		@include themify {
			background-color: $card-color;
			box-shadow: $card-shadow;
		}
		border-radius: 6px;
		padding: 0 30px;
		width: 900px;
		margin: 0px auto;

		.card-title {
			font-size: 20px;
			height: 60px;
			align-items: center;
			border-bottom: 1px solid rgba(47, 163, 240, 0.2);
			display: flex;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			color: #2f8ff0;
		}

		.item-container {
			font-size: 12px;
			height: 60px;
			padding-top: 8px;
			padding-left: 30px;
			display: flex;
      border-bottom: 1px solid;
      @include themify{
        border-color:$table-border-color;
      }
			padding: 20px 0;

			& > .item-container-time {
				width: 200px;
				display: inline-block;
				font-size: 12px;
			}

			& > .item-container-img {
				margin: 0 20px;
				width: 30px;
			}

			& > .item-container-name {
				width: 500px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				padding: 0 20px;

				a {
					cursor: pointer;

					&:hover {
						color: #2f8ff0;
					}

					&:active {
						opacity: 0.7;
					}
				}
			}

			& > .item-container-host {
				width: 200px;
				text-align: right;
				font-size: 13px;
				opacity: 0.7;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
		}
	}
	.list-loading {
		width: 900px;
		margin: 10px auto 5px;
		height: 22px;
		text-align: center;
	}
}
</style>

