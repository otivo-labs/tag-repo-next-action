const core = require('@actions/core');
const github = require('@actions/github');

async function run() {

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2); // Months are 0-indexed in JavaScript
    const day = ("0" + currentDate.getDate()).slice(-2);

    const date = `${year}-${month}-${day}`;

    const token = core.getInput('github_token');
    const envSlug = core.getInput('env-slug');
    console.log(`Date: ${date}`);
    const context = github.context;
    const octokit = github.getOctokit(token);

    let page = 1;
    let hasNextPage = true;
    const allTags = [];

    while (hasNextPage) {
        const {data: tags, headers} = await octokit.rest.repos.listTags({
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
    const deploymentCount = allTags.filter(tag => tag.startsWith(`${envSlug}-${date}`)).length;
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
}

run().catch((e) => {
    console.error(e);
    core.setFailed(e.message);

});