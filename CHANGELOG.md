# Changelog

## [1.0.2](https://github.com/jaetill/splendor/compare/v1.0.1...v1.0.2) (2026-06-24)


### Bug Fixes

* **ci:** drop unused IMPLEMENTER_PAT forwarding from implementer caller (refs [#363](https://github.com/jaetill/splendor/issues/363)) ([#53](https://github.com/jaetill/splendor/issues/53)) ([12b17b0](https://github.com/jaetill/splendor/commit/12b17b06b9837fdc1bfb1be64fb384298c0c4e2b))

## [1.0.1](https://github.com/jaetill/splendor/compare/v1.0.0...v1.0.1) (2026-06-18)


### Bug Fixes

* **app:** add CSP and referrer-policy meta security headers ([#24](https://github.com/jaetill/splendor/issues/24)) ([#38](https://github.com/jaetill/splendor/issues/38)) ([6834195](https://github.com/jaetill/splendor/commit/6834195d0c1b02eabc6d0f6aa710a373e98d0e8c))
* **ci:** document that issues: write is intentionally absent ([#49](https://github.com/jaetill/splendor/issues/49)) ([#51](https://github.com/jaetill/splendor/issues/51)) ([a8a42a7](https://github.com/jaetill/splendor/commit/a8a42a7c4918e8f05b99722f23b4b720ebe57c6b))
* **ci:** scope reusable secrets explicitly (ADR-0048) ([#52](https://github.com/jaetill/splendor/issues/52)) ([cdbdb10](https://github.com/jaetill/splendor/commit/cdbdb1003d2fbe7381d791204ef71121d51b3d6e))

## 1.0.0 (2026-05-25)


### Features

* adopt Agentic Dev Environment platform (Phase 1+2) ([b98681f](https://github.com/jaetill/splendor/commit/b98681f903d8547aab91e8da14533f3f10311f25))
* adopt Agentic Dev Environment platform (Phase 1+2) ([b581b50](https://github.com/jaetill/splendor/commit/b581b50226d42e0aed2d52c8a138a1a3a349602c))
* adopt CI workflows (Phase 4 of platform adoption) ([7c77c5a](https://github.com/jaetill/splendor/commit/7c77c5aea11cd9b5bbc760e784571cf90359052b))
* adopt CI workflows (Phase 4 of platform adoption) ([9a3da01](https://github.com/jaetill/splendor/commit/9a3da014d3ea3aa6fb08e7486f1c7be6156698f7))
* **ci:** migrate claude-pr-review to platform reusable (ADR-0018) ([bcc6c15](https://github.com/jaetill/splendor/commit/bcc6c15f8f7aaae2ac1af1d2932415c1af825028))
* **observability:** phase 5 - sentry browser sdk + release tagging ([#4](https://github.com/jaetill/splendor/issues/4)) ([a5bedc9](https://github.com/jaetill/splendor/commit/a5bedc9da60d46478f78dfc8efe1169b35841813))


### Bug Fixes

* **app:** render game setup screen instead of placeholder ([#31](https://github.com/jaetill/splendor/issues/31)) ([#33](https://github.com/jaetill/splendor/issues/33)) ([274071a](https://github.com/jaetill/splendor/commit/274071a2cb36ec9e00c86ec73bb3508ba98a3216))
* **ci:** guard npm ci --prefix lambda for lambda-less repo ([#22](https://github.com/jaetill/splendor/issues/22)) ([80f3abc](https://github.com/jaetill/splendor/commit/80f3abc35f9638a456c9dc18e04227c334a4f4a0))
* **ci:** guard npm ci --prefix lambda for lambda-less repo ([#32](https://github.com/jaetill/splendor/issues/32)) ([a8e8e6c](https://github.com/jaetill/splendor/commit/a8e8e6c6a191c8f901b85d993822389549ed1b87))
* **ci:** hoist NB comment out of if-block scalar (workflow was unparseable) ([#7](https://github.com/jaetill/splendor/issues/7)) ([eacb9e0](https://github.com/jaetill/splendor/commit/eacb9e04c6aa7bdb79d7988330ec5d23ff18e3b2))
* **docs:** repair mkdocs --strict build ([#6](https://github.com/jaetill/splendor/issues/6)) ([6448af1](https://github.com/jaetill/splendor/commit/6448af1da8dd703a85ab5e6c941ea1e69b3327b5))
* **implementer:** allow fleet-App dispatch; drop API-key fallback ([#20](https://github.com/jaetill/splendor/issues/20)) ([f8da1c9](https://github.com/jaetill/splendor/commit/f8da1c97b7812a089fd5cddbd2c309a760fc9d23))


### Reverts

* undo PR [#22](https://github.com/jaetill/splendor/issues/22) - it merged feat/game-engine into main by mistake ([#28](https://github.com/jaetill/splendor/issues/28)) ([cc73f8f](https://github.com/jaetill/splendor/commit/cc73f8f232562620acbae7a00e55778efe65dd82))
