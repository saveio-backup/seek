<template>
	<div id="orderpay">
		<div class="orderpay-content">
			<div class="ft24 orderpay-title">Confirm Transaction</div>
			<div class="transfer-user">
				<div class="transfer-from">
					<p class="name-wrapper">
						{{from.name[0].toUpperCase()}}
					</p>
					<p class="name-text">
						{{from.name}}
					</p>
				</div>
				<div class="transfer-amount">
					<p class="amount-text">200.00 ONI</p>
					<i class="transfer-arrow ofont ofont-transfer_right"></i>
				</div>
				<div class="transfer-from">
					<p class="name-wrapper">
						A
					</p>
					<p class="name-text">
						A channel
					</p>
				</div>
			</div>
			<div class="contract-text">
				CONTRACT INTERACTION
			</div>
			<div class="transfer-meta">
				<div class="transfer-meta-choose">
					<p>Details</p>
					<p>Data</p>
				</div>
				<div class="transfer-meta-box">
					<div class="flex">
						<p class="flex1">From</p>
						<p class="flex1">{{from.name}}</p>
						<p class="flex1">{{from.addr}}</p>
					</div>
					<div class="flex">
						<p>To</p>
						<p>{{to.name}}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<script>
export default {
	data() {
		return {
			from: {
				name: "Songpu",
				addr: "SSAdXUSUUDjhsbvxFXYtuYbjhshgxfYZxSHJZbxh"
			},
			to: {
				name: "A channel",
				addr: "0xe2e5fe7ywwfs3j4h4ivcdro4f9gfr5e410fv4ssa"
			}
		};
	}
};
</script>
<style lang="scss" scoped>
#orderpay {
	.orderpay-content {
		width: 60%;
		padding-top: 60px;
		margin: 0px auto 0px;
		.orderpay-title {
			text-align: center;
			padding-bottom: 30px;
			border-bottom: solid 1px rgba(125, 125, 125, 0.1);
		}
		.transfer-user {
			display: flex;
			max-width: 600px;
			margin: 20px auto 0;
			justify-content: space-between;
			.name-wrapper {
				width: 80px;
				height: 80px;
				line-height: 80px;
				background: #ccc;
				color: #fff;
				border-radius: 50%;
				text-align: center;
			}
			.name-text {
				margin-top: 5px;
			}
		}
		.transfer-amount {
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			align-items: center;
			.amount-text {
				margin-top: 30px;
			}
		}
		.contract-text {
			max-width: 600px;
			margin: 10px auto 0;
			background: rgba(237, 239, 244, 1);
			text-align: center;
			border-radius: 13px;
			padding: 5px 0;
			font-size: 15px;
		}
		.transfer-meta-choose {
			display: flex;
		}
		.transfer-meta-box {
			background: rgba(237, 239, 244, 1);
		}
	}
}
</style>