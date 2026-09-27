// ─────────────────────────────────────────────────────────────────────────────
// Oceanica Lifestyle — single source of site copy.
//
// RULE: only approved Oceanica content belongs here. Anything not yet verified
// is marked with pending(). Pending slots render as a discreet "copy pending"
// marker, are listed on every build, and make `npm run build:strict` fail, so
// nothing unverified can ship by accident.
//
// Provenance:
//   • All company copy (introduction, About, Vision, Mission, core values, Brand
//     Philosophy, Oceanica Skyline, leadership, contact details, consent wording,
//     RERA disclaimer, disclaimer, footer copyright) is verbatim from
//     "Oceanica Current Website Reference" (snapshot of brandniti5.com/projects/
//     oceanica/, captured 27 Sep 2026), supplied by the client.
//   • "Creating Landmarks / Bringing New Perspectives": from the supplied logo.
//   • Editorial headlines (e.g. "Ideas made tangible."): positioning lines
//     specified in the client brief. They make no factual claims.
// ─────────────────────────────────────────────────────────────────────────────

export const pending = (label, hint = '') => ({ pending: label, hint });

export const company = {
  name: 'Oceanica Lifestyle',
  legalName: 'Oceanica Lifestyle Pvt. Ltd.',
  city: 'Patna, Bihar',
  tagline: 'Creating Landmarks',
  taglineSecondary: 'Bringing New Perspectives',
  // Short description used in the footer and meta description.
  description: 'Oceanica Lifestyle is a new-age real estate developer with a bold vision for the future of Bihar.',
};

export const hero = {
  label: 'Oceanica Lifestyle',
  lines: ['Building', 'A Better Tomorrow.'],
  support: 'Creating landmarks. Bringing new perspectives.',
  cta: 'Discover Oceanica',
};

export const about = {
  label: 'About Oceanica',
  statement: 'Building spaces with purpose, foresight and lasting value.',
  sectionTitle: 'Building A Better Tomorrow',
  pageTitle: 'About Oceanica Lifestyle',
  // Home page shows the first two paragraphs; the About page shows all four.
  intro: [
    'Oceanica Lifestyle is a new-age real estate developer with a bold vision for the future of Bihar. Driven by the belief that better living begins with better thinking, we are committed to creating developments that bring together exceptional design, intelligent infrastructure, vibrant open spaces, and contemporary amenities. We approach every project with a quality-first mindset.',
    'Our broader aim is to shape distinctive environments that enrich everyday experiences, stand the test of time, and contribute meaningfully to the evolving urban landscape.',
    'Real estate is no longer defined by square footage and specifications alone. Today’s homebuyers are looking for developments that are better connected and designed around the way people actually live. Across India, technology is increasingly influencing the entire development lifecycle, from data-led planning and design optimisation to AI-enabled operations.',
    'Our aim is to combine this technological intelligence with human-centric planning to create developments that are future-ready by design and relevant for generations to come.',
  ],
  homeParagraphs: 2,
  imageCaption: 'Patna, Bihar — illustrative render',
};

export const brandStatement = {
  lines: ['We shape environments', 'designed around people,', 'progress and tomorrow.'],
};

export const vision = {
  title: 'Vision',
  label: 'Where we are headed',
  body: ['To be a global benchmark for creating spaces that make life better, today and for generations to come.'],
};

export const mission = {
  title: 'Mission',
  label: 'How we get there',
  body: [
    'To transform the built environment through the latest tech, cutting-edge design, and sustainable developments. To create a culture where the best minds come together, ideas converge, and expertise translates into exceptional spaces, experiences, and enduring value.',
  ],
};

// The current website lists the five values by name only, without descriptions.
// Add a `body` to any value if approved descriptions are supplied later.
export const values = {
  label: 'Core Values',
  statement: 'Five commitments that govern every decision.',
  items: [
    { name: 'Future-First Approach', image: 'aerial-patna-render' },
    { name: 'Design With Purpose', image: 'film-colonnade' },
    { name: 'People Before Projects', image: 'film-garden-fountain' },
    { name: 'No Compromise On Safety', image: 'film-fountain-plan' },
    { name: 'Do It Right Always', image: 'film-water-detail' },
  ],
};

