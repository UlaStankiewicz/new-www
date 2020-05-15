import React from "react"
import Layout from "../components/layout"
import HelmetWrapper from "../components/subcomponents/HelmetWrapper"

const BlogPage = () => {
  return (
    <Layout className="blog-list">
      <HelmetWrapper
        title="Blog"
        description="Ideas about software development, practices. Coding examples in Swift, Kotlin, Android, iOS, Backend, Node.js, SQL, AWS and more."
      />

      <div className="container">
        <section className="section">
          <h1 className="title has-text-dark">Bright Devs Blog</h1>
          {/* {% for post in paginator.posts %} */}
          <a
            href="{ post.url | absolute_url  }"
            className="blog-post-list-item"
          >
            <div className="card">
              <div className="card-content">
                <div className="level is-hidden-tablet">
                  <figure className="image is-flex has-items-centered">
                    <img
                      src="{ post.image | absolute_url }"
                      alt="{ post.title }"
                    />
                  </figure>
                </div>
                <div className="level content">
                  <div>
                    <h2 className="title">{"post.title"}</h2>
                    {/* {% include _tags.html tags=post.tags %} */}
                    <p>{"post.excerpt"}</p>
                  </div>
                  <div className="level-right is-hidden-mobile">
                    <div>
                      <figure className="image is-256x256 is-flex has-items-centered">
                        <img
                          src="{ post.image | absolute_url }"
                          alt="{ post.title }"
                        />
                      </figure>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>
          {/* {% endfor %} */}

          <div className="is-flex has-justify-content-space-between">
            {/* {% if paginator.previous_page %} */}
            <a
              href="{ paginator.previous_page_path | absolute_url  }"
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
                    fill-rule="evenodd"
                    d="M8 10L4 6l4-4"
                  />
                </svg>
              </span>
              <span>Previous</span>
            </a>
            {/* {% endif %} */}

            {/* {% if paginator.next_page %} */}
            <a
              href="{ paginator.next_page_path | absolute_url  }"
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
                    fill-rule="evenodd"
                    d="M4 2l4 4-4 4"
                  />
                </svg>
              </span>
            </a>
            {/* {% endif %} */}
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default BlogPage
