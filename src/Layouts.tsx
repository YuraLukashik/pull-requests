import { ReactElement } from "react"
import styled from "styled-components"
import * as React from "react"

const HorizontalContainer = styled.div`
  display: flex;
  justify-content: center;
  height: 100vh;
`

const VerticalContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`

export function CenteredContent(props: {
  children: ReactElement
}) {
  return <HorizontalContainer>
    <VerticalContainer>
      {props.children}
    </VerticalContainer>
  </HorizontalContainer>
}
