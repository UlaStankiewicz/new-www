import React from "react"
import { Section, SectionTitle, Button } from "../shared"
import SuccessStoryBox from "./SuccessStoryBox"

const SuccessStories: React.FC = () => {
  return (
    <Section>
      <SectionTitle className="is-size-3">success stories</SectionTitle>
      <div className="columns is-multiline">
        <div className="column is-6">
          <SuccessStoryBox title="Meds administration app vCare" />
        </div>
        <div className="column is-6">
          <SuccessStoryBox title="Fair organising app" />
        </div>
        <div className="column is-6">
          <SuccessStoryBox title="Steel industry app" />
        </div>
        <div className="column is-6">
          <SuccessStoryBox title="Emergency app Smarthelp" />
        </div>
        <div className="column is-6">
          <SuccessStoryBox title="Humanitarian help app" />
        </div>
        <div className="column is-6">
          <SuccessStoryBox title="Questionaire app" />
        </div>
        <div className="column is-full has-text-centered">
          <Button>more stories</Button>
        </div>
      </div>
    </Section>
  )
}

export default SuccessStories
