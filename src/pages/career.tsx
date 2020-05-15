// ---
// layout: default
// title: Career
// class: career
// ---

import React from "react"
import Layout from "../components/layout"
import HelmetWrapper from "../components/subcomponents/HelmetWrapper"
import JobsOpenAll from "../components/subcomponents/JobsOpenAll"
import JobsOpenTop from "../components/subcomponents/JobsOpenTop"

const CareerPage: React.FC = () => {
  return (
    <Layout className="page-career">
      <HelmetWrapper title="Career" />
      <section className="hero is-dark we-hire">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">we hire bright people</h1>
            <JobsOpenTop />
          </div>
        </div>
      </section>

      <div className="container">
        <article className="section">
          <h2 className="title has-text-dark">what we practice?</h2>
          <div className="columns is-multiline">
            <div className="column is-one-third has-text-centered">
              <figure className="image is-128x128 is-inline-block">
                <img src="/images/design.svg" alt="in house design" />
              </figure>
              <p>in house design</p>
            </div>

            <div className="column is-one-third has-text-centered">
              <figure className="image is-128x128 is-inline-block">
                <img src="/images/code-review.svg" alt="code review" />
              </figure>
              <p>code review (Upsource)</p>
            </div>

            <div className="column is-one-third has-text-centered">
              <figure className="image is-128x128 is-inline-block">
                <img src="/images/pairProgramming.svg" alt="pair programming" />
              </figure>
              <p>pair programming</p>
            </div>

            <div className="column is-one-third has-text-centered">
              <figure className="image is-128x128 is-inline-block">
                <img src="/images/testdrivenenvironment.svg" alt="TDD" />
              </figure>
              <p>test driven development</p>
            </div>

            <div className="column is-one-third has-text-centered">
              <figure className="image is-128x128 is-inline-block">
                <img src="/images/continuousintegration.svg" alt="CI/CD" />
              </figure>
              <p>continuous integration and delivery</p>
            </div>

            <div className="column is-one-third has-text-centered">
              <figure className="image is-128x128 is-inline-block">
                <img src="/images/oneOnOne.svg" alt="one on one" />
              </figure>
              <p>one on one meetings</p>
            </div>
          </div>
        </article>
      </div>

      <section className="hero is-dark bright-minds">
        <div className="container has-text-centered is-flex has-items-centered">
          <h2 className="title">bright minds, bright solutions</h2>
        </div>
      </section>

      <div className="container">
        <article className="section">
          <h2 className="title" id="open-positions">
            open positions
          </h2>
          <JobsOpenAll />
        </article>
      </div>
    </Layout>
  )
}

export default CareerPage
