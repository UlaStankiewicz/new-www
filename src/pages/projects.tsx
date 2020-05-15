import { graphql } from "gatsby"
import React from "react"
import Layout from "../components/layout"
import HelmetWrapper from "../components/subcomponents/HelmetWrapper"
import ProjectCard, {
  ProjectGraphql,
} from "../components/subcomponents/ProjectCard"

const ProjectsPage = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => {
  return (
    <Layout>
      <HelmetWrapper
        title="Projects"
        description="About our software development projects"
      />
      <div className="container">
        <div className="section">
          <h1 className="title has-text-dark has-text-weight-bold">
            discover our projects
          </h1>
          <div className="content">
            Since 2012 we have realized many innovative projects among which
            there are solutions supporting eco-driving, application for
            sportsmen, POS cash register, system supporting answering calls to
            emergency numbers and many others.
          </div>
          <div>
            <div className="columns is-multiline">
              {edges.map((v, index) => (
                <div className="column is-one-third" key={index + "project"}>
                  <ProjectCard project={v.node.frontmatter as ProjectGraphql} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query {
    allMarkdownRemark(filter: { frontmatter: { layout: { eq: "project" } } }) {
      edges {
        node {
          frontmatter {
            title
            image
            layout
            slug
            published
          }
        }
      }
    }
  }
`

export default ProjectsPage
