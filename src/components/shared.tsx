import React from "react"
import styled from "styled-components"

export const Button = styled.button`
  border: 1px solid black;
  background: white;
  font-family: titling-gothic-fb, sans-serif;
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0px;
  color: #000000;
  opacity: 1;
  padding: 0.5rem 1rem;
  font-size: 18px;
  cursor: pointer;
`
export const ButtonInverted = styled.button`
  border: 1px solid white;
  background: black;
  font-family: titling-gothic-fb, sans-serif;
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0px;
  color: #fff;
  opacity: 1;
  padding: 0.5rem 1rem;
  font-size: 18px;
  cursor: pointer;
`

export const SectionTitle = styled.h3`
  text-align: left;
  font-family: titling-gothic-fb, sans-serif;
  font-style: normal;
  font-weight: 700;
  letter-spacing: 0px;
  color: #000000;
  text-align: center;
  margin-bottom: 2em;
`

export const Section: React.FC<{ className?: string }> = ({
  className,
  children,
}) => {
  return (
    <section className={"hero " + (className || "")}>
      <div className="hero-body">
        <div className="container has-text-black">{children}</div>
      </div>
    </section>
  )
}
