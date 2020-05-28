// ---
// layout: default
// title: Estimate a project
// description:
// redirect_from: ["/estimate", "/estimate/"]
// ---

import React, { useState, useCallback } from "react"
import Layout from "../components/layout"
import HelmetWrapper from "../components/subcomponents/HelmetWrapper"
import { sendMail, FormType } from "../helpers/mail"

const StartProjectPage: React.FC = () => {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
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
        phone: wrapValue(phone),
        message: wrapValue(message),
      },
      FormType.startAProject
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
    <Layout>
      <HelmetWrapper
        title="Estimate a project"
        description="Estimate your project based on a description and technologies"
      />
      <section className="section">
        <div className="container">
          <h1 className="title has-text-dark">Estimate your project</h1>
          <form
            data-form-type="start-a-project"
            action="#"
            onSubmit={onFormSubmit}
          >
            <div className="field">
              <label className="label">Name</label>
              <div className="control">
                <input
                  className="input"
                  type="text"
                  maxLength={256}
                  name="name"
                  placeholder="i.e. Aretha Franklin"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Email</label>
              <div className="control">
                <input
                  type="email"
                  className="input"
                  maxLength={256}
                  name="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Phone Number</label>
              <div className="control">
                <input
                  type="tel"
                  className="input"
                  maxLength={256}
                  name="phone"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+48 100 200 300"
                />
              </div>
            </div>
            <div className="field">
              <label className="label">Project description</label>
              <div className="control">
                <textarea
                  name="message"
                  maxLength={5000}
                  placeholder="Description of your project idea"
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
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
                  disabled={
                    !(checkedRules && name && email && message && phone)
                  }
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

export default StartProjectPage
