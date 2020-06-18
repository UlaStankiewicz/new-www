import React, { FC } from "react"
import { Section, SectionTitle, Button } from "../shared.tsx"
import { ButtonInverted } from "../shared"

export interface CocoaheadsProps {}

const Cocoaheads: FC<CocoaheadsProps> = props => {
  return (
    <Section className="has-background-black has-text-centered">
      <SectionTitle className="is-size-3 has-text-white">
        we are a co-host of the Cocoaheads Tricity
      </SectionTitle>
      <ButtonInverted>when is next meeting?</ButtonInverted>
    </Section>
  )
}

export default Cocoaheads
