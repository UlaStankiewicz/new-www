import React, { FC } from "react"
import styled from "styled-components"
import { Section } from "../shared"

const ClutchContainer = styled.div``

export interface ClutchInfoProps {}

const ClutchInfo: FC<ClutchInfoProps> = props => {
  return (
    <Section>
      <ClutchContainer className="columns">
        <div className="column">
          <img src="/images/clutch/Poland_B2B_Companies_2019.png" />
        </div>
        <div className="column">
          <img src="/images/clutch/App-Developers-for-Startups-2019.png" />
        </div>
        <div className="column">
          <img src="/images/clutch/Developers_Poland_2018.png" />
        </div>
        <div className="column">
          <img src="/images/clutch/Web_Developers_Poland_2018.png" />
        </div>
        <div className="column">
          <img src="/images/clutch/appfutura-badge.png" />
        </div>
      </ClutchContainer>
    </Section>
  )
}

export default ClutchInfo
