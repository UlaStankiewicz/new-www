import React from "react"
import styled from "styled-components"

export interface ProjectGraphql {
  title: string
  slug: string
  image: string
  layout: string
  published: string
}

interface ProjectCardProps {
  project: ProjectGraphql
}

const Container = styled.div`
  height: 100%;
  margin-bottom: 4em;
  box-shadow: none;
`

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Container className="card">
      <div className="card-content has-text-centered">
        <a href={project.slug}>
          <figure className="image is-inline-block">
            <img src={project.image} alt={project.title} />
          </figure>
          <h2 className="is-size-5 has-text-black has-text-weight-bold">
            {project.title}
          </h2>
        </a>
      </div>
    </Container>
  )
}

export default ProjectCard
