/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 906:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 303:
/***/ ((module) => {

module.exports = eval("require")("@actions/github");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
const core = __nccwpck_require__(906);
const github = __nccwpck_require__(303);

async function run() {
    try {

        const date = core.getInput('date');
        const token = core.getInput('token');
        const envSlug = core.getInput('env-slug');
        console.log(`Date: ${date}`);
        const context = github.context;
        const octokit = github.getOctokit(token);

        let page = 1;
        let hasNextPage = true;
        const allTags = [];

        while (hasNextPage) {
            const {data: tags, headers} = await octokit.rest.repo.listTags({
                owner: context.repo.owner,
                repo: context.repo.repo,
                per_page: 100,
                page: page
            });

            allTags.push(...tags.map(tag => tag.name));

            // Check if there is a next page
            hasNextPage = headers.link && headers.link.includes('rel="next"');
            page++;
        }

        console.log(`All Tags: ${JSON.stringify(allTags, null, 2)}`);

        // Get the number of deployments done today (via tag search) and increment count by 1
        const deploymentCount = allTags.filter(tag => tag.startsWith(`${process.env.ENV_SLUG}-${date}`)).length;
        const nextDeploymentNumber = deploymentCount + 1;

        const nextTag = `${envSlug}-${date}-${nextDeploymentNumber}`;

        console.log(`Tagging with nextTag: ${nextTag}`);

        await octokit.rest.git.createRef({
            owner: context.repo.owner,
            repo: context.repo.repo,
            ref: `refs/tags/${nextTag}`,
            sha: context.sha
        });
        core.setOutput("nextTag", nextTag);
    } catch (error) {
        core.setFailed(error.message);
    }
}
})();

module.exports = __webpack_exports__;
/******/ })()
;