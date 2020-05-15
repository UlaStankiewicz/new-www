import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import BackButton from "../components/subcomponents/BackButton"

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { markdownRemark } = data // data.markdownRemark holds your post data
  const { frontmatter: page, html } = markdownRemark
  return (
    <Layout>
      <div className="container">
        <article className="section">
          <h1 className="title has-text-dark has-text-weight-bold">
            {page.title}
          </h1>
          <div className="content">
            <h3 className="has-text-grey has-text-weight-bold">{page.hours}</h3>
            <h3 className="has-text-primary has-text-weight-bold">
              Salary: {page.salary}
            </h3>
          </div>
          <div className="content" dangerouslySetInnerHTML={{ __html: html }} />
          <div className="content">
            <a href="/apply-for-job" className="button is-primary">
              Apply
            </a>
          </div>
          <BackButton label="Open positions" url="/career#open-positions" />
        </article>
      </div>

      {/* <script type="application/ld+json">
    {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": "{{ page.title }}",
        "datePosted": "{{ site.time }}",
        "validThrough": "2021-12-31",
        "description": "{{ page.content | strip_html | smartify }}",
        "hiringOrganization": {
            "@type": "Organization",
            "name": "Bright Inventions",
            "sameAs": "https://brightinventions.pl/"
        },
        "industry": "Software",
        "employmentType": "{{ page.employment_type | default: 'OTHER' }}",
    {% if page.salary_min %}
        "baseSalary": {
          "@type": "MonetaryAmount",
          "currency": "PLN",
          "value": {
            "@type": "QuantitativeValue",
            "minValue": {{ page.salary_min }},
            "maxValue": {{ page.salary_max }},
            "unitText": "MONTH"
          }
        },
    {% endif %}
        "jobLocation": {
            "@type": "Place",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Matejki 12",
                "addressLocality": "Gdańsk",
                "postalCode": "80-232",
                "addressCountry": "PL",
"addressRegion": "pomorskie"
            }
        }
    }
</script>
 */}
    </Layout>
  )
}
export const pageQuery = graphql`
  query($fileAbsolutePath: String!) {
    markdownRemark(fileAbsolutePath: { eq: $fileAbsolutePath }) {
      html
      frontmatter {
        slug
        title
        description
      }
    }
  }
`
