import React from "react"
import { Disqus, CommentCount } from "gatsby-plugin-disqus"
import { graphql, useStaticQuery } from "gatsby"

const DisqusComments = ({ title }) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          siteUrl
          disqusShortname
        }
      }
    }
  `)

  const disqusConfig = {
    identifier: data.site.siteMetadata.disqusShortname,
    url: `${data.site.siteMetadata.siteUrl + location.pathname}`,
    title: title,
  }

  return <Disqus config={disqusConfig} />
}

export default DisqusComments
