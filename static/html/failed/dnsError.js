const errBaseImage = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyBjbGFzcz0iaWNvbiIgd2lkdGg9IjIwMHB4IiBoZWlnaHQ9IjEyMi45M3B4IiB2aWV3Qm94PSIwIDAgMTY2NiAxMDI0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTExNzQuMzM4MTIgMjc3LjEzNmwtMTAuNjU2IDYyLjkyOCAxMC42NTYgOTAuMDY0djc5Ljk2OGwtMTAuNjU2IDYxLjU4NC01LjMyOCA3My42MzItMTEuOTY4IDEzLjg3Mi0xMDcuODcyIDEyLjkxMi0zMC42NC0yMi43NjggMTEuODg4LTEwMy4wODggMTYuMDgtNzEuNjMyLTE2LjA2NC02Ni4yNzItMTEuODg4LTczLjYzMiAxMS44ODgtNTcuNTY4aDE1NC41NnogbS03NDUuNjY0IDBsMTAuNjU2IDYyLjkyOC0xMC42NTYgOTAuMDY0djc5Ljk2OGwxMC42NTYgNjEuNTg0IDUuMzI4IDczLjYzMiAxMS45NjggMTMuODcyIDEwNy44NzIgMTIuOTEyIDMwLjYyNC0yMi43NjgtMTEuODcyLTEwMy4wODgtMTYuMDgtNzEuNjMyIDE2LjA4LTY2LjI3MiAxMS44NzItNzMuNjMyLTExLjg3Mi01Ny41NjhINDI4LjY3MzEyeiIgIC8+PHBhdGggZD0iTTEyMDUuOTM4MTIgMC4wMTZIMzQ4Ljg2NjEyYy0zNC4zMiAwLjA5Ni02Mi4wOCAyOC4wOTYtNjIuMDQ4IDYyLjU5MnY1OTQuODY0YzAgMzQuNDggMjcuNzQ0IDYyLjQ4IDYyLjA0OCA2Mi41OTJoNDYuNjA4YTY2Ljc2NSA2Ni43NjUgMCAwIDAgMTUuNzc2IDI1LjYxNiAxNS4yIDE1LjIgMCAwIDAgNi45NiA0LjEyOGM3Ny43MTIgMjAuMzIgOTcuMDA4IDQ1LjU2OCAxMDEuNiA1OC43ODRhMzAuODk2IDMwLjg5NiAwIDAgMS0zLjg3MiAyNy4xNjggMTUuMDcyIDE1LjA3MiAwIDAgMCAyLjQ5NiAyMC45MjggMTQuNzIgMTQuNzIgMCAwIDAgMjAuOTEyLTIuNDE2IDYxLjIgNjEuMiAwIDAgMCA4LjgtNTQuODhjLTExLjA0LTMzLjE4NC01MC43ODQtNTkuMjgtMTE4LjEyOC03Ny41MDQtNS41ODQtNi43MDQtNy4yOTYtMTIuMjI0LTcuMjk2LTE2LjczNiAwLTYuMDE2IDMuNzkyLTEyLjAzMiAxMC41MTItMTcuMjQ4YTUyLjY0IDUyLjY0IDAgMCAxIDcuMTM2LTQuNTQ0bDEuNjMyLTAuODY0YTg1Ljk1MiA4NS45NTIgMCAwIDEgOS4zNzYtMy43MjggMTIzLjk4NCAxMjMuOTg0IDAgMCAxIDI5LjM0NC0yLjk0NGMyNS45ODQgMCA1Ni4zODQgNS4xNjggOTAuMTc2IDE1LjIgNS42NDggMi40OCAxMS4zNzYgNS4wNTYgMTcuMDA4IDguMTZhMTMyLjM5IDEzMi4zOSAwIDAgMSA1LjE4NCAyLjk0NCAyNzcuOTYyIDI3Ny45NjIgMCAwIDEgMjEuNTM2IDEzLjQ4OGMwLjYyNCAwLjQ0OCAxLjIxNiAwLjc1MiAxLjg1NiAxLjIgMTEzLjY5NiA4MC41MjggMTAwLjk5MiAxMjEuMTUyIDEwMS4wODggMTIxLjE1MmExNS4wNTYgMTUuMDU2IDAgMCAwIDAuMzUyIDE0LjczNmMyLjY4OCA0LjUxMiA3LjUyIDcuMjggMTIuNzUyIDcuMjhhMTQuNzIgMTQuNzIgMCAwIDAgMTMuMTM2LTguMDE2YzQuNjcyLTguOTEyIDIwLjI0LTUzLjg4OC03NC4wOC0xMzEuOTA0aDI2My4xMmMtOTQuMzM2IDc4LjA5Ni03OC44MTYgMTIzLjAwOC03NC4xNDQgMTMxLjkwNGExNS41MzYgMTUuNTM2IDAgMCAwIDEzLjY0OCA4LjI4OCAxNC43MDQgMTQuNzA0IDAgMCAwIDEzLjA1Ni0yMS40NzJjLTAuMTYtMC4zODQtMTMuNTA0LTQxLjAyNCAxMDAuNzA0LTEyMS45MzZhMjY5LjI4IDI2OS4yOCAwIDAgMSAyMy43NzYtMTQuOTQ0bDQuMzA0LTIuNDE2YzUuOTUyLTMuMTg0IDExLjgwOC01Ljg3MiAxNy42OC04LjQ2NCAzMy42OC05Ljk4NCA2NC0xNS4xMzYgODkuOTUyLTE1LjEzNmExMjUuNTUyIDEyNS41NTIgMCAwIDEgMjkuMjMyIDIuOTEyIDc3LjcxNyA3Ny43MTcgMCAwIDEgOS40NTYgMy43OTJjMC41NiAwLjI3MiAxLjA3MiAwLjU0NCAxLjYzMiAwLjc2OGE0OS43NjQgNDkuNzY0IDAgMCAxIDYuODMyIDQuMzM2bDAuMjU2IDAuMTkyYzYuOCA1LjIxNiAxMC41NiAxMS4yNjQgMTAuNTkyIDE3LjI5NnYwLjI0YzAgNC40NDgtMS44MDggOS45MzYtNy4zMTIgMTYuNTc2LTY3LjM3NiAxOC4yNC0xMDcuMDg4IDQ0LjMzNi0xMTguMTEyIDc3LjUwNGE2MS4wMjQgNjEuMDI0IDAgMCAwIDguOCA1NC44NDggMTQuODggMTQuODggMCAwIDAgMjUuNjY0LTMuNzI4IDE1LjA1NiAxNS4wNTYgMCAwIDAtMi4zODQtMTQuOTEyIDMwLjk0NCAzMC45NDQgMCAwIDEtMy45MDQtMjYuNjg4YzQuNC0xMy4zMTIgMjMuNTM2LTM4LjcyIDEwMS43MjgtNTkuMTg0YTE0LjY0IDE0LjY0IDAgMCAwIDYuOTkyLTQuMTQ0IDY2LjUyOCA2Ni41MjggMCAwIDAgMTUuNzkyLTI1Ljc2YzMzLjcyOC0wLjggNjAuNjU2LTI4LjUxMiA2MC42NTYtNjIuNDMyVjYyLjU5MmE2Mi42MDggNjIuNjA4IDAgMCAwLTE4LjA2NC00NC4yMDhBNjEuOTIgNjEuOTIgMCAwIDAgMTIwNS44MTAxMiAwbDAuMTI4IDAuMDE2ek01NzMuNzYyMTIgNTcyLjYyNGMxOC4zNTIgNDcuNzYgNy4wNTYgNzQuOTc2LTAuNjU2IDg2LjU0NC0xLjMyOC0wLjU0NC0yLjY0LTEuMDI0LTMuOTUyLTEuNTJhMjMzLjA0IDIzMy4wNCAwIDAgMC01MS4wODgtMTMuMjQ4Yy0xLjM5Mi0wLjE2LTIuOC0wLjM2OC00LjIwOC0wLjU2YTIwNC42MDggMjA0LjYwOCAwIDAgMC0yMi4xMjgtMS4zOTJjLTEuNjMyIDAtMy4xNTIgMC4wOC00Ljc1MiAwLjE2LTUuOTIgMC4xNDQtMTEuNjQ4IDAuNTc2LTE3LjEzNiAxLjI2NC0xLjQ0IDAuMTc2LTIuOTQ0IDAuMzA0LTQuMzY4IDAuNTI4LTEuMTUyIDAuMTc2LTIuMjI0IDAuNDgtMy4zNiAwLjY1NiA1LjItMjQuODMyIDguNjg4LTYxLjUzNi03LjUwNC04Ni4wOTYtMTcuMzYtMjYuNDQ4LTIxLjQwOC0xMDcuOTA0LTAuMzA0LTE2OS40MjQgOS4wNTYtMjYuNDk2LTEuODcyLTc0LjM2OC05LjYtMTAxLjcyOGgxMzIuMzA0YzUuNTg0IDE5LjgyNCAxNS4xMiA3MC4yMjQtNy4yNjQgMTMzLjgwOGwtMS42MzIgNC40NDhjLTEwLjg0OCAzMC40MzItMjQuMzY4IDY4LjMyIDUuNjQ4IDE0Ni41OTJ2LTAuMDMyeiBtNTc0LjQ5Ni0xMy43NDRjLTE2LjI0IDI0LjU5Mi0xMi43MiA2MS4yNjQtNy41NTIgODYuMTI4LTEuMTUyLTAuMjI0LTIuMjI0LTAuNTEyLTMuNDA4LTAuNjU2LTEuMTg0LTAuMTQ0LTEuOTY4LTAuMjA4LTIuOTkyLTAuMzUyYTE3MC4xOTIgMTcwLjE5MiAwIDAgMC0xOS4zNDQtMS40NGMtMC44OTYgMC0xLjc2LTAuMDgtMi42NC0wLjA4LTI0Ljg0OC0wLjEyOC01Mi45NiA0Ljg5Ni04Mi41OTIgMTYuNjg4LTcuNzI4LTExLjUyLTE5LjA0LTM4LjczNi0wLjY4OC04Ni41NDQgMzAuMDE2LTc4LjM4NCAxNi40NjQtMTE2LjIwOCA1LjU4NC0xNDYuNjcybC0xLjYzMi00LjM2OGMtMjIuNC02My42OC0xMi44MTYtMTEzLjk4NC03LjIzMi0xMzMuODA4aDEzMi4zNjhjLTcuNzYgMjcuMzYtMTguNzA0IDc1LjIxNi05LjYgMTAxLjcyOCAyMS4xMzYgNjEuNTUyIDE3LjA1NiAxNDMuMDQtMC4yNzIgMTY5LjM3NnpNMTIwNy4yMzMxMiA2OTBhNTEuMjQ4IDUxLjI0OCAwIDAgMC05LjYxNi0xNi41MTJjLTAuNjI0LTAuNjg4LTEuMzYtMS4zNDQtMS45ODQtMi4wMTZsLTAuNzM2LTAuNzJhNjMuNDcyIDYzLjQ3MiAwIDAgMC03LjM3Ni02LjUyOCA3Ni43MDQgNzYuNzA0IDAgMCAwLTkuMzkyLTYuMTkyYy0xLjAwOC0wLjU5Mi0xLjg3Mi0xLjI5Ni0yLjk2LTEuODU2LTAuMzItMC4xNzYtMC43MzYtMC4yNTYtMS4wNzItMC40NDhoLTAuMDhjLTUuNjQ4LTE5LjItMTQuMDMyLTYwLjYwOC0xLjA0LTgwLjE5MiAyNC43MzYtMzcuNTUyIDI2LjQzMi0xMjkuMTA0IDMuNjE2LTE5NS44MDgtNi4xNi0xNy45NjggMy40MjQtNjIuMTQ0IDEyLjUyOC05MS45MzZoNS44MjRjOC4wMzItMC4yNzIgMTQuNDE2LTYuODk2IDE0LjQxNi0xNC45NzZzLTYuMzg0LTE0LjcyLTE0LjQxNi0xNC45NzZoLTE5Mi42MDhhMTQuOCAxNC44IDAgMCAwLTEwLjUyOCA0LjQgMTUuMDcyIDE1LjA3MiAwIDAgMC00LjM1MiAxMC41OTIgMTQuODE2IDE0LjgxNiAwIDAgMCA4LjEyOCAxMy4yYy02LjY4OCAyNi43MzYtMTMuODU2IDc5LjQ3MiA5LjQyNCAxNDUuNjMybDEuNjMyIDQuNTQ0YzkuNzQ0IDI3LjA3MiAyMC42NTYgNTcuNzc2LTUuMzQ0IDEyNS42MzItMjEuMTIgNTQuOTYtMTAuMDQ4IDkwLjgxNiAxLjE4NCAxMTBhMzIwLjc2IDMyMC43NiAwIDAgMC0yOS45NjggMTguMjA4aC0zNDJjLTAuOTQ0LTAuNjcyLTEuOTA0LTEuMTItMi44OTYtMS43NmEyOTMuMDA4IDI5My4wMDggMCAwIDAtMjQuMzY4LTE0Ljg5NmMtMC45NzYtMC41MjgtMS45NjgtMS4yLTIuOTc2LTEuNzI4IDExLjI0OC0xOS4yMTYgMjIuMjg4LTU1LjA0IDEuMTg0LTEwOS45Mi0yNS45ODQtNjcuNzI4LTE1LjA1Ni05OC40LTUuNDA4LTEyNS41MmwxLjYzMi00LjU5MmMyMy4yOC02Ni4xNzYgMTYuMTEyLTExOC44OCA5LjQyNC0xNDUuNmExNC44OCAxNC44OCAwIDAgMC02LjcwNC0yOC4xOTJINDA3Ljc5MzEyYy04LjI0IDAtMTQuOTEyIDYuNzA0LTE0LjkxMiAxNC45OTJzNi42NzIgMTQuOTkyIDE0LjkxMiAxNC45OTJoNS44MDhjOS4wNzIgMjkuNzkyIDE4LjY3MiA3My45NjggMTIuNTQ0IDkxLjkzNi0yMi40NjQgNjUuNDU2LTIwLjcyIDE1OC43NjggMy42MTYgMTk1Ljc5MiAxMi44OCAxOS42IDQuNTQ0IDYxLjAwOC0xLjA3MiA4MC4xOTItMC4zNTIgMC4yMDgtMC44MzIgMC4zMi0xLjE4NCAwLjUxMi0xLjIgMC42MjQtMi4xNDQgMS4zNzYtMy4yNDggMi4wMTYtMi4yMjQgMS4zMTItNC4zNjggMi41NzYtNi4zNjggMy45ODRhNjguMzY4IDY4LjM2OCAwIDAgMC0xMC4wMTYgOC40NDhjLTAuMjg4IDAuMzA0LTAuNjI0IDAuNTkyLTAuOTEyIDAuOTEyLTAuNjI0IDAuNjI0LTEuMzYgMS4yNjQtMS45MzYgMS45MDRhNjIuMDE2IDYyLjAxNiAwIDAgMC00LjgxNiA2LjczNiA0OS41NTIgNDkuNTUyIDAgMCAwLTQuNzg0IDkuNzkyaC00Ni42MDhhMzIuNTc2IDMyLjU3NiAwIDAgMS0zMi4zMi0zMi42NTZ2LTU5NC44YzAtMTcuOTY4IDE0LjQ0OC0zMi41NzYgMzIuMzItMzIuNjU2aDg1Ny4xMDRjOC41OTIgMC4wMzIgMTYuODE2IDMuNDg4IDIyLjg4IDkuNnM5LjQ0IDE0LjQxNiA5LjQyNCAyMy4wNTZ2NTk0Ljg4QTMyLjQ4IDMyLjQ4IDAgMCAxIDEyMDcuMjMzMTIgNjkweiIgIC8+PHBhdGggZD0iTTg4NC4wMDIxMiA1NjkuNzZjMTAuOTEyIDEwLjYwOC04LjMzNiAyMi40OC0xMi44NjQgMTYuMzM2YTEyMi4xOTIgMTIyLjE5MiAwIDAgMC05Ni4xNDQtNDcuMmMtMzcuMTA0IDAtNjkuNjQ4IDE2LjczNi05Mi4zNTIgNDMuMzkyLTYuMDY0IDYuMDk2LTIxLjEyLTcuODU2LTEyLjg2NC0xNy45NjhhMTM0Ljg4IDEzNC44OCAwIDAgMSAxMDUuMjMyLTQ5LjQ4OGM0My44NTYgMCA4NC4wMzIgMjIuMDggMTA5LjAyNCA1NC44bC0wLjAzMiAwLjEyOHoiICAvPjxwYXRoIGQ9Ik0zMzguNzcwMTIgOTYxLjc5MmMwIDM0LjI4OCAxOTYuMzUyIDYyLjE5MiA0MzguNTQ0IDYyLjE5MnM0MzguNTQ0LTI3Ljc2IDQzOC41NDQtNjIuMTkyUzEwMTkuNTA2MTIgODk5LjYgNzc3LjMxMzEyIDg5OS42cy00MzguNTQ0IDI3Ljc3Ni00MzguNTQ0IDYyLjE5MnoiICAvPjxwYXRoIGQ9Ik0xNDc1LjM0NjEyIDY4Mi4yNTZjMCAxMC4yNCA2Ljg0OCAxOS4yIDE2LjY3MiAyMS44NGEyMi40MzIgMjIuNDMyIDAgMCAwIDI1LjI5Ni0xMC41NDQgMjIuNzA0IDIyLjcwNCAwIDAgMC0zLjU2OC0yNy4yOTYgMjIuNCAyMi40IDAgMCAwLTI3LjE1Mi0zLjYgMjIuNjM4IDIyLjYzOCAwIDAgMC0xMS4yNDggMTkuNk0xOS4wNTgxMiA0NjEuNzkySDIuMTc4MTJhMTYuODMyIDE2LjgzMiAwIDEgMCAzMS40ODggOC40NjRjMy44MDgtNi42NTYgMi43MDQtMTUuMDU2LTIuNjg4LTIwLjQ4cy0xMy43Ni02LjUyOC0yMC4zNjgtMi42ODhjLTUuMjE2IDMuMDI0LTguNDMyIDguNjQtOC40MzIgMTQuNzA0bTE0MDUuNjk2IDc5LjE1MmMwLTIxLjg1Ni0xNy42MTYtMzkuNTY4LTM5LjM2LTM5LjU2OHMtMzkuMzYgMTcuNzEyLTM5LjM2IDM5LjU2OCAxNy42MTYgMzkuNTY4IDM5LjM2IDM5LjU2OGEzOS45NjggMzkuOTY4IDAgMCAwIDM5LjM2LTM5LjU2OHogbS0xMDEuMjE2IDBjMC0zNC4zMzYgMjcuNjk2LTYyLjE5MiA2MS44NTYtNjIuMTkyczYxLjg1NiAyNy44NCA2MS44NTYgNjIuMTkyLTI3LjY5NiA2Mi4xOTItNjEuODU2IDYyLjE5MmMtMzQuMDMyLTAuMzItNjEuNTUyLTI3Ljk4NC02MS44NTYtNjIuMTkyeiBtMTQ2LjE5Mi00MjkuNjQ4YzAtMTYtOS41ODQtMzAuNDMyLTI0LjI4OC0zNi41Ni0xNC43MDQtNi4xMjgtMzEuNjMyLTIuNzM2LTQyLjg5NiA4LjU3NnMtMTQuNjI0IDI4LjMzNi04LjUyOCA0My4xMiAyMC40NDggMjQuNDMyIDM2LjM1MiAyNC40MzJhMzkuOTY4IDM5Ljk2OCAwIDAgMCAzOS4zNi0zOS41Njh6IG0tNTYuMjQgMGExNi44MzIgMTYuODMyIDAgMSAxIDI4LjgtMTIuMDE2YzQuODMyIDQuODQ4IDYuMjcyIDEyLjE0NCAzLjY2NCAxOC40OTZhMTYuODk2IDE2Ljg5NiAwIDAgMS0xNS42IDEwLjQ4IDE3LjM0NCAxNy4zNDQgMCAwIDEtMTYuODgtMTYuOTZ6TTE2MDkuMTUzMTIgMzk4LjQ4aC0xOS4xMmExMi40MTYgMTIuNDE2IDAgMCAwLTExLjkzNiAxMi40MzJjMCA2LjcwNCA1LjI2NCAxMi4xOTIgMTEuOTM2IDEyLjQzMmgxOS4xMnYxOS4yMTZjMC4yNCA2LjY4OCA1LjcxMiAxMiAxMi4zNjggMTJhMTIuNCAxMi40IDAgMCAwIDEyLjM2OC0xMnYtMTkuMjE2aDE5LjEyYTEyLjM2OCAxMi4zNjggMCAwIDAgMTEuMDg4LTYuMDggMTIuNTQ0IDEyLjU0NCAwIDAgMCAwLTEyLjcwNCAxMi4zMiAxMi4zMiAwIDAgMC0xMS4wODgtNi4wOGgtMTkuMTJ2LTE5LjIxNmExMi4zNTIgMTIuMzUyIDAgMSAwLTI0LjczNiAwdjE5LjIxNnpNMjM4LjMzODEyIDc5NS4zMjhIMjA0LjU5MzEyYTExLjI5NiAxMS4yOTYgMCAwIDAtMTEuMjMyIDExLjI5NiAxMC43MzYgMTAuNzM2IDAgMCAwIDMuMDg4IDguMTkyIDEwLjU2IDEwLjU2IDAgMCAwIDguMTQ0IDMuMTA0aDMzLjc0NHYzMy45MmMwLjAxNiA2LjI0IDUuMDQgMTEuMjggMTEuMjMyIDExLjI5NmExMC41OTIgMTAuNTkyIDAgMCAwIDExLjIzMi0xMS4yOTZ2LTMzLjkyaDMzLjcxMmExMS4yOTYgMTEuMjk2IDAgMCAwIDExLjIzMi0xMS4yOTYgMTAuNzM2IDEwLjczNiAwIDAgMC0zLjA4OC04LjE5MiAxMC41NiAxMC41NiAwIDAgMC04LjE0NC0zLjEwNGgtMzMuNzEydi0zMy45MmExMS4yOTYgMTEuMjk2IDAgMCAwLTExLjIzMi0xMS4yOTYgMTAuNTkyIDEwLjU5MiAwIDAgMC0xMS4yMzIgMTEuMjk2djMzLjkyeiIgIC8+PC9zdmc+'
const DEFAULT_TITLE = 'Sorry, something went wrong on the page.'
const DEFAULT_NOTE = 'Could not open address from';
const TITLE_BY_ERROR_CODE = {
  '56013': 'Sorry, there is not enough SAVE in your channel to access this site. Please transfer SAVE and try again.',
  '56012': 'Sorry, no valid channels were found. Please re-attempt to visit this site after creating a new channel. ',
  '55016': 'Oops, the page you visited does not exist.'
}
module.exports = function ({
  url = '',
  errorCode = DEFAULT_TITLE,
  note = DEFAULT_NOTE,
  errorType = 0
}) {
  return `<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
  </head>
  <style>
    body {
      color:gray;
      text-align: center;
      display: flex;
      justify-content: center;
      margin: 14vh auto 0;
      max-width: 600px;
      width: 100%;
    }
    h2{
      color:#000;
    }
    .primary{
      display: inline-block;
      color: #fff;
      background: #2F8FF0;
      border: none;
      padding: 0 25px;
      min-width: 80px;
      height: 33px;
      line-height:33px;
      text-decoration: none;
      background: linear-gradient(90deg, rgba(19, 175, 250, 1) 0%, rgba(62, 126, 235, 1) 100%);
      box-shadow: 0px 4px 6px 0px rgba(111, 139, 173, 0.21);
      border-radius: 16px;
    }
    .primary:hover{
      opacity: .7;
    }
  </style>
  <body>
    <div>
    <img style="opacity:0.5" src="${errBaseImage}" alt="">
      <h3>${TITLE_BY_ERROR_CODE[errorCode] || (errorCode)}</h3>
      <p>${note} ${url} </p>
      ${errorType===1? '<a class="primary addChannel" onclick="Seek.openChannel(1)">Add Channel</a>' :''}
      <a class="primary" href="javascript:window.location.reload()">Reload</a>
    </div>
  </body> 
  <script type="text/javascript">
  </script>
  </html>`.replace(/\n/g, '')
}