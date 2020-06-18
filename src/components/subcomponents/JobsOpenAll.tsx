import { graphql, useStaticQuery } from "gatsby"
import React from "react"
import { getUrlForAbsolutePath } from "../../helpers/pathHelpers"

interface Job {
  title: string
  hours: string
  salary: string
  url: string
}

const JobsOpenAll: React.FC = () => {
  const {
    allMarkdownRemark: { edges },
  } = useStaticQuery(graphql`
    query {
      allMarkdownRemark(
        filter: {
          frontmatter: { layout: { eq: "job" }, published: { eq: true } }
        }
      ) {
        edges {
          node {
            frontmatter {
              title
              salary
              hours
            }
            fileAbsolutePath
          }
        }
      }
    }
  `)
  const jobs = edges.map(v => v.node)

  return (
    <div className="open-positions ">
      {jobs.map(edge => {
        const { frontmatter: job, fileAbsolutePath } = edge
        return (
          <p className="open-position">
            <a
              href={getUrlForAbsolutePath(fileAbsolutePath)}
              className="has-text-dark"
            >
              <div className="has-text-dark has-text-weight-bold is-size-3">
                {job.title}
              </div>
              <div className="has-text-grey">{job.hours}</div>
              <div className="has-text-primary">{job.salary}</div>
            </a>
          </p>
        )
      })}
    </div>
  )
}

export default JobsOpenAll
