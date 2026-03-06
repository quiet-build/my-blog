declare module 'gitalk/dist/gitalk-component' {
  import { Component } from 'react'

  interface GitalkOptions {
    id?: string
    title?: string
    clientID: string
    clientSecret: string
    repo: string
    owner: string
    admin: string[]
    distractionFreeMode?: boolean
  }

  interface GitalkProps {
    options: GitalkOptions
  }

  export default class GitalkComponent extends Component<GitalkProps> {}
}
