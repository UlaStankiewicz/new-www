import React from "react"
import { Helmet } from "react-helmet"
import "../styles/main.scss"
import { Footer } from "./subcomponents/Footer"
import { TopNavigation } from "./subcomponents/TopNavigation"

const Layout: React.FC = ({ children }) => {
  return (
    <>
      <Helmet>
        <title>Software Development Company</title>
        <meta
          name="description"
          content="The best custom software development company in Poland. Through mobile apps and complex backend systems to emerging technology solutions we are creating success stories for startups, consultancy agencies as well as mid-size organisations across multiple industries including FinTech, Blockchain, HealthTech, Retail, Logistics and more."
        />
      </Helmet>
      <TopNavigation />
      {children}
      <Footer />
      {/* {% include _footer.html %}
{% include _scripts.html %} */}
    </>
  )
}

export default Layout
