// ─────────────────────────────────────────────────────────────────────────────
// Oceanica Lifestyle — single source of site copy.
//
// RULE: only approved Oceanica content belongs here. Anything not yet verified
// from the existing website is marked with pending(). Pending slots render as a
// discreet "copy pending" marker, are listed on every build, and make
// `npm run build:strict` fail, so nothing unverified can ship by accident.
//
// Provenance of what IS filled in:
//   • Leadership names, titles and biographies: transcribed verbatim from the
//     existing website (screenshots supplied by the client).
//   • Oceanica Skyline description: verbatim from the existing website.
//   • "Creating Landmarks / Bringing New Perspectives": from the supplied logo.
//   • Core value and philosophy principle names, "Building A Better Tomorrow":
//     as listed by the client from the existing website.
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
  description: pending(
    'Short corporate description',
    'One or two sentences from the existing company introduction.'
  ),
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
  // Full company introduction, one string per paragraph.
  intro: [
    pending('Company introduction — paragraph 1', 'Opening paragraph of "About Oceanica" on the existing website.'),
    pending('Company introduction — continued', 'Remaining About / "Building A Better Tomorrow" paragraphs, verbatim.'),
  ],
  imageCaption: 'Patna, Bihar — illustrative render',
};

export const brandStatement = {
  lines: ['We shape environments', 'designed around people,', 'progress and tomorrow.'],
};

export const vision = {
  title: 'Vision',
  label: 'Where we are headed',
  body: [pending('Vision statement', 'Full approved Vision copy from the existing website.')],
};

export const mission = {
  title: 'Mission',
  label: 'How we get there',
  body: [pending('Mission statement', 'Full approved Mission copy from the existing website.')],
};

export const values = {
  label: 'Core Values',
  statement: 'Five commitments that govern every decision.',
  items: [
    { name: 'Future-First Approach', image: 'aerial-patna-render',
      body: pending('Description', 'Existing description of "Future-First Approach".') },
    { name: 'Design With Purpose', image: 'film-colonnade',
      body: pending('Description', 'Existing description of "Design With Purpose".') },
    { name: 'People Before Projects', image: 'film-garden-fountain',
      body: pending('Description', 'Existing description of "People Before Projects".') },
    { name: 'No Compromise On Safety', image: 'film-fountain-plan',
      body: pending('Description', 'Existing description of "No Compromise On Safety".') },
    { name: 'Do It Right Always', image: 'film-water-detail',
      body: pending('Description', 'Existing description of "Do It Right Always".') },
  ],
};

export const philosophy = {
  label: 'Our Philosophy',
  statement: ['Thinking beyond', 'the immediate.'],
  pageStatement: ['Thinking beyond', 'today.'],
  intro: [pending('Brand Philosophy introduction', 'Full Brand Philosophy copy from the existing website.')],
  principles: [
    { numeral: 'I', name: 'Think Beyond Today', image: 'aerial-patna-render',
      alt: 'Illustrative aerial render of Patna at dusk, the river and city extending to the horizon',
      body: pending('Principle description', 'Existing copy for "Think Beyond Today".') },
    { numeral: 'II', name: 'Tread Lightly', image: 'film-garden-fountain',
      alt: 'A circular water feature set within clipped hedges and mature trees at sunset',
      body: pending('Principle description', 'Existing copy for "Tread Lightly".') },
    { numeral: 'III', name: "Prepare For What's Ahead", image: 'film-fountain-plan',
      alt: 'Overhead view of a precisely engineered circular fountain ringed with lights',
      body: pending('Principle description', 'Existing copy for "Prepare For What\'s Ahead".') },
    { numeral: 'IV', name: 'Create Lasting Value', image: 'film-water-wall',
      alt: 'A bronze-framed water wall standing in a landscaped courtyard at golden hour',
      body: pending('Principle description', 'Existing copy for "Create Lasting Value".') },
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
      status: null, // add only when verified
      image: 'projects-oceanica-skyline',
      imageAlt: 'Artist’s impression of Oceanica Skyline: tall residential towers above landscaped grounds',
      imageCaption: 'Artist’s impression',
      excerpt:
        'Rising as one of the tallest residential landmarks in Bihar and Jharkhand, this project brings together impressive stature, expansive open spaces and a future-ready lifestyle.',
      description: [
        'Rising as one of the tallest residential landmarks in Bihar and Jharkhand, this project brings together impressive stature, expansive open spaces and a future-ready lifestyle. Residents here will enjoy a rare sense of space and greenery, complemented by futuristic amenities designed for contemporary living.',
        pending(
          'Location sentence — complete',
          'The existing website truncates this sentence: "Its strategic location ensures seamless connectivity to key residential, commercial, educational, …". Supply the full sentence.'
        ),
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
    { name: 'Foresight', refs: ['Future-First Approach', 'Think Beyond Today', "Prepare For What's Ahead"] },
    { name: 'Design', refs: ['Design With Purpose', 'Create Lasting Value'] },
    { name: 'Responsibility', refs: ['People Before Projects', 'No Compromise On Safety', 'Tread Lightly', 'Do It Right Always'] },
  ],
};

export const leadership = {
  label: 'Leadership',
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
        'With a distinguished career as a Master Mariner, his experience is shaped by years of navigating complex environments and working across diverse cultures. His deep understanding of the maritime community gives him valuable insight into the aspirations, lifestyles and expectations of modern mariners, allowing these perspectives to influence the project’s vision and development. As a Director, he plays a pivotal role in guiding the project from concept to execution, with a strong focus on quality, contemporary luxury and refined living experiences. His approach combines international exposure, disciplined leadership and a forward-looking mindset to create a development that is sophisticated, and thoughtfully designed around the people it serves.',
      ],
    },
    {
      slug: 'sweta-shekhar',
      name: 'Mrs. Sweta Shekhar',
      role: 'Director, Oceanica Lifestyle',
      portrait: 'leadership-sweta-shekhar',
      bio: [
        'An accomplished entrepreneur with a sharp understanding of business, markets, and changing consumer aspirations, Mrs. Sweta Shekhar brings a strong commercial perspective to Oceanica. Her experience across real estate and marketing enables her to recognise emerging opportunities, understand what discerning buyers value, and translate those insights into compelling development propositions. At Oceanica Lifestyle, she contributes to shaping the brand, its market presence, and the overall customer journey, ensuring that every project strikes the right balance between aspiration and value.',
      ],
    },
    {
      slug: 'thakur-nirmal-kumar-singh',
      name: 'Thakur Nirmal Kumar Singh',
      role: 'Project Director, Oceanica Lifestyle',
      portrait: null, // portrait to be supplied
      bio: [
        'With over 45 years of experience in building construction and project execution, Thakur Nirmal Kumar Singh brings exceptional depth of expertise to Oceanica Lifestyle.',
        'His distinguished career spans senior leadership roles across major public infrastructure and construction organisations, including the National Buildings Construction Corporation (NBCC) under the Ministry of Urban Development, Government of India, from where he retired as a Senior Executive Director after serving from 1982 to 2017. He also served as Project Director for the Indira Gandhi International Airport from 2018-2020. At present, he is the Director of Arcon Project Private Limited.',
        'Over the course of his career starting from 1982 till date, he has led the execution of projects ranging from ₹10 crore to ₹1,000 crore, managing over 200 projects across multiple locations and leading teams of more than 1,000 professionals across engineering, operations, finance, and administration. His expertise encompasses the entire project lifecycle, from conceptualisation and planning to execution and commissioning.',
        'His extensive experience in Patna includes overseeing significant developments such as the LGIMS campus, Patna Airports (prior to the new building), IIT Bihta, and ESLC Hospital Campus, Bihta. At Oceanica Lifestyle, his wealth of experience, engineering expertise, and execution-led approach provide a strong foundation for the Group\'s growth.',
      ],
    },
  ],
};

export const contact = {
  label: 'Contact',
  statement: ['Begin a', 'Conversation.'],
  officeLabel: 'Corporate Office',
  address: pending('Corporate office address', 'Verify against the existing website before launch.'),
  phone: pending('Phone', 'Verify against the existing website.'),
  phoneHref: '', // e.g. '+91XXXXXXXXXX'
  email: pending('Email', 'Verify against the existing website.'),
  emailHref: '',
  mapEmbed: '', // optional Google Maps embed URL once the address is confirmed
  consent: pending('Enquiry consent wording', 'The consent line shown beside the existing enquiry form.'),
  subjects: ['General enquiry', 'Oceanica Skyline', 'Partnership', 'Other'],
};

export const closing = {
  lines: ['Designed for today.', 'Considered for tomorrow.'],
};

export const legal = {
  reraDisclaimer: [pending('RERA disclaimer', 'Full RERA disclaimer from the existing website, verbatim.')],
  generalDisclaimer: [pending('General disclaimer', 'Full website disclaimer from the existing website, verbatim.')],
  privacy: [pending('Privacy policy', 'Privacy policy text, if the existing website carries one.')],
  footerNote: pending('Footer legal line', 'Any registration / RERA line shown in the existing footer.'),
};
