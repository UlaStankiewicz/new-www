import { graphql } from "gatsby"
import React, { useState } from "react"
import { Carousel } from "react-responsive-carousel"
import Layout from "../components/layout"
import ProjectCard, {
  ProjectGraphql,
} from "../components/subcomponents/ProjectCard"
import { FormType, sendMail } from "../helpers/mail"
import "../styles/_page-index.scss"
import "react-responsive-carousel/lib/styles/carousel.min.css"

const IndexPage = ({
  data: {
    allMarkdownRemark: { edges },
  },
}) => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [checkedRules, setCheckedRules] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const wrapValue = value => ({
      value,
    })
    sendMail(
      {
        name: wrapValue(name),
        email: wrapValue(email),
        message: wrapValue(message),
      },
      FormType.contact
    )
      .then(() => {
        setError(false)
        setSuccess(true)
      })
      .catch(err => {
        console.error(err)
        setError(true)
        setSuccess(false)
      })
  }

  return (
    <Layout className="page-index">
      <section className="hero we-deliver">
        <div className="hero-body">
          <div className="container">
            <div className="columns">
              <div className="column">
                <h1 className="title">
                  let's create software that <span>matters</span>
                </h1>
              </div>
              <div className="column is-ula-with-andrzej-background">
                <figure className="image">
                  <img src="/images/ula_with_andrzej.jpg" alt="" />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="hero experts-in">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">bright experts in</h1>
            <div className="columns is-centered">
              <div className="column has-text-centered">
                <figure className="image is-128x128 is-inline-block">
                  <img
                    src="/images/web_development3.svg"
                    width="128"
                    alt="web development"
                  />
                </figure>
                <h2 className="subtitle">web development</h2>
              </div>
              <div className="column has-text-centered">
                <figure className="image is-128x128 is-inline-block">
                  <img
                    src="/images/Mobile_App_Development3.svg"
                    width="128"
                    alt="mobile development"
                  />
                </figure>
                <h2 className="subtitle">mobile development</h2>
              </div>
              <div className="column has-text-centered">
                <figure className="image is-128x128 is-inline-block">
                  <img
                    src="/images/consulting3.svg"
                    width="128"
                    alt="consulting services"
                  />
                </figure>
                <h2 className="subtitle">consulting services</h2>
              </div>
              <div className="column has-text-centered">
                <figure className="image is-128x128 is-inline-block">
                  <img
                    src="/images/design3.svg"
                    width="128"
                    alt="UI/UX design"
                  />
                </figure>
                <h2 className="subtitle">UI/UX design</h2>
              </div>
            </div>
            <div className="level">
              <div className="level-item has-text-centered">
                <a
                  href="/what-we-offer"
                  className="button is-outlined is-primary"
                >
                  more services
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hero is-dark bright-minds">
        <div className="container has-text-centered is-flex has-items-centered">
          <h1 className="title">bright minds, bright solutions</h1>
        </div>
      </section>
      <section className="hero success-stories">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">our success stories</h1>
            <div className="columns is-multiline">
              {edges.map((v, index) => (
                <div className="column is-one-third" key={index + "project"}>
                  <ProjectCard project={v.node.frontmatter as ProjectGraphql} />
                </div>
              ))}
            </div>

            <div className="level">
              <div className="level-item has-text-centered">
                <a href="/projects" className="button is-outlined is-primary">
                  more stories
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="hero is-dark why-us">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">why us?</h1>
            <Carousel className="carousel" showStatus={false}>
              <div className="carousel-item has-text-centered">
                <p className="content is-size-4">
                  "(...) they delivered results very fast and were always very
                  flexible. This is good for a startup, since we have feature
                  requests that sometimes come on very short notice."
                </p>
                <div className="content author has-text-primary has-text-weight-bold">
                  CTO, Survey Firm, Berlin
                </div>
              </div>
              <div className="carousel-item has-text-centered">
                <p className="content is-size-4">
                  "Besides being extremely proficient in their field, they care
                  about our business and want us to succeed."
                </p>
                <div className="content author has-text-primary has-text-weight-bold">
                  Founder, Retail Management System, London
                </div>
              </div>
              <div className="carousel-item has-text-centered">
                <p className="content is-size-4">
                  "They actually care a lot about the design. You had to be
                  almost perfect, and that was fine with us."
                </p>
                <div className="content author has-text-primary has-text-weight-bold">
                  Co-founder, Everytap, Poland
                </div>
              </div>
            </Carousel>
            <div className="section">
              <div className="level">
                <a
                  href="https://www.appfutura.com/developers/bright"
                  target="_blank"
                  className="w-inline-block"
                >
                  <img
                    src="/images/appfutura-badge150.png"
                    width="100"
                    className="image-12"
                  />
                </a>
                <a
                  href="https://www.appfutura.com/developers/bright"
                  target="_blank"
                  className="w-inline-block"
                >
                  <img
                    src="/images/appfutura-badge2_150.png"
                    width="100"
                    className="image-37"
                  />
                </a>
                <a
                  href="https://clutch.co/profile/bright-inventions"
                  target="_blank"
                  className="w-inline-block"
                >
                  <img
                    src="/images/App-Developers_Poland_2018h135.png"
                    width="100"
                    className="image-38"
                  />
                </a>
                <a
                  href="https://clutch.co/profile/bright-inventions"
                  target="_blank"
                  className="w-inline-block"
                >
                  <img
                    src="/images/B2B_Companies_Poland_2018-h135.png"
                    width="100"
                    className="image-39"
                  />
                </a>
                <a
                  href="https://clutch.co/profile/bright-inventions"
                  target="_blank"
                  className="w-inline-block"
                >
                  <img
                    src="/images/Web_Developers_Poland_2018h135.png"
                    width="100"
                    className="image-40"
                  />
                </a>
              </div>
            </div>
            <script
              src="https://cdn.jsdelivr.net/npm/bulma-carousel@4.0.4/dist/js/bulma-carousel.min.js"
              async
            ></script>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h1 className="title">get in touch</h1>
          <form data-form-type="contact" action="#" onSubmit={onFormSubmit}>
            <div className="field">
              <label className="label">Name</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  maxLength={256}
                  name="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="i.e. Aretha Franklin"
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Email Address</label>
              <div className="control">
                <input
                  type="email"
                  className="input"
                  maxLength={256}
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Message</label>
              <div className="control">
                <textarea
                  name="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={5000}
                  placeholder="your message here"
                  required
                  className="textarea"
                ></textarea>
              </div>
            </div>
            <div className="field">
              <div className="control">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    name="accept-policy"
                    value="yes"
                    required
                    onChange={e => setCheckedRules(e.currentTarget.checked)}
                    checked={checkedRules}
                  />
                  &nbsp;I accept the&nbsp;
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    className="has-text-primary"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>
            <div className="field">
              <div className="control">
                <button
                  className="button is-primary"
                  type="submit"
                  disabled={!(checkedRules && name && email && message)}
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
          {success && (
            <div className="has-text-success is-size-4">
              Thank you! Your submission has been received!
            </div>
          )}
          {error && (
            <div className="has-text-warning is-size-4">
              Oops! Something went wrong while submitting the form.
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}

export const pageQuery = graphql`
  query {
    allMarkdownRemark(
      filter: { frontmatter: { layout: { eq: "project" } } }
      limit: 6
    ) {
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

export default IndexPage
