import React, { FC } from "react"
import { Button, Section, SectionTitle } from "../shared"
import styled from "styled-components"

const SectionDescription = styled.div`
  margin-bottom: 4em;
`

export interface ProductIdeaProps {}

const ProductIdea: FC<ProductIdeaProps> = props => {
  return (
    <Section className="has-background-primary has-text-centered columns">
      <SectionTitle className="is-size-3">
        let’s talk about your product idea
      </SectionTitle>
      <SectionDescription className="column is-8 is-offset-2 mb-6 has-text-left">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur.
      </SectionDescription>
      <Button className="has-background-primary">
        request a consulatation
      </Button>
    </Section>
  )
}

export default ProductIdea