export const philosophy = {
  label: 'Our Brand Philosophy',
  statement: ['Thinking beyond', 'the immediate.'],
  pageStatement: ['Thinking beyond', 'today.'],
  intro: [
    'We believe the finest developments are built on more than ambition. They are built on responsible choices. Ethical business practices, thoughtful decision-making, environmental consciousness, prudent risk management, and uncompromising health and safety form the foundation of everything we do. By bringing these principles together with innovation and excellence, we aspire to create developments that enrich lives and cause no harm to the planet.',
  ],
  principles: [
    { numeral: 'I', name: 'Think Beyond Today', image: 'aerial-patna-render',
      alt: 'Illustrative aerial render of Patna at dusk, the river and city extending to the horizon',
      body: 'We make decisions with tomorrow’s needs and challenges in mind.' },
    { numeral: 'II', name: 'Tread Lightly', image: 'film-garden-fountain',
      alt: 'A circular water feature set within clipped hedges and mature trees at sunset',
      body: 'We continuously seek smarter ways to reduce our environmental footprint and use resources responsibly.' },
    { numeral: 'III', name: 'Prepare For What’s Ahead', image: 'film-fountain-plan',
      alt: 'Overhead view of a precisely engineered circular fountain ringed with lights',
      body: 'We anticipate risks, build resilience, and plan for the unexpected.' },
    { numeral: 'IV', name: 'Create Lasting Value', image: 'film-water-wall',
      alt: 'A bronze-framed water wall standing in a landscaped courtyard at golden hour',
      body: 'We measure success not just by what we build, but by the positive difference it creates over time.' },
  ],
};

// Add further projects to this array; every listing adapts automatically.
export const projects = {
  label: 'Our Projects',
  statement: 'Ideas made tangible.',
  pageStatement: 'Ideas brought to life.',
  support: "Developments that bring Oceanica's philosophy into the built environment.",
  items: [
    {
      slug: 'oceanica-skyline',
      name: 'Oceanica Skyline',
      category: 'Residential',
      location: 'Patna, Bihar',
      status: 'Ongoing', // listed under "Ongoing Projects" on the current website
      image: 'projects-oceanica-skyline',
      imageAlt: 'Artist’s impression of Oceanica Skyline: tall residential towers above landscaped grounds',
      imageCaption: 'Artist’s impression',
      excerpt:
        'Rising as one of the tallest residential landmarks in Bihar and Jharkhand, this project brings together impressive stature, expansive open spaces and a future-ready lifestyle.',
      // The current website's description continues "Its strategic location ensures
      // seamless connectivity to key residential, commercial, educational," and is
      // cut off mid-sentence at source. That sentence is omitted until the
      // complete approved wording is supplied.
      description: [
        'Rising as one of the tallest residential landmarks in Bihar and Jharkhand, this project brings together impressive stature, expansive open spaces and a future-ready lifestyle. Residents here will enjoy a rare sense of space and greenery, complemented by futuristic amenities designed for contemporary living.',
      ],
      facts: [], // e.g. { label: 'RERA Registration', value: '…' } — verified facts only
    },
  ],
};

// Positioning synthesis — draws only on names of existing values and principles.
export const positioning = {
  label: 'The Oceanica Approach',
  statement: ['One philosophy,', 'consistently applied.'],
  pillars: [
    { name: 'Foresight', refs: ['Future-First Approach', 'Think Beyond Today', 'Prepare For What’s Ahead'] },
    { name: 'Design', refs: ['Design With Purpose', 'Create Lasting Value'] },
    { name: 'Responsibility', refs: ['People Before Projects', 'No Compromise On Safety', 'Tread Lightly', 'Do It Right Always'] },
  ],
};

