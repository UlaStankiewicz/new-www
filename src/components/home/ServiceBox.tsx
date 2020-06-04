import React from "react"
import styled from "styled-components"

const Container = styled.div`
  padding: 4rem;
`

const ServiceBoxIcon = styled.div`
  text-align: center;
`

const ServiceBoxTitle = styled.div`
  text-align: center;
  font-family: titling-gothic-fb, sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 1.2rem;
  letter-spacing: 0px;
  color: #000000;
  margin: 1em 0 2em;
`

const ServiceBoxDescription = styled.div`
  text-align: left;
  font-family: "Lato", sans-serif;
  font-size: 1rem;
  letter-spacing: 0px;
  color: #000000;
  opacity: 0.75;
`

const ServiceBox: React.FC<{
  title: string
  description: string
  icon: JSX.Element
}> = ({ icon, title, description }) => {
  return (
    <Container>
      <ServiceBoxIcon>{icon}</ServiceBoxIcon>
      <ServiceBoxTitle>{title}</ServiceBoxTitle>
      <ServiceBoxDescription>{description}</ServiceBoxDescription>
    </Container>
  )
}

export default ServiceBox
