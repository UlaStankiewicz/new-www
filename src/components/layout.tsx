import React from "react"
import "../styles/main.scss"
import { Footer } from "./subcomponents/Footer"
import HelmetWrapper from "./subcomponents/HelmetWrapper"
import { TopNavigation } from "./subcomponents/TopNavigation"

const Layout: React.FC<{ className?: string }> = ({ children, className }) => {
  return (
    <div className={"layout-container " + className}>
      <HelmetWrapper
        title="Software Development Company"
        description="The best custom software development company in Poland. Through mobile apps and complex backend systems to emerging technology solutions we are creating success stories for startups, consultancy agencies as well as mid-size organisations across multiple industries including FinTech, Blockchain, HealthTech, Retail, Logistics and more."
      />
      <TopNavigation />
      {children}
      <Footer />
      {/* {% include _footer.html %}
{% include _scripts.html %} */}
    </div>
  )
}

export default Layout
