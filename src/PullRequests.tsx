import * as React from "react"
import { Chart, ChartData } from "./Chart"
import { useEffect, useState } from "react"
import { CircularProgress } from "@material-ui/core"
import styled from 'styled-components'
import Chip from "@material-ui/core/Chip"
import { CenteredContent } from "./Layouts"
import { loadAllPullRequests, PullRequest } from "./github-api"

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
    return "#5C6B5C"
  }
  if (days > 8) {
    return "#7C665E"
  }
  if (days > 5) {
    return "#AA8B80"
  }
  if (days > 3) {
    return "#E2C1B5"
  }
  return "#EFDDD6"
}

function prsToChartData(prs: PullRequest[]): ChartData {
  const teams = {}
  prs.forEach(pr => {
    const team = parseTeam(pr.title)
    if (teams[team] === undefined) {
      teams[team] = []
    }
    teams[team].push({
      name: pr.title + "\n",
      value: pr.additions + pr.deletions,
      color: color(pr.createdAt)
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
    loadAllPullRequests().then(prs => {
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

function developersNumber(prs: PullRequest[]): number {
  const ids = new Set(prs.map(pr => pr.author.id))
  return ids.size
}

const Page = styled.div`
  display: flex;
  height: 100vh;
  background-color: #B3B3B4;
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
