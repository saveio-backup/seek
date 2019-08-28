<template>
	<div class="markdown">
		<div v-html="mdHtml"></div>
	</div>
</template>

<script>
import fs from "fs";
import marked from "marked";
import hljs from "highlight.js";
import javascript from "highlight.js/lib/languages/javascript";
import "highlight.js/styles/monokai-sublime.css";
import http from "http";

export default {
	name: "Markdown",
	data() {
		return {
			url: "",
			mdHtml: ""
		};
	},
	methods: {
		readFile() {
			if (this.url.startsWith("http")) {
				http.get(this.url, response => {
					response.setEncoding("utf-8"); //二进制binary
					var Data = "";
					response
						.on("data", data => {
							//加载到内存
							Data += data;
						})
						.on("end", () => {
							this.toRendMd(Data);
						});
				});
			} else {
				fs.readFile(this.url, "utf8", (err, data) => {
					if (err) {
						console.dir(err);
						return;
					}
					this.toRendMd(data);
				});
			}
		},
		toRendMd(data) {
			marked.setOptions({
				renderer: new marked.Renderer(),
				highlight: function(data) {
					return hljs.highlightAuto(data).value;
				},
				pedantic: false,
				gfm: true,
				tables: true,
				breaks: false,
				sanitize: false,
				smartLists: true,
				smartypants: false,
				xhtml: false
			});
			this.mdHtml = marked(data);
		},
		init() {
			// change tab title
			this.url = this.$route.query.url;
			let index = this.url.lastIndexOf("\\");
			let name = this.url.slice(index + 1);
			document.title = name;
		}
	},
	mounted() {
		this.init();
		this.readFile();
	}
};
</script>
<style lang="scss" scope>
$black: #000000;
$border-radius: 5px;
$spacer-3: 3px;
$gray-100: rgb(200, 200, 200);
.markdown {
	font-size: initial;
	width: 100%;
	height: 100%;
	font-size: 16px;
	overflow-y: auto;
	background: white;

	& > div {
		margin: 0 auto;
		max-width: 1300px;
		width: 100%;

		// reset markdown style
		font-family: "ubuntu", "Tahoma", "Microsoft YaHei", arial, sans-serif;
		color: #444444;
		line-height: 1;
		padding: 0px;

		img {
			max-width: 100%;
		}

		h1,
		h2,
		h3,
		h4 {
			color: #111111;
			font-weight: 400;
			margin-top: 1em;
		}

		h1,
		h2,
		h3,
		h4,
		h5 {
			font-family: Georgia, Palatino, serif;
		}
		
		h1,
		h2,
		h3,
		h4,
		h5,
		dl {
			margin-bottom: 16px;
			padding: 0;
		}

		p {
			margin-top: 8px;
			margin-bottom: 3px;
		}
		h1 {
			font-size: 48px;
			line-height: 54px;
		}
		h2 {
			font-size: 36px;
			line-height: 42px;
		}
		h1,
		h2 {
			border-bottom: 1px solid #efeaea;
			padding-bottom: 10px;
		}
		h3 {
			font-size: 24px;
			line-height: 30px;
		}
		h4 {
			font-size: 21px;
			line-height: 26px;
		}
		h5 {
			font-size: 18px;
			line-height: 23px;
		}
		a {
			color: #0099ff;
			margin: 0 2px;
			padding: 0;
			vertical-align: baseline;
			text-decoration: none;
		}
		a:hover {
			text-decoration: none;
			color: #ff6600;
		}
		a:visited {
			color: purple;
		}
		ul,
		ol {
			padding: 0;
			padding-left: 18px;
			margin: 0;
			list-style: initial;
		}
		ol  {
			list-style: decimal;
		}
		li {
			line-height: 24px;
		}
		p,
		ul,
		ol {
			font-size: 16px;
			line-height: 24px;
		}

		ol ol,
		ul ol {
			list-style-type: lower-roman;
		}

		code {
			font-family: Consolas, Monaco, Andale Mono, monospace;
			margin: 0 2px;
		}

		pre {
			line-height: 1.7em;
			padding: 6px 10px;
		}

		pre > code {
			line-height: 1.6em;
			font-size: 0.95em;
			white-space: pre;
		}

		aside {
			display: block;
			float: right;
			width: 390px;
		}
		blockquote {
			border-left: 0.5em solid #eee;
			padding: 0 0 0 2em;
			margin-left: 0;
		}
		blockquote cite {
			font-size: 14px;
			line-height: 20px;
			color: #bfbfbf;
		}
		blockquote cite:before {
			content: "\2014 \00A0";
		}

		blockquote p {
			color: #666;
		}
		hr {
			text-align: left;
			color: #999;
			height: 2px;
			padding: 0;
			margin: 16px 0;
			background-color: #e7e7e7;
			border: 0 none;
		}

		dl {
			padding: 0;
		}

		dl dt {
			padding: 10px 0;
			margin-top: 16px;
			font-size: 1em;
			font-style: italic;
			font-weight: bold;
		}

		dl dd {
			padding: 0 16px;
			margin-bottom: 16px;
		}

		dd {
			margin-left: 0;
		}
		//table
		table {
			width: 100%; /*表格宽度*/
			max-width: 65em; /*表格最大宽度，避免表格过宽*/
			border: 1px solid #dedede; /*表格外边框设置*/
			margin-top: 15px; /*外边距*/
			margin-bottom: 15px; /*外边距*/
			border-collapse: collapse; /*使用单一线条的边框*/
			empty-cells: show; /*单元格无内容依旧绘制边框*/
		}

		table th,
		table td {
			height: 35px; /*统一每一行的默认高度*/
			border: 1px solid #dedede; /*内部边框样式*/
			padding: 0 10px; /*内边距*/
		}

		table th {
			font-weight: bold; /*加粗*/
			text-align: center !important; /*内容居中，加上 !important 避免被 Markdown 样式覆盖*/
			background: rgba(158, 188, 226, 0.2); /*背景色*/
		}

		table th {
			white-space: nowrap; /*表头内容强制在一行显示*/
		}

		table tbody tr:nth-child(2n) {
			background: rgba(158, 188, 226, 0.12);
		}

		table td:nth-child(1) {
			white-space: nowrap;
		}

		//源代码
		.hljs {
			font-family: Menlo, Consolas, Courier New, Courier, FreeMono, monospace;
			display: block;
			overflow-y: hidden;
			overflow-x: auto;
			padding: 1em;
			color: #b4bbc9;
			background: #292c34;
			border-radius: 4px;
		}
		//修改为
		pre {
			font-family: Menlo, Consolas, Courier New, Courier, FreeMono, monospace;
			display: block;
			overflow-y: hidden;
			overflow-x: auto;
			padding: 1em;
			color: #b4bbc9;
			background: #292c34;
			border-radius: 4px;
		}
	}
}
</style>