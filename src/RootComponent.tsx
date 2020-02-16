import * as React from "react"
import { render } from "react-dom"
import { PullRequests } from "./PullRequests"
import { RepositorySettingsContainer } from "./RepositorySettings"

export function mount(element: HTMLElement) {
  render(<RootComponent />, element)
}

const RootComponent = () => (
  <RepositorySettingsContainer>
    <PullRequests/>
  </RepositorySettingsContainer>
)
