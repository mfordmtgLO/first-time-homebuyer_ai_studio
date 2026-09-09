import React, { useEffect } from 'react';
import { COUNTY_PARTNERS } from '../config/countyPartners';

interface SEOSchemaInjectorProps {
  currentCounty?: string;
  appName?: string;
}

export const SEOSchemaInjector: React.FC<SEOSchemaInjectorProps> = ({ 
  currentCounty = "Multnomah County", 
  appName = "GrantMatch Homebuyer" 
}) => {
  useEffect(() => {
    // Find the partner for the current county, default to the first one if not found
    const partner = COUNTY_PARTNERS.find(p => p.county.toLowerCase() === currentCounty.toLowerCase()) 
                 || COUNTY_PARTNERS[0];

    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${window.location.origin}/#website`,
          "url": window.location.origin,
          "name": appName,
          "description": "Local down payment grants, mortgage calculator, and homebuyer readiness tool."
        },
        {
          "@type": ["FinancialService", "MortgageBroker"],
          "@id": `${window.location.origin}/#mortgagebroker`,
          "name": "Mike Ford",
          "alternateName": "Mike Ford - Mortgage Loan Officer",
          "description": "Expert Mortgage Loan Officer specializing in First-Time Homebuyers and Down Payment Assistance Grants.",
          "areaServed": [
            {
              "@type": "AdministrativeArea",
              "name": "Oregon"
            },
            {
              "@type": "City",
              "name": "Portland"
            }
          ],
          "provider": {
            "@id": `${window.location.origin}/#website`
          }
        },
        {
          "@type": "RealEstateAgent",
          "@id": `${window.location.origin}/#realestateagent`,
          "name": partner.agentName,
          "description": `Local Real Estate Expert specializing in ${partner.county} for first-time buyers.`,
          "parentOrganization": {
            "@type": "Organization",
            "name": partner.agentBrokerage
          },
          "areaServed": {
            "@type": "AdministrativeArea",
            "name": partner.county
          },
          "knowsAbout": ["First-Time Homebuyers", "Offer Strategy", "Property Tours"]
        }
      ]
    };

    // Check if script already exists to avoid duplicates
    const scriptId = 'seo-schema-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    
    script.text = JSON.stringify(schema, null, 2);

    return () => {
      // Optional cleanup if component unmounts, though usually you want schema to persist
    };
  }, [currentCounty, appName]);

  return null;
};
