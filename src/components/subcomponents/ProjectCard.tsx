import React from "react"

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

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  console.log(project)
  return (
    <div className="card project-card">
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
    </div>
  )
}

export default ProjectCard