export const leadership = {
  label: 'Our Leadership',
  statement: 'The people behind the work.',
  people: [
    {
      slug: 'capt-sanjeev-kumar',
      name: 'Capt. Sanjeev Kumar',
      role: 'Director, Oceanica Lifestyle',
      portrait: 'leadership-capt-sanjeev-kumar',
      bio: [
        'A technology-driven professional with extensive experience as a Master Mariner, Capt. Sanjeev Kumar brings a distinctive global perspective to Oceanica Lifestyle’s project development. His exposure to diverse cultures, international practices, and global standards enables him to bring a broader, future-focused outlook to every project. As a director, he plays a key role in strategic project planning, integrating advanced technologies and international benchmarks to create developments that are contemporary, intelligent, and future-ready. His focus on innovation and planning ensures that every aspect of the development is geared towards delivering a seamless and elevated user experience.',
      ],
    },
    {
      slug: 'capt-nirmal-kumar',
      name: 'Capt. Nirmal Kumar',
      role: 'Director, Oceanica Lifestyle',
      portrait: 'leadership-capt-nirmal-kumar',
      bio: [
        'With a distinguished career as a Master Mariner, his experience is shaped by years of navigating complex environments and working across diverse cultures. His deep understanding of the maritime community gives him valuable insight into the aspirations, lifestyles and expectations of modern mariners, allowing these perspectives to influence the project’s vision and development.',
        'As a Director, he plays a pivotal role in guiding the project from concept to execution, with a strong focus on quality, contemporary luxury and refined living experiences. His approach combines international exposure, disciplined leadership and a forward-looking mindset to create a development that is sophisticated, and thoughtfully designed around the people it serves.',
      ],
    },
    {
      slug: 'sweta-shekhar',
      name: 'Mrs. Sweta Shekhar',
      role: 'Director, Oceanica Lifestyle',
      portrait: 'leadership-sweta-shekhar',
      bio: [
        'An accomplished entrepreneur with a sharp understanding of business, markets, and changing consumer aspirations, Mrs. Sweta Shekhar brings a strong commercial perspective to Oceanica. Her experience across real estate and marketing enables her to recognise emerging opportunities, understand what discerning buyers value, and translate those insights into compelling development propositions.',
        'At Oceanica Lifestyle, she contributes to shaping the brand, its market presence, and the overall customer journey, ensuring that every project strikes the right balance between aspiration and value.',
      ],
    },
    {
      slug: 'thakur-nirmal-kumar-singh',
      name: 'Thakur Nirmal Kumar Singh',
      role: 'Project Director, Oceanica Lifestyle',
      portrait: null, // portrait to be supplied (the current website shows a silhouette)
      bio: [
        'With over 45 years of experience in building construction and project execution, Thakur Nirmal Kumar Singh brings exceptional depth of expertise to Oceanica Lifestyle.',
        'His distinguished career spans senior leadership roles across major public infrastructure and construction organisations, including the National Buildings Construction Corporation (NBCC) under the Ministry of Urban Development, Government of India, from where he retired as a Senior Executive Director after serving from 1982 to 2017. He also served as Project Director for the Indira Gandhi International Airport from 2018-2020. At present, he is the Director of Arcon Project Private Limited.',
        'Over the course of his career starting from 1982 till date, he has led the execution of projects ranging from ₹10 crore to ₹1,000 crore, managing over 200 projects across multiple locations and leading teams of more than 1,000 professionals across engineering, operations, finance, and administration. His expertise encompasses the entire project lifecycle, from conceptualisation and planning to execution and commissioning.',
        'His extensive experience in Patna includes overseeing significant developments such as the LGIMS campus, Patna Airports (prior to the new building), IIT Bihta, and ESLC Hospital Campus, Bihta. At Oceanica Lifestyle, his wealth of experience, engineering expertise, and execution-led approach provide a strong foundation for the Group’s growth.',
      ],
    },
  ],
};

