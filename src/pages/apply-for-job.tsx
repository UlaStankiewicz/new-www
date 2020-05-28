import React, { useState, useRef } from "react"
import Layout from "../components/layout"
import BackButton from "../components/subcomponents/BackButton"
import { sendMail, FormType } from "../helpers/mail"

const ApplyForJobPage: React.FC = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [checkedRules, setCheckedRules] = useState(false)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [fileName, setFileName] = useState("")

  const fileRef = useRef<HTMLInputElement>()

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
        cv: {
          value: fileRef.current.files[0],
          fileName: fileRef.current.files[0].name,
        },
      },
      FormType.job
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

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.files[0].name)
  }

  return (
    <Layout>
      <div className="container">
        <form className="section" data-form-type="job" onSubmit={onFormSubmit}>
          <div className="field">
            <label className="label">Name</label>
            <div className="control">
              <input
                className="input"
                type="text"
                placeholder="e.g Alex Smith"
                name="name"
                value={name}
                onChange={e => setName(e.target.value)}
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
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                value={message}
                onChange={e => setMessage(e.target.value)}
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
                  onChange={onFileUpload}
                  ref={fileRef}
                />
                <span className="file-cta">
                  <span className="file-icon">📄</span>
                  <span className="file-label">Upload CV</span>
                </span>
                <span className="file-name">{fileName}</span>
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
                onChange={e => setCheckedRules(e.currentTarget.checked)}
                checked={checkedRules}
              />
              &nbsp; I accept the{" "}
              <a href="/privacy-policy" target="_blank">
                Privacy Policy
              </a>
            </label>
          </div>

          <div className="field">
            <input
              type="submit"
              className="button is-primary"
              value="Submit"
              disabled={!(checkedRules && name && email && message)}
            />
            {success && (
              <p className="help is-success">
                Thank you! Your submission has been received!
              </p>
            )}
            {error && (
              <p className="help is-danger">
                Oops! Something went wrong while submitting the form.
              </p>
            )}
          </div>
          <BackButton label="Open positions" url="/career#open-positions" />
        </form>
      </div>
    </Layout>
  )
}

export default ApplyForJobPage
