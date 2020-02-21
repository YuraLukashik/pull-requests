import { repositorySettings } from "./RepositorySettings"
import { graphql } from "@octokit/graphql"

export type Label = {
  id: string
  name: string
}

export type PullRequest = {
  id: string
  title: string
  additions: number
  deletions: number
  createdAt: Date
  author: {
    id: string
  }
  labels: Label[]
}

export async function loadAllPullRequests(): Promise<PullRequest[]> {
  const settings = repositorySettings()
  const {repository: {pullRequests: {nodes: pullRequests}}} = await graphql(
    `
    {
      repository(owner: "${settings.owner}", name: "${settings.repository}") {
        pullRequests(first: 100, states: OPEN) {
          nodes {
            id
            title
            additions
            deletions
            createdAt
            author {
              ... on User {
                id
              }
            }
            labels(first: 100) {
              nodes {
                name
                id
              }
            }
          }
        }
      }
    }
  `,
    {
      headers: {
        authorization: `token ${settings.accessToken}`
      }
    }
  )
  return pullRequests.map(rawPR => ({
    ...rawPR,
    createdAt: new Date(rawPR.createdAt),
    labels: rawPR.labels.nodes
  }))
}