import { graphql, useStaticQuery } from "gatsby"
import React from "react"
import { getUrlForAbsolutePath } from "../../helpers/pathHelpers"

interface Job {
  title: string
  hours: string
  salary: string
  url: string
}

const JobsOpenTop: React.FC = () => {
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
    <div className="level open-positions-top">
      {jobs.map(edge => {
        const { frontmatter: job, fileAbsolutePath } = edge
        return (
          <div className="level-item">
            <div>
              <a href={getUrlForAbsolutePath(fileAbsolutePath)}>
                <h3 className="has-text-white has-text-weight-bold">
                  {job.title}
                </h3>
                <div className="has-text-grey">{job.hours}</div>
                <div className="has-text-primary">{job.salary}</div>
              </a>
              <a href="/apply-for-job" className="button is-primary">
                Apply
              </a>
            </div>
          </div>
        )
      })}
      <div className="level-item">
        <div>
          <a
            href="/career#open-positions"
            className="has-text-weight-bold has-text-white"
          >
            <figure className="image is-24x24">
              <img src="/images/arrow-more.svg" alt="See all" />
            </figure>
            See all
          </a>
        </div>
      </div>
    </div>
  )
}

export default JobsOpenTop
