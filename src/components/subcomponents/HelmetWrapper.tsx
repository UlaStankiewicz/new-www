import React from "react"
import { Helmet } from "react-helmet"

interface HelmetWrapperProps {
  title: string
  description?: string
}

const HelmetWrapper: React.FC<HelmetWrapperProps> = props => {
  return (
    <Helmet>
      <title>{props.title} | Bright Inventions</title>
      {props.description && (
        <meta name="description" content={props.description} />
      )}
    </Helmet>
  )
}

export default HelmetWrapper
