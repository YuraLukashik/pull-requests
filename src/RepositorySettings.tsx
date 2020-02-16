import { ChangeEvent, ReactElement, useCallback, useEffect, useState } from "react"
import * as React from "react"
import { CircularProgress } from "@material-ui/core"
import TextField from "@material-ui/core/TextField"
import Button from "@material-ui/core/Button"
import styled from "styled-components"
import { CenteredContent } from "./Layouts"

type RepositorySettings = {
  accessToken: string
  owner: string
  repository: string
}

export function repositorySettings(): RepositorySettings {
  const accessToken = window.localStorage.getItem('access-token')
  const owner = window.localStorage.getItem('owner')
  const repository = window.localStorage.getItem('repository')
  return {
    accessToken: accessToken !== null ? accessToken : '',
    owner: owner !== null ? owner : '',
    repository: repository !== null ? repository : ''
  }
}

function updateRepositorySettings(settings: RepositorySettings) {
  window.localStorage.setItem('access-token', settings.accessToken)
  window.localStorage.setItem('owner', settings.owner)
  window.localStorage.setItem('repository', settings.repository)
}

function shouldAskToUpdate(settings: RepositorySettings) {
  return settings.accessToken === '' || settings.owner === '' || settings.repository === ''
}

export function RepositorySettingsContainer(props: {
  children: ReactElement
}) {
  const [settings, setSettings] = useState<RepositorySettings|undefined>(undefined)
  const storeSettings = useCallback((settings: RepositorySettings) => {
    updateRepositorySettings(settings)
    setSettings(settings)
  }, [])
  useEffect(() => {
    setSettings(repositorySettings())
  }, [])
  if (settings === undefined) {
    return <CircularProgress/>
  }
  if (shouldAskToUpdate(settings)) {
    return <UpdateRepositorySettingsForm settings={settings} storeSettings={storeSettings}/>
  }
  return props.children
}

function UpdateRepositorySettingsForm(props: {
  settings: RepositorySettings,
  storeSettings: (RepositorySettings) => void
}) {
  const tokenInput = useFormInput(props.settings.accessToken)
  const ownerInput = useFormInput(props.settings.owner)
  const repositoryInput = useFormInput(props.settings.repository)
  const onConfirm = useCallback(() => {
    props.storeSettings({
      accessToken: tokenInput.value,
      owner: ownerInput.value,
      repository: repositoryInput.value
    })
  }, [tokenInput.value, ownerInput.value, repositoryInput.value])
  return <CenteredContent>
    <Form>
      <TextInput id="token" type="string" {...tokenInput} placeholder={"Github access token"}/>
      <TextInput id="repo-owner" type="string" {...ownerInput} placeholder={"Repository owner"}/>
      <TextInput id="repo" type="string" {...repositoryInput} placeholder={"Repository"}/>
      <Button variant="contained" color="primary" onClick={onConfirm}>
        Save Settings
      </Button>
    </Form>
  </CenteredContent>
}

function useFormInput(initialValue) {
  const [value, setValue] = useState(initialValue)
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }, [setValue])
  return {
    value,
    onChange
  }
}

const Form = styled.form`
  display: flex;
  flex-direction: column;
`

const TextInput = styled(TextField)`
  padding-bottom: 10px;
`