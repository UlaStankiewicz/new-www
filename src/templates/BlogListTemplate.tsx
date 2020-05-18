import React from "react"
import Layout from "../components/layout"
import HelmetWrapper from "../components/subcomponents/HelmetWrapper"
import { useStaticQuery, graphql } from "gatsby"
import "../styles/_blog.scss"

interface PageContext {
  currentPage: 2
  limit: 10
  numPages: 21
  skip: 10
}

const BlogPage: React.FC<{
  data: any
  pageContext: PageContext
}> = ({
  data: {
    allMarkdownRemark: { edges },
  },
  pageContext,
}) => {
  return (
    <Layout className="page-blog-list">
      <HelmetWrapper
        title="Blog"
        description="Ideas about software development, practices. Coding examples in Swift, Kotlin, Android, iOS, Backend, Node.js, SQL, AWS and more."
      />

      <div className="container">
        <section className="section">
          <h1 className="title has-text-dark">Bright Devs Blog</h1>
          {edges.map(({ node }) => {
            const post = {
              ...node.fields,
              ...node.frontmatter,
              excerpt: node.excerpt,
            }
            return (
              <a href={post.slug} className="blog-post-list-item">
                <div className="card">
                  <div className="card-content">
                    <div className="level is-hidden-tablet">
                      <figure className="image is-flex has-items-centered">
                        <img src={post.image} alt={post.title} />
                      </figure>
                    </div>
                    <div className="level content">
                      <div>
                        <h2 className="title">{post.title}</h2>
                        <p className="tags">
                          {post.tags.map(tag => (
                            <span className="tag">{tag}</span>
                          ))}
                        </p>
                        <p>{post.excerpt}</p>
                      </div>
                      <div className="level-right is-hidden-mobile">
                        <div>
                          <figure className="image is-256x256 is-flex has-items-centered">
                            <img src={post.image} alt={post.title} />
                          </figure>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
          <div className="is-flex has-justify-content-space-between">
            {pageContext.currentPage > 1 && (
              <a
                href={
                  "/blog/" +
                  (pageContext.currentPage - 1 > 1
                    ? pageContext.currentPage - 1
                    : "")
                }
                className="button"
              >
                <span className="icon">
                  <svg
                    className="w-pagination-previous-icon"
                    height="12px"
                    width="12px"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 12 12"
                    transform="translate(0, 1)"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      fillRule="evenodd"
                      d="M8 10L4 6l4-4"
                    />
                  </svg>
                </span>
                <span>Previous</span>
              </a>
            )}
            {pageContext.numPages > pageContext.currentPage && (
              <a
                href={"/blog/" + (pageContext.currentPage + 1)}
                className="button"
              >
                <span>Next</span>
                <span className="icon">
                  <svg
                    className="w-pagination-next-icon icon-7"
                    height="12px"
                    width="12px"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 12 12"
                    transform="translate(0, 1)"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      fillRule="evenodd"
                      d="M4 2l4 4-4 4"
                    />
                  </svg>
                </span>
              </a>
            )}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export const pageQuery = graphql`
  query MyQuery($skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      filter: {
        frontmatter: {
          layout: { eq: "post" }
          published: { ne: false }
          hidden: { ne: true }
        }
      }
      sort: { fields: fileAbsolutePath, order: DESC }
      skip: $skip
      limit: $limit
    ) {
      edges {
        node {
          id
          fileAbsolutePath
          excerpt(pruneLength: 500)
          frontmatter {
            excerpt
            comments
            image
            author
            author_id
            title
            tags
            date
          }
          fields {
            slug
          }
        }
      }
    }
  }
`

export default BlogPage
