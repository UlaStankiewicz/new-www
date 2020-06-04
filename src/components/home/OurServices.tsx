import React from "react"
import BlockchainIcon from "../../assets/blockchain.svg"
import MobileAppDevelopmentIcon from "../../assets/mobileAppDevelopment.svg"
import ProductDesignIcon from "../../assets/productDesign.svg"
import WebDevelopmentIcon from "../../assets/webDevelopment.svg"
import { Button, Section, SectionTitle } from "../shared"
import ServiceBox from "./ServiceBox"

const OurServices: React.FC = () => {
  return (
    <Section>
      <SectionTitle className="is-size-3">our services</SectionTitle>
      <div className="columns is-multiline">
        <div className="column is-half">
          <ServiceBox
            icon={<WebDevelopmentIcon />}
            title="web development"
            description="In our projects we rely on a rich technology stack including JavaScript, CSS. HTML, Java, Node.js, AWS, MySQL, PostgreSQL and more."
          />
        </div>
        <div className="column is-half">
          <ServiceBox
            icon={<MobileAppDevelopmentIcon />}
            title="mobile app development"
            description="Our app development team with a perfect command of Swift as well as Java and Kotlin offers native mobile development for iOS and Android."
          />
        </div>
        <div className="column is-half">
          <ServiceBox
            icon={<ProductDesignIcon />}
            title="product design"
            description="Our design team can help your idea come into being with the most impactful practices and tech tools."
          />
        </div>
        <div className="column is-half">
          <ServiceBox
            icon={<BlockchainIcon />}
            title="blockchain"
            description="In many our projects we use blockchain technology, which ensures the best safety practices bla bla bla"
          />
        </div>
        <div className="column is-full has-text-centered">
          <Button>learn more</Button>
        </div>
      </div>
    </Section>
  )
}

export default OurServices
