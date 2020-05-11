import React from "react"

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="columns">
          <div className="column">
            <figure className="content image is-64x64">
              <a href="{{ site.url }}">
                <img
                  src="/images/b_logo_black.svg"
                  alt="Bright Inventions Logo Small"
                />
              </a>
            </figure>

            <script
              type="text/javascript"
              src="https://widget.clutch.co/static/js/widget.js"
              async
            ></script>
            <div
              className="clutch-widget content"
              data-url="https://widget.clutch.co"
              data-widget-type="1"
              data-height="50"
              data-clutchcompany-id="32656"
            ></div>

            <address className="level content">
              <div className="level-left ">
                <span className="icon">
                  <img src="/images/location_purple.svg" />
                </span>
                <div className="content">
                  <p>
                    ul. Jana Matejki 12, <br />
                    80-232 Gdańsk
                  </p>
                </div>
              </div>
            </address>

            <div className="content level">
              <div className="level-left">
                <span className="icon">
                  <img src="/images/email_purple.svg" width="18" />
                </span>
                <div className="content">
                  <a
                    className="has-text-black-bis"
                    href="mailto:info@brightinventions.pl?subject=bright%20mail"
                  >
                    info@brightinventions.pl
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="column has-text-centered">
            <a href="/projects">
              <h4 className="subtitle is-size-4 has-text-weight-bold">
                our latest project
              </h4>
              <figure className="image">
                <img src="/images/Asset-7.svg" width="245" />
              </figure>
            </a>
          </div>

          <div className="column">
            <h4 className="subtitle is-size-4 has-text-weight-bold">
              services
            </h4>
            <p className="content">
              <a className="has-text-black-bis" href="/what-we-offer">
                web development
              </a>
            </p>
            <p className="content">
              <a className="has-text-black-bis" href="/what-we-offer">
                mobile development
              </a>
            </p>
            <p className="content">
              <a className="has-text-black-bis" href="/what-we-offer">
                consulting services
              </a>
            </p>
            <p className="content">
              <a className="has-text-black-bis" href="/what-we-offer">
                UX/UI design
              </a>
            </p>
          </div>

          <div className="column">
            <h4 className="subtitle is-size-4 has-text-weight-bold">sitemap</h4>
            <p className="content">
              <a className="has-text-black-bis" href="/about-us">
                about us
              </a>
            </p>
            <p className="content">
              <a className="has-text-black-bis" href="/what-we-offer">
                what we offer
              </a>
            </p>
            <p className="content">
              <a className="has-text-black-bis" href="/projects">
                projects
              </a>
            </p>
            <p className="content">
              <a className="has-text-black-bis" href="/career">
                career
              </a>
            </p>
            <p className="content">
              <a className="has-text-black-bis" href="/blog">
                blog
              </a>
            </p>
          </div>
        </div>
        <div className="columns">
          <div className="column">
            <a
              className="is-link"
              href="https://www.facebook.com/Bright.Inventions/"
            >
              <figure className="image is-32x32">
                <img src="/images/facebook.svg" className="social-icon" />
              </figure>
            </a>
          </div>
          <div className="column">
            <a className="is-link" href="https://twitter.com/BrightDevs">
              <figure className="image is-32x32">
                <img src="/images/twitter.svg" className="social-icon" />
              </figure>
            </a>
          </div>
          <div className="column">
            <a
              className="is-link"
              href="https://www.linkedin.com/company/bright-inventions/"
            >
              <figure className="image is-32x32">
                <img src="/images/linkedIn.svg" className="social-icon" />
              </figure>
            </a>
          </div>
          <div className="column">
            <a
              className="is-link"
              href="https://www.instagram.com/bright_inventions/"
            >
              <figure className="image is-32x32">
                <img src="/images/instagram.svg" className="social-icon" />
              </figure>
            </a>
          </div>
          <div className="column">
            <a className="is-link" href="https://github.com/bright">
              <figure className="image is-32x32">
                <img src="/images/GitHub.svg" className="social-icon" />
              </figure>
            </a>
          </div>
        </div>
        <div className="container has-text-centered">
          <h5>
            © {new Date().getFullYear()} Bright Inventions. All rights reserved.
          </h5>
          <a href="/privacy-policy" className="has-text-black-bis">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  )
}