export const contact = {
  label: 'Contact Us',
  statement: ['Begin a', 'Conversation.'],
  officeLabel: 'Corporate Address',
  address: '3rd Floor, Shanti Kunj, Saguna-Khagaul Main Road, Mustafapur, Patna, Bihar-801503, India',
  addressParts: { street: '3rd Floor, Shanti Kunj, Saguna-Khagaul Main Road, Mustafapur', locality: 'Patna', region: 'Bihar', postalCode: '801503', country: 'IN' },
  phone: '+91 61246 11487',
  phoneHref: '+916124611487',
  email: 'info@oceanica.co.in',
  emailHref: 'info@oceanica.co.in',
  mapEmbed: '', // optional Google Maps embed URL
  consent: 'By submitting details, I agree and authorize Oceanica Lifestyle Pvt. Ltd. to contact me. This will override the registry with DNC/NDNC.',
  subjects: ['General enquiry', 'Oceanica Skyline', 'Partnership', 'Other'],
};

export const closing = {
  lines: ['Designed for today.', 'Considered for tomorrow.'],
};

export const legal = {
  reraDisclaimer: [
    'The Real Estate (Regulation and Development) Act, 2016 has been introduced and the rules and regulations notified thereunder ("RERA") on 1st May 2017. The process of updating our website is being initiated to ensure full compliance with the law.',
    'The advertisements available on the website were created prior to RERA came into force and thus contains/may contain promotional material related to future phases of the project. The offerings outlined in those advertisements in whatever form may not be a part of the initial phase of the project and may be delivered in later phases or on completion of the Project.',
    'The present content on the website(s), specifications and amenities including but not limited to visuals, pictures, images/ renderings/maps are purely indicative and informative in nature and only an architect\'s impression and only indicative of the envisaged development and not actual depiction of buildings/landscapes etc. And shall not be considered as our offer/promise/commitment of any nature in respect of the project the same is subject to approval from local authorities.',
    'The common areas and amenities that have been shown in any advertisement, audio visuals and/or any type of communication in any form whatsoever is/are for the entire Project and not specific for any particular building or phase of the Project and that the common areas and amenities will not be available on completion of the first phase of the Project or later phases. The common areas and amenities shall be available for the entire project and will be developed in a phase-wise manner, over a period of time.',
    'The details of the projects undertaken by the company including the brochures, plans, elevations, images, projections, details, descriptions, contents pertaining to the projects are being modified in terms of the stipulations/ recommendations under the Real Estate Act 2016 and rules made thereunder (RERA).',
    'You are required to verify all the details, including area, amenities, services, terms of sales, payments and other relevant terms independently with the company sales team, by physically visiting the project site. Any decision regarding booking of the apartment/s in the project by you, until the project is registered under RERA, relying upon the contents of this website shall be solely at your costs and consequences. Oceanica Lifestyle Pvt. Ltd. and or its directors, employees, are not liable for any consequence of any action taken by the viewer relying on such material/information on this web.',
  ],
  generalDisclaimer: [
    'All the plans, designs, images, specifications, dimensions, facilities and other details herein are purely indicative in nature and the intended recipient should note that these are to be treated as purely provisional and informative and as such only tentative subject to the approval from respective authorities.',
    'The Sample/ Show Flats displayed in the website are only for the purpose of showcasing the potential of the flats after fitouts, while intimating the recipient hereof/intending Purchaser that the Flats proposed to be sold shall be subject to a variation of +/- 3%. It is also made clear that the images of sample/show flats are neither an offer nor a contract by the Developer/Co-Developer/Promoter to provide to the intending purchaser "furnished flats".',
    'The Amenities displayed in the website are also tentative and proposed, and subject to approval from the Competent Authorities, final list whereof shall be provided in the Agreement for Sale as and when executed. We reserve the right to modify / change / amend / alter any of the aforesaid in the best interest of the development without prior intimation / notice and without any obligation. The contents herein should not be construed as an offer / invitation to offer / contract.',
    'Any party desirous / interested in the project needs to enter into agreement for sale and the development / transaction shall be governed by the terms and conditions of the agreement for sale. The inter alia images, content herein is for illustrative and representational purposes only. Government Fees & Taxes are Extra (As Applicable), GST, Stamp Duty & Registration Charges as applicable, Other Charges Payable at the time of Possession, Conditions apply.',
  ],
};
