const core = require('@actions/core');
const github = require('@actions/github');

async function run() {

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
}

run().catch(e => core.setFailed(e.message));