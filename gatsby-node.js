/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

// You can delete this file if you're not using it
exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const preparePage = async (layout, path, template) => {
    const result = await graphql(`
      {
        allMarkdownRemark(
          filter: {
            frontmatter: { layout: { eq: "${layout}" } }
          }
          limit: 1000
        ) {
          edges {
            node {
              frontmatter {
                slug
              }
              fileAbsolutePath
            }
          }
        }
      }
    `)

    // Handle errors
    if (result.errors) {
      reporter.panicOnBuild(`Error while running GraphQL query.`)
      return
    }
    console.log(result.data.allMarkdownRemark.edges)
    result.data.allMarkdownRemark.edges.forEach(({ node }) => {
      const name = node.fileAbsolutePath.split("/").pop().replace(".md", "")
      console.log(path + "/" + name)
      createPage({
        path: path + "/" + name,
        component: template,
        context: {
          // additional data can be passed via context
          fileAbsolutePath: node.fileAbsolutePath,
        },
      })
    })
  }
  const projectTemplate = require.resolve(
    `${__dirname}/src/templates/ProjectTemplate.tsx`
  )
  await preparePage("project", "projects", projectTemplate)
  const jobTemplate = require.resolve(
    `${__dirname}/src/templates/JobTemplate.tsx`
  )
  await preparePage("job", "jobs", jobTemplate)
}
