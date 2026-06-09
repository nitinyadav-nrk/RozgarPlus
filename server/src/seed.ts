import bcrypt from "bcryptjs";
import { db, usersTable, jobsTable } from "./db";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Admin user
  const existing = await db.select().from(usersTable).where(eq(usersTable.email, "admin@jobnest.com"));
  if (existing.length === 0) {
    const hashed = await bcrypt.hash("admin123", 10);
    await db.insert(usersTable).values({
      name: "Admin",
      email: "admin@jobnest.com",
      phone: "+91 9000000000",
      password: hashed,
      role: "admin",
      isBlocked: false,
    });
    console.log("Created admin: admin@jobnest.com / admin123");
  } else {
    console.log("Admin already exists.");
  }

  // Regular user
  const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, "rahul@example.com"));
  if (existingUser.length === 0) {
    const hashed = await bcrypt.hash("user123", 10);
    await db.insert(usersTable).values({
      name: "Rahul Sharma",
      email: "rahul@example.com",
      phone: "+91 9876543210",
      password: hashed,
      role: "user",
      isBlocked: false,
    });
    console.log("Created user: rahul@example.com / user123");
  } else {
    console.log("Regular user already exists.");
  }

  // Sample jobs
  const existingJobs = await db.select().from(jobsTable);
  if (existingJobs.length === 0) {
    await db.insert(jobsTable).values([
      {
        title: "Frontend Developer",
        companyName: "TechCorp India",
        category: "Engineering",
        location: "Bangalore, Remote",
        type: "Full-time",
        salary: "₹8,00,000 - ₹14,00,000",
        applyFee: 99,
        shortDescription: "Build beautiful, responsive UIs with React and TypeScript for our SaaS platform.",
        fullDescription: "We are looking for a talented Frontend Developer.\n\nResponsibilities:\n- Develop and maintain React-based web applications\n- Collaborate with designers to implement pixel-perfect UIs\n- Optimize application performance and accessibility\n\nRequirements:\n- 2+ years of React experience\n- Strong TypeScript skills\n- Familiarity with REST APIs and React Query",
        skillsRequired: "React, TypeScript, Tailwind CSS, REST APIs",
        featured: true,
        status: "active" as const,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Backend Engineer",
        companyName: "Finova Solutions",
        category: "Engineering",
        location: "Mumbai",
        type: "Full-time",
        salary: "₹10,00,000 - ₹18,00,000",
        applyFee: 149,
        shortDescription: "Design and build scalable APIs and microservices for our fintech platform.",
        fullDescription: "Finova Solutions is hiring a Backend Engineer.\n\nResponsibilities:\n- Design RESTful APIs and GraphQL endpoints\n- Optimize database queries and schema design\n- Build secure payment processing flows\n\nRequirements:\n- 3+ years experience with Node.js\n- PostgreSQL expertise\n- Experience with AWS or GCP",
        skillsRequired: "Node.js, PostgreSQL, AWS, Docker, Redis",
        featured: true,
        status: "active" as const,
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Product Designer (UI/UX)",
        companyName: "DesignStudio Co.",
        category: "Design",
        location: "Remote",
        type: "Full-time",
        salary: "₹6,00,000 - ₹10,00,000",
        applyFee: 79,
        shortDescription: "Create intuitive user experiences for our suite of consumer and enterprise apps.",
        fullDescription: "We're looking for a Product Designer who obsesses over user experience.\n\nResponsibilities:\n- Create wireframes, prototypes, and high-fidelity designs in Figma\n- Conduct user research and usability tests\n- Work closely with engineers to deliver polished products\n\nRequirements:\n- 2+ years of product design experience\n- Strong Figma skills\n- Portfolio showing end-to-end design work",
        skillsRequired: "Figma, User Research, Prototyping, Design Systems",
        featured: false,
        status: "active" as const,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Digital Marketing Manager",
        companyName: "GrowthLab",
        category: "Marketing",
        location: "Delhi, Hybrid",
        type: "Full-time",
        salary: "₹5,00,000 - ₹9,00,000",
        applyFee: 59,
        shortDescription: "Lead our growth marketing efforts across SEO, SEM, social, and email channels.",
        fullDescription: "GrowthLab is looking for a Digital Marketing Manager.\n\nResponsibilities:\n- Own and execute performance marketing campaigns\n- Manage SEO strategy and content calendar\n- Analyze funnel metrics and optimize conversion rates\n\nRequirements:\n- 3+ years of digital marketing experience\n- Experience with Google Ads and Meta Ads\n- Strong analytical skills",
        skillsRequired: "Google Ads, SEO, Meta Ads, Analytics, Content Marketing",
        featured: false,
        status: "active" as const,
        expiresAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Data Analyst",
        companyName: "InsightAI",
        category: "Engineering",
        location: "Hyderabad",
        type: "Full-time",
        salary: "₹7,00,000 - ₹12,00,000",
        applyFee: 99,
        shortDescription: "Transform raw data into actionable insights to drive business decisions.",
        fullDescription: "InsightAI is seeking a Data Analyst.\n\nResponsibilities:\n- Build dashboards and reports in Metabase / Tableau\n- Write complex SQL queries for data extraction\n- Collaborate with product on A/B tests\n\nRequirements:\n- 2+ years of data analysis experience\n- Strong SQL and Python skills\n- Experience with BI tools",
        skillsRequired: "SQL, Python, Tableau, Statistics, Excel",
        featured: false,
        status: "active" as const,
        expiresAt: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Sales Development Representative",
        companyName: "CloudSales Inc.",
        category: "Sales",
        location: "Pune, Remote",
        type: "Full-time",
        salary: "₹4,00,000 - ₹7,00,000 + commission",
        applyFee: 49,
        shortDescription: "Drive top-of-funnel pipeline by qualifying leads and booking demos for our SaaS product.",
        fullDescription: "CloudSales Inc. is looking for a motivated SDR.\n\nResponsibilities:\n- Prospect and qualify inbound and outbound leads\n- Conduct discovery calls and schedule demos\n- Maintain accurate records in Salesforce CRM\n\nRequirements:\n- 1+ year of SDR/BDR experience\n- Excellent communication skills\n- Experience with Salesforce or HubSpot",
        skillsRequired: "Cold Calling, CRM, Lead Generation, Communication",
        featured: false,
        status: "active" as const,
        expiresAt: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
      },
      {
        title: "React Native Developer (Internship)",
        companyName: "MobileFirst",
        category: "Engineering",
        location: "Remote",
        type: "Internship",
        salary: "₹15,000 - ₹25,000/month",
        applyFee: 29,
        shortDescription: "Build cross-platform mobile apps and contribute to our open-source component library.",
        fullDescription: "MobileFirst is looking for a passionate React Native intern.\n\nResponsibilities:\n- Develop features for our React Native mobile app\n- Write unit tests and participate in code reviews\n- Contribute to our internal UI component library\n\nRequirements:\n- Basic React or React Native knowledge\n- Eagerness to learn and grow\n\nThis is a 3-month internship with possibility of full-time conversion.",
        skillsRequired: "React Native, JavaScript, Mobile Development",
        featured: true,
        status: "active" as const,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Product Manager",
        companyName: "BuildFast Ventures",
        category: "Product",
        location: "Bangalore",
        type: "Full-time",
        salary: "₹15,00,000 - ₹25,00,000",
        applyFee: 199,
        shortDescription: "Own the product roadmap for our B2B SaaS suite and drive cross-functional execution.",
        fullDescription: "BuildFast Ventures is hiring a senior PM.\n\nResponsibilities:\n- Define and prioritize product roadmap based on user research\n- Write detailed PRDs and work closely with engineering and design\n- Track KPIs and report to leadership\n\nRequirements:\n- 4+ years of product management experience\n- Strong technical background\n- Experience launching 0-to-1 products",
        skillsRequired: "Product Strategy, Roadmapping, Data Analysis, Stakeholder Management",
        featured: false,
        status: "active" as const,
        expiresAt: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
      },
      {
        title: "DevOps Engineer",
        companyName: "ScaleOps",
        category: "Engineering",
        location: "Remote",
        type: "Full-time",
        salary: "₹12,00,000 - ₹20,00,000",
        applyFee: 149,
        shortDescription: "Build and maintain our cloud infrastructure and CI/CD pipelines.",
        fullDescription: "ScaleOps is hiring a DevOps Engineer to keep our infrastructure running at scale.\n\nResponsibilities:\n- Manage Kubernetes clusters on AWS EKS\n- Build and maintain CI/CD pipelines with GitHub Actions\n- Monitor production systems with Datadog and PagerDuty\n- Drive infrastructure-as-code initiatives with Terraform\n\nRequirements:\n- 3+ years of DevOps/SRE experience\n- Strong AWS knowledge\n- Kubernetes and Docker expertise\n- Experience with Terraform or Pulumi",
        skillsRequired: "Kubernetes, AWS, Terraform, Docker, CI/CD, Linux",
        featured: false,
        status: "active" as const,
        expiresAt: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Content Writer",
        companyName: "ContentCraft",
        category: "Marketing",
        location: "Remote",
        type: "Part-time",
        salary: "₹25,000 - ₹45,000/month",
        applyFee: 29,
        shortDescription: "Create compelling blog posts, case studies, and marketing copy for B2B SaaS clients.",
        fullDescription: "ContentCraft is looking for a skilled Content Writer.\n\nResponsibilities:\n- Write SEO-optimised blog articles (2-3 per week)\n- Create case studies and whitepapers\n- Collaborate with clients on brand voice and messaging\n\nRequirements:\n- 2+ years of B2B content writing experience\n- Strong command of English\n- Familiarity with SEO best practices\n- Ability to research and simplify technical topics",
        skillsRequired: "Content Writing, SEO, Copywriting, Research",
        featured: false,
        status: "active" as const,
        expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Full Stack Developer",
        companyName: "Startup Hub",
        category: "Engineering",
        location: "Bangalore",
        type: "Full-time",
        salary: "₹9,00,000 - ₹15,00,000",
        applyFee: 99,
        shortDescription: "Work across the entire stack building features for our rapidly growing platform.",
        fullDescription: "Startup Hub is hiring a Full Stack Developer.\n\nResponsibilities:\n- Build features end-to-end from DB to UI\n- Work with React on the frontend and Node.js/Express on the backend\n- Participate in architecture decisions and code reviews\n\nRequirements:\n- 2+ years of full-stack experience\n- Proficiency in React and Node.js\n- SQL database experience\n- Strong problem solving skills",
        skillsRequired: "React, Node.js, PostgreSQL, TypeScript, REST APIs",
        featured: true,
        status: "active" as const,
        expiresAt: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
      },
      {
        title: "HR Business Partner",
        companyName: "PeopleFirst Corp",
        category: "Other",
        location: "Chennai",
        type: "Full-time",
        salary: "₹6,00,000 - ₹10,00,000",
        applyFee: 59,
        shortDescription: "Partner with business leaders to build a high-performance culture and support employee success.",
        fullDescription: "PeopleFirst Corp is looking for an HR Business Partner.\n\nResponsibilities:\n- Partner with 3-4 business units as strategic HR advisor\n- Drive talent acquisition, performance reviews, and L&D programs\n- Handle employee relations and conflict resolution\n- Analyse HR metrics and present insights to leadership\n\nRequirements:\n- 3+ years of HRBP experience\n- Strong knowledge of Indian labour laws\n- Excellent interpersonal and communication skills\n- SHRM or CIPD certification preferred",
        skillsRequired: "HR Strategy, Talent Management, Employee Relations, Labour Law",
        featured: false,
        status: "active" as const,
        expiresAt: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log("Inserted 12 sample jobs.");
  } else {
    console.log(`${existingJobs.length} jobs already exist, skipping.`);
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
