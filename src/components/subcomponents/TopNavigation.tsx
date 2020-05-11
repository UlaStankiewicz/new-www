import React from "react"

export const TopNavigation = () => {
  return (
    <nav
      className="navbar is-fixed-top"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="container">
        <div className="navbar-brand">
          <a className="navbar-item" href="/">
            <img
              className="navbar-logo"
              src="/images/bright_inventions_logo_500-01.png"
            />
          </a>

          <div className="navbar-item is-hidden-desktop">
            <div className="buttons">
              <a className="button is-primary" href="/start-project">
                <strong>Estimate project</strong>
              </a>
            </div>
          </div>

          <a
            role="button"
            className="navbar-burger burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="#topNavBar"
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div id="topNavBar" className="navbar-menu">
          <div className="navbar-start">
            <a className="navbar-item" href="/about-us">
              About us
            </a>

            <a className="navbar-item" href="/what-we-offer">
              What we offer
            </a>

            <a className="navbar-item" href="/projects">
              Projects
            </a>

            <a className="navbar-item" href="/career">
              Career
            </a>

            <a className="navbar-item" href="/blog">
              Blog
            </a>
          </div>

          <div className="navbar-end is-hidden-mobile">
            <div className="navbar-item">
              <div className="buttons">
                <a className="button is-primary" href="/start-project">
                  <strong>Estimate project</strong>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
