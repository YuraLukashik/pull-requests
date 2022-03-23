import { Checkbox, FormControlLabel } from "@mui/material"
import * as React from "react"
import styled from "styled-components"
import { Text } from "./PullRequests"
import { PullRequest } from "./github-api"

export type Filters = {
  onlyNeedsReview: boolean
  onlyNotApproved: boolean
}

export function applyFilters(prs: PullRequest[], filters: Filters): PullRequest[] {
  if (filters.onlyNeedsReview) {
    prs = leaveOnlyNeedsReview(prs)
  }
  if (filters.onlyNotApproved) {
    prs = leaveOnlyNotApproved(prs)
  }
  return prs
}

function leaveOnlyNeedsReview(prs: PullRequest[]): PullRequest[] {
  return prs.filter((pr: PullRequest) => {
    const labelsNames = pr.labels.map(label => label.name)
    return labelsNames.includes("Needs review")
  })
}

function leaveOnlyNotApproved(prs: PullRequest[]): PullRequest[] {
  return prs.filter((pr: PullRequest) => {
    const reviewsStates = pr.reviews.map(review => review.state)
    return reviewsStates.includes("APPROVED") === false
  })
}

export const defaultFilters: Filters = {
  onlyNeedsReview: true,
  onlyNotApproved: true
}

type Props = {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export function FiltersBlock(props: Props) {
  const filters = props.filters
  return <div>
    <ControlLabel
      value="onlyNeedsReview"
      control={<Checkbox color="primary"/>}
      label={<Text>PR needs review</Text>}
      labelPlacement="end"
      checked={filters.onlyNeedsReview}
      onChange={(e, onlyNeedsReview) => props.onFiltersChange({...filters, onlyNeedsReview})}
    />
    <ControlLabel
      value="onlyNotApproved"
      control={<Checkbox color="primary"/>}
      label={<Text>PR is not approved</Text>}
      labelPlacement="end"
      checked={filters.onlyNotApproved}
      onChange={(e, onlyNotApproved) => props.onFiltersChange({...filters, onlyNotApproved})}
    />
  </div>
}

const ControlLabel = styled(FormControlLabel)`
  font-size: 0.8125rem;
`
