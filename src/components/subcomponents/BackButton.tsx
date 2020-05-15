import React from "react"

interface BackButtonProps {
  url: string
  label: string
}

const BackButton: React.FC<BackButtonProps> = props => {
  return (
    <a href={props.url} className="button is-white">
      <span className="icon is-small">
        <img src="/images/arrow-back.svg" />
      </span>{" "}
      <span>{props.label}</span>
    </a>
  )
}

export default BackButton
