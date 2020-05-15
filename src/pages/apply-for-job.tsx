import React from "react"
import Layout from "../components/layout"
import BackButton from "../components/subcomponents/BackButton"

const ApplyForJobPage = () => {
  return (
    <Layout>
      <div className="container">
        <form className="section" data-form-type="job">
          <div className="field">
            <label className="label">Name</label>
            <div className="control">
              <input
                className="input"
                type="text"
                placeholder="e.g Alex Smith"
                name="name"
                maxLength={256}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Email</label>
            <div className="control">
              <input
                className="input"
                type="email"
                placeholder="e.g. alexsmith@gmail.com"
                name="email"
                maxLength={256}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Message</label>
            <div className="control">
              <textarea
                className="textarea"
                placeholder="Your message"
                maxLength={5000}
                name="message"
                required
              ></textarea>
            </div>
          </div>

          <div className="field">
            <div className="file has-name">
              <label className="file-label">
                <input
                  className="file-input"
                  type="file"
                  name="cv"
                  accept=".pdf"
                />
                <span className="file-cta">
                  <span className="file-icon">📄</span>
                  <span className="file-label">Upload CV</span>
                </span>
                <span className="file-name" />
              </label>
            </div>
            <p className="help">Max file size 10MB.</p>
          </div>

          <div className="field">
            <label className="checkbox">
              <input
                type="checkbox"
                name="accept-policy"
                required
                value="yes"
              />
              I accept the{" "}
              <a href="/privacy-policy" target="_blank">
                Privacy Policy
              </a>
            </label>
          </div>

          <div className="field">
            <input type="submit" className="button is-primary" value="Submit" />
            <p className="help is-success form-success">
              Thank you! Your submission has been received!
            </p>
            <p className="help is-danger form-error">
              Oops! Something went wrong while submitting the form.
            </p>
          </div>
          <BackButton label="Open positions" url="/career#open-positions" />
        </form>
      </div>
    </Layout>
  )
}

export default ApplyForJobPage
