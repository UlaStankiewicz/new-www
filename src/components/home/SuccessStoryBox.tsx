import React, { FC } from "react"
import styled from "styled-components"

const Container = styled.div`
  border: 1px solid #d3d3d3;
  width: 100%;
  height: 400px;
  padding: 2em;
`

const Title = styled.h3`
  text-align: center;
  font-family: titling-gothic-fb, sans-serif;
  font-style: normal;
  color: black;
`

export interface SuccessStoryBoxProps {
  image: string
  title: string
}

const SuccessStoryBox: FC<SuccessStoryBoxProps> = props => {
  return (
    <Container>
      <Title>{props.title}</Title>
    </Container>
  )
}

export default SuccessStoryBox
