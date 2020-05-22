import * as React from "react"
import { Chart, ChartData } from "./Chart"
import { useEffect, useState } from "react"
import { CircularProgress } from "@material-ui/core"
import styled from 'styled-components'
import Chip from "@material-ui/core/Chip"
import { CenteredContent } from "./Layouts"
import { loadAllPullRequests, PullRequest } from "./github-api"
import Checkbox from "@material-ui/core/Checkbox"
import FormControlLabel from "@material-ui/core/FormControlLabel"

function parseTeam(title: string): string {
  const pattern = /^([A-Z0-9]+)[-\s][0-9]+/
  const matches = pattern.exec(title.toUpperCase())
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
  const teamsToExclude = new Set(["RELEASE"])
  const teamsNames = Object.keys(teams).filter(teamName => !teamsToExclude.has(teamName))
  const teamsCharts = teamsNames.map(team => ({
    name: team,
    children: teams[team]
  }))
  return {
    name: "PRs",
    children: teamsCharts
  }
}

function leaveOnlyNeedsReview(prs: PullRequest[]): PullRequest[] {
  return prs.filter((pr: PullRequest) => {
    const labelsNames = pr.labels.map(label => label.name)
    return labelsNames.includes("Needs review")
  })
}

export function PullRequests() {
  const [loadedPrs, setLoadedPrs] = useState(undefined)
  const [onlyNeedsReview, setOnlyNeedsReview] = useState(true)
  useEffect(() => {
    loadAllPullRequests().then(prs => {
      setLoadedPrs(prs)
    })
  }, [])
  if (!loadedPrs) {
    return <CenteredContent>
      <CircularProgress />
    </CenteredContent>
  }
  const prs = onlyNeedsReview ? leaveOnlyNeedsReview(loadedPrs) : loadedPrs
  const chartData = prsToChartData(prs)
  return <Page>
    <ChartView>
      <Chart chartData={chartData}/>
    </ChartView>
    <RightColumn>
      <RightColumnContent>
        <RightColumnSection>
          <PurpleBadge label={<span><BoldText>{prs.length}</BoldText> Pull Requests</span>}/>
        </RightColumnSection>
        <RightColumnSection>
          <BlueBadge label={<span><BoldText>{developersNumber(prs)}</BoldText> Developers</span>}/>
        </RightColumnSection>
        <RightColumnSection>
          <ControlLabel
            value="onlyNeedsReview"
            control={<Checkbox color="primary" />}
            label={<Text>PR needs review</Text>}
            labelPlacement="end"
            checked={onlyNeedsReview}
            onChange={(e, value) => setOnlyNeedsReview(value)}
          />
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
  background-color: #ffffff;
`

const ChartView = styled.div`
  width: 100vh;
`

const RightColumn = styled.div`
`

const RightColumnContent = styled.div`
  padding-left: 32px;
  padding-top: 48px;
  display: flex;
  flex-direction: column;
`

const RightColumnSection = styled.div`
  padding-top: 8px;
`

const ControlLabel = styled(FormControlLabel)`
  font-size: 0.8125rem;
`

const Text = styled.span`
  font-size: 0.8125rem;
`

const PurpleBadge = styled(Chip)`
  background-color: #8561c5;
  color: white;
`

const BlueBadge = styled(Chip)`
  background-color: #5393ff;
  color: white;
`

const BoldText = styled.span`
  font-weight: bold;
`
