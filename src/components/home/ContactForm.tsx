import React, { FC, useState } from "react"
import { Section, SectionTitle, Button } from "../shared"
import { sendMail, FormType } from "../../helpers/mail"

export interface ContactFormProps {}

const ContactForm: FC<ContactFormProps> = props => {
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
    <Section>
      <SectionTitle className="is-size-3">get in touch</SectionTitle>
      <div className="columns">
        <div className="column is-6 is-offset-3">
          <form data-form-type="contact" action="#" onSubmit={onFormSubmit}>
            <div className="field">
              <div className="control">
                <input
                  className="input"
                  type="text"
                  maxLength={256}
                  name="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Name"
                  required
                />
              </div>
            </div>
            <div className="field">
              <div className="control">
                <input
                  type="email"
                  className="input"
                  maxLength={256}
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                />
              </div>
            </div>
            <div className="field">
              <div className="control">
                <textarea
                  name="message"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={5000}
                  placeholder="Message"
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
              <div className="control has-text-centered">
                <Button
                  type="submit"
                  disabled={!(checkedRules && name && email && message)}
                >
                  submit
                </Button>
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
      </div>
    </Section>
  )
}

export default ContactForm
