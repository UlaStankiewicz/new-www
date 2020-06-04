import React from "react"
import { Section, SectionTitle, Button } from "../shared"

const SuccessStories: React.FC = () => {
  return (
    <Section>
      <SectionTitle className="is-size-3">success stories</SectionTitle>
      <div className="columns is-multiline">
        <div className="column is-full has-text-centered">
          <Button>more stories</Button>
        </div>
      </div>
    </Section>
  )
}

export default SuccessStories
