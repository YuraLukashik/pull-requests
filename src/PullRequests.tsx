import * as React from "react"
import { Octokit } from "@octokit/rest"
import { Chart, ChartData } from "./Chart"
import { useEffect, useState } from "react"
import { CircularProgress } from "@material-ui/core"
import styled from 'styled-components'
import Chip from "@material-ui/core/Chip"
import PullsGetResponse = Octokit.PullsGetResponse
import { repositorySettings } from "./RepositorySettings"
import { CenteredContent } from "./Layouts"

function parseTeam(title: string): string {
  const pattern = /^([A-Z0-9]+)-/
  const matches = pattern.exec(title)
  if (!matches) {
    return "No Team"
  }
  return matches[1]
}

function color(createdAt: Date): string {
  const now = new Date()
  const days = (now.getTime() - createdAt.getTime()) / (1000 * 3600 * 25)
  if (days > 15) {
    return "#4f2618"
  }
  if (days > 8) {
    return "#7e5456"
  }
  if (days > 5) {
    return "#a68a95"
  }
  if (days > 3) {
    return "#cdc4ce"
  }
  return "white"
}

function prsToChartData(prs: PullsGetResponse[]): ChartData {
  const teams = {}
  prs.forEach(pr => {
    const team = parseTeam(pr.title)
    if (teams[team] === undefined) {
      teams[team] = []
    }
    teams[team].push({
      name: pr.title + "\n",
      value: pr.additions + pr.deletions,
      color: color(new Date(pr.created_at))
    })
  })
  const teamsCharts = Object.keys(teams).map(team => ({
    name: team,
    children: teams[team]
  }))
  return {
    name: "PRs",
    children: teamsCharts
  }
}

export function PullRequests() {
  const [chartData, setChartData] = useState(undefined)
  const [prs, setPrs] = useState(undefined)
  useEffect(() => {
    loadPRs().then(prs => {
      setChartData(prsToChartData(prs))
      setPrs(prs)
    })
  }, [])
  if (!chartData || !prs) {
    return <CenteredContent>
      <CircularProgress />
    </CenteredContent>
  }
  return <Page>
    <ChartView>
      <Chart chartData={chartData}/>
    </ChartView>
    <RightColumn>
      <RightColumnContent>
        <RightColumnSection>
          <Chip label={`${prs.length} pull requests`}/>
        </RightColumnSection>
        <RightColumnSection>
          <Chip label={`${developersNumber(prs)} developers`}/>
        </RightColumnSection>
      </RightColumnContent>
    </RightColumn>
  </Page>
}

function developersNumber(prs: PullsGetResponse[]): number {
  const ids = new Set(prs.map(pr => pr.user.id))
  return ids.size
}

async function loadPRs() {
  const settings = repositorySettings()
  const repo = { repo: settings.repository, owner: settings.owner}
  const octokit = new Octokit({
    auth: settings.accessToken
  })
  const prsResponse = await octokit.pulls.list({
    ...repo,
    per_page: 100
  })
  return Promise.all(prsResponse.data.map(async pr => {
    const response = await octokit.pulls.get({
      ...repo,
      pull_number: pr.number
    })
    return response.data
  }))
}

const Page = styled.div`
  display: flex;
  height: 100vh;
  background-color: #e8f7f8;
`

const ChartView = styled.div`
  width: 100vh;
`

const RightColumn = styled.div`
`

const RightColumnContent = styled.div`
  padding-left: 32px;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
`

const RightColumnSection = styled.div`
  padding-top: 8px;
`
