import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import BackButton from "../components/subcomponents/BackButton"

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark } = data // data.markdownRemark holds your post data
  const { frontmatter, html } = markdownRemark
  return (
    <Layout>
      <div className="container">
        <article className="section">
          <h1 className="title has-text-dark has-text-weight-bold">
            {frontmatter.title}
          </h1>
          <p className="content">{frontmatter.description}</p>
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: html }}
          ></div>
          <BackButton url="/projects" label="Projects" />
        </article>
      </div>
    </Layout>
  )
}
export const pageQuery = graphql`
  query($fileAbsolutePath: String!) {
    markdownRemark(fileAbsolutePath: { eq: $fileAbsolutePath }) {
      html
      frontmatter {
        slug
        title
        description
      }
    }
  }
`
