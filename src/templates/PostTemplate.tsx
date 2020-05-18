import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import Layout from "../components/layout"
import BackButton from "../components/subcomponents/BackButton"
import HelmetWrapper from "../components/subcomponents/HelmetWrapper"

export default function Template(props) {
  console.log(props)
  const { markdownRemark, allMarkdownRemark } = props.data // data.markdownRemark holds your post data
  const { frontmatter: page, html } = markdownRemark

  const author = allMarkdownRemark.nodes.find(({ frontmatter: userData }) => {
    return (
      userData.author_id === page.author ||
      userData.author_id === page.author_id
    )
  }).frontmatter

  return (
    <Layout>
      <HelmetWrapper title={page.title}></HelmetWrapper>

      <div className="container">
        <article className="section">
          <div className="columns is-vcentered">
            <div className="column is-half">
              <a href={"/about-us/" + author.author_id}>
                <article className="media">
                  <figure className="media-left">
                    <p className="image is-64x64">
                      <img
                        src={author.avatar}
                        alt={author.name + " bio photo"}
                        className="is-rounded"
                      />
                    </p>
                  </figure>
                  <div className="media-content">
                    <div className="content">
                      <h4 className="title has-text-dark">{author.name}</h4>
                      <p className="subtitle is-6">{author.bio}</p>
                    </div>
                  </div>
                </article>
              </a>
            </div>
            <div className="column has-text-right">
              <div className="content has-text-grey-light">
                <p className="has-text-primary">
                  {markdownRemark.timeToRead} min
                </p>
                <p className="tags has-justify-content-flex-end">
                  {page.tags.map(tag => (
                    <span className="tag">{tag}</span>
                  ))}
                </p>

                {/* <p>{% include post/date.html date=page.date updated=page.updated %} <a className="has-text-grey-light" href="{site.url}/admin/#/collections/blog/entries/{ entry_path }">Edit</a></p>  */}
              </div>
            </div>
          </div>

          <h1 className="title">{page.title}</h1>
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: html }}
          ></div>

          {/* {% include _back_button.html url="/blog" label="Blog" %} */}
          <BackButton url="/blog" label="Blog" />

          {/* {% include post/crosspost.html %} */}

          {/* {% if site.owner.disqus-shortname and page.comments == true %} */}
          {/* <section id="disqus_thread"></section><!-- /#disqus_thread --> */}
          {/* {% endif %} */}
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
        author
        tags
        date
      }
      timeToRead
    }
    allMarkdownRemark(filter: { frontmatter: { author_id: { ne: null } } }) {
      nodes {
        frontmatter {
          author_id
          avatar
          bio
          name
          web
        }
      }
    }
  }
`
