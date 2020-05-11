import { graphql, useStaticQuery } from "gatsby"
import React from "react"

const TeamMembers = () => {
  const {
    allMarkdownRemark: { nodes },
  } = useStaticQuery(graphql`
    query {
      allMarkdownRemark(
        filter: { frontmatter: { ex: { ne: true }, author_id: { ne: null } } }
        sort: { fields: frontmatter___author_id }
      ) {
        nodes {
          frontmatter {
            avatar
            author_id
            name
            short_name
          }
        }
      }
    }
  `)
  return (
    <div className="columns is-multiline team-members">
      {nodes.map(v => {
        const member = v.frontmatter
        return (
          <div className="column team-member">
            <a
              href={"/about-us/" + member.author_id}
              className="is-flex has-items-centered has-direction-column"
            >
              <figure className="image is-100x100 container">
                <img
                  className="is-rounded"
                  src={member.avatar}
                  alt={member.name}
                />
              </figure>
              <p className="is-size-5 has-text-weight-bold">
                {member.short_name}
              </p>
            </a>
          </div>
        )
      })}
    </div>
  )
}

export default TeamMembers
