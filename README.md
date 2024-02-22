# Tag Repo Next Action

This GitHub Action retrieves the latest tag in the format `${env_slug}-${date}-N` where `N` is increasing per day. It's written in JavaScript and uses the npm package manager.

## Prerequisites

- Node.js
- npm

## Usage

This action requires the following inputs:

- `github_token`: The token from secrets GITHUB_TOKEN.
- `env-slug`: The environment slug to use.
- `date`: The date in the format YYYY-MM-DD.

It outputs the next tag to use in the format `${env_slug}-${date}-N`.

To use this action in your GitHub workflow, add the following step:

```yaml
- name: Tag the repository with next tag
  uses: otivo-labs/tag-repo-next-action@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    env-slug: 'your-env-slug'
    date: '2022-01-01'
```