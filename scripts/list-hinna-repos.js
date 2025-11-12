#!/usr/bin/env node

/**
 * List all repositories containing "hinna" or "Hinna" in their name
 */

const { Octokit } = require('@octokit/rest');

const GH_TOKEN = process.env.GH_TOKEN;
const GITHUB_ORG = process.env.GITHUB_ORG || 'ABC-Academy-of-Music';

async function listHinnaRepos() {
  const octokit = new Octokit({ auth: GH_TOKEN });

  try {
    const { data: repos } = await octokit.repos.listForOrg({
      org: GITHUB_ORG,
      type: 'all',
      per_page: 100,
    });

    const hinnaRepos = repos
      .filter(repo => /hinna/i.test(repo.name))
      .map(repo => ({
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        cloneUrl: repo.clone_url,
        defaultBranch: repo.default_branch,
        updatedAt: repo.updated_at,
      }));

    console.log(JSON.stringify(hinnaRepos, null, 2));
  } catch (error) {
    console.error('Error listing repositories:', error.message);
    process.exit(1);
  }
}

listHinnaRepos();
