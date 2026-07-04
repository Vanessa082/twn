const fs = require("node:fs");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

// 1. Parse .env.local manually without dotenv dependency
const envPath = path.join(__dirname, "../.env.local");
if (!fs.existsSync(envPath)) {
  console.error("Error: .env.local file not found. Please create it first.");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
// Use Service Role Key to bypass RLS policies
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env.local."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const articles = [
  {
    title: "The Architecture of Scale: Redefining Tech Ecosystems",
    slug: "architecture-of-scale-redefining-tech-ecosystems",
    excerpt:
      "Exploring the fundamentals of software architecture, engineering standards, and scaling digital frameworks for sustainable high-traffic operations.",
    content: `
      <h2>The Foundation of Modern Scaling</h2>
      <p>Building high-performance software systems requires moving beyond simple compute scaling. It demands a structured approach to modular services, caching strategies, and robust data persistence. When we look at modern web systems, the bottleneck is rarely CPU or memory—it is almost always data access, state transitions, and connection pooling.</p>
      
      <h2>Decoupling and Message Streams</h2>
      <p>To eliminate cascading failures, engineering leaders must prioritize decoupling critical services. Event-driven message buses like Apache Kafka or RabbitMQ act as shock absorbers, ensuring that a surge of incoming user registration requests does not overwhelm payment or user-profiling services.</p>
      
      <blockquote>
        "The best system is a decoupled system, where failure in one domain does not cause downstream catastrophy."
      </blockquote>

      <h2>Designing for High Trust</h2>
      <p>Finally, scale without security is a liability. Incorporating proper SSL encryption, strict Content Security Policies (CSP), and role-based access control (RBAC) at the network border ensures the system remains resilient, predictable, and trusted by its users.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200",
    category: "technology",
    status: "published",
    published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
  {
    title: "Mentorship Beyond Code: Nurturing the Next Generation",
    slug: "mentorship-beyond-code-nurturing-next-generation",
    excerpt:
      "True leadership in engineering isn't about writing the most lines of code. It's about coaching teams, building trust, and creating space for developers to excel.",
    content: `
      <h2>The Shift from Maker to Manager</h2>
      <p>The journey from individual contributor (IC) to tech lead involves a fundamental shift in perspective. Your success is no longer measured by your direct code output, but by the force multiplier effect you have on your team. Mentorship is the primary vehicle for this leverage.</p>

      <h2>Creating Psychological Safety</h2>
      <p>Developers who feel safe to fail are developers who innovate. Code reviews should be collaborative design discussions rather than pedantic formatting checks. When a production failure occurs, lead with a blameless post-mortem to analyze the root cause instead of seeking scapegoats.</p>

      <h2>Designing Growth Paths</h2>
      <p>Help junior developers set clear, actionable milestones. Provide opportunities for them to own minor features from inception to deployment. Your role is not to dictate the solutions, but to ask clarifying questions that guide them toward the correct architectural choices.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?q=80&w=1200",
    category: "leadership",
    status: "published",
    published_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Continuous Growth: The Life of a Lifelong Learner",
    slug: "continuous-growth-life-of-lifelong-learner",
    excerpt:
      "In the rapidly evolving world of technology, learning is not a phase—it is a perpetual state. Exploring tools, reading resources, and retaining tech concepts.",
    content: `
      <h2>Embracing the Growth Mindset</h2>
      <p>The tech stack you use today will likely look different in five years. If you rely solely on your current knowledge, you risk obsolescence. Embracing a growth mindset means viewing new technologies not as obstacles, but as opportunities to expand your analytical toolbox.</p>

      <h2>The Feynman Technique for Engineers</h2>
      <p>The best way to verify if you truly understand a technical concept is to explain it to someone else in plain language. Technical writing, blogging, and internal tech talks are excellent ways to solidify your knowledge. If you can explain Next.js hydration to a non-technical manager, you have mastered it.</p>

      <h2>Building a Curated Information Stream</h2>
      <p>Filter out the noise. Instead of chasing every single framework update on social media, focus on fundamental engineering blogs, RFC papers, and deep-dive newsletters. Prioritize core concepts like network protocols, concurrency models, and database internals over superficial syntax changes.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200",
    category: "learning",
    status: "published",
    published_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Collaborative Code: Building Open Source Communities",
    slug: "collaborative-code-building-open-source-communities",
    excerpt:
      "A deep dive into why open source contribution is the ultimate collaborative workspace, and how tech groups create global, inclusive ecosystems.",
    content: `
      <h2>The Global Tech Commons</h2>
      <p>Open source software is the foundation of the modern internet. Contributing to public codebases is not just a way to build a portfolio—it is an exercise in global collaboration, code standard compliance, and distributed team synchronization.</p>

      <h2>Overcoming the Imposter Barrier</h2>
      <p>You do not need to be a seasoned software architect to contribute to open source. Documentation updates, bug reports, localization, and automated tests are highly valued contributions that help maintain ecosystem health. Start small by fixing typos or resolving open issues in utility packages.</p>

      <h2>Best Practices for Maintainers</h2>
      <p>If you run a repository, establish a clear code of conduct, descriptive pull request templates, and comprehensive contribution guides. Automating lint checks and unit tests via CI/CD workflows ensures that contributors receive immediate feedback without manual reviewer bottlenecks.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200",
    category: "community",
    status: "published",
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Reflections on Tech, Society, and African Engineering",
    slug: "reflections-on-tech-society-and-african-engineering",
    excerpt:
      "Analysing the unique constraints and high-impact solutions emerging from the African developer landscape, and the intersection of code and culture.",
    content: `
      <h2>Building under Unique Constraints</h2>
      <p>African developers regularly build for environments with high data costs, intermittent electrical grids, and variable device capabilities. These constraints force engineers to prioritize lightweight assets, efficient caching, offline capabilities, and high-performance APIs. It is engineering at its purest.</p>

      <h2>The Mobile Money Revolution</h2>
      <p>While Western tech focused on credit cards, African developers built USSD-based payment integrations like M-Pesa. This leapfrog technology proved that digital innovation is not about replicating foreign models, but about building custom solutions to address local, real-world challenges.</p>

      <h2>Investing in Local Talent Ecosystems</h2>
      <p>To sustain this momentum, we need structural investments in STEM education, tech hubs, and early-stage startup funding. Fostering a localized developer community ensures that the digital future of Africa is built by the people who understand its needs best.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200",
    category: "reflections",
    status: "published",
    published_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Demystifying React Server Components",
    slug: "demystifying-react-server-components",
    excerpt:
      "A deep technical look into React Server Components (RSC): why they exist, how they differ from SSR, and how they optimize next-gen rendering streams.",
    content: `
      <h2>The Client-Side Bundle Problem</h2>
      <p>Traditional React apps ship massive bundles of JavaScript to the browser, forcing the client to download, parse, and execute code before rendering the UI. React Server Components address this by executing rendering code on the server, sending only lightweight static markup to the browser.</p>

      <h2>RSC vs. Server-Side Rendering (SSR)</h2>
      <p>RSC is not a replacement for SSR. While SSR pre-renders components to static HTML for fast first-paint, it still requires client-side hydration. RSCs run exclusively on the server, allowing direct database queries, secure key handling, and zero-bundle impact.</p>

      <h2>Optimizing Client Borders</h2>
      <p>By declaring "use client" only at interactive boundaries (like search bars or buttons), we keep our page shells completely static. This architecture cuts initial bundle sizes by up to 80%, improving rendering speeds and SEO indexes.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1200",
    category: "technology",
    status: "published",
    published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Engineering Leadership: Empowering Teams with Autonomy",
    slug: "engineering-leadership-empowering-teams-with-autonomy",
    excerpt:
      "How to build high-trust engineering cultures that prioritize developer alignment over rigid process compliance.",
    content: `
      <h2>The Pitfalls of Micro-Management</h2>
      <p>Micro-management is a trust tax. When engineering leads dictate every implementation detail, developers disengage and treat code as simple ticketing tasks. High-impact engineering cultures define the 'what' and 'why', but leave the 'how' to the teams.</p>

      <h2>Establishing Clear Context</h2>
      <p>Autonomy without alignment is chaos. Leaders must establish clear business context, performance metrics, and system quality goals. When everyone understands the target product roadmap, decentralized decision-making aligns naturally with user needs.</p>

      <h2>Promoting Ownership and Pride</h2>
      <p>Encourage engineers to demo their features, participate in architecture design sprints, and take ownership of service reliability. Feeling direct accountability for product success shifts developer motivation from task completion to craft excellence.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200",
    category: "leadership",
    status: "published",
    published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Why Everyone Should Learn Technical Writing",
    slug: "why-everyone-should-learn-technical-writing",
    excerpt:
      "Clear writing is clear thinking. Why documenting architecture, API designs, and code habits is the key to scaling engineering teams.",
    content: `
      <h2>Writing as a Diagnostic Tool</h2>
      <p>If you cannot write a simple, structured description of your software design, you probably do not fully understand it yet. Forcing yourself to write RFCs or READMEs reveals hidden complexity, boundary errors, and logical gaps early in the design cycle.</p>

      <h2>Scaling Knowledge Transfer</h2>
      <p>In distributed or async environments, documentation is your primary scale factor. A well-written setup guide or API reference saves hundreds of Slack questions and developer onboarding hours, creating a self-serve knowledge pool.</p>

      <h2>How to Practice Daily</h2>
      <p>Start small by writing detailed commit summaries, clarifying pull request contexts, and publishing internal post-mortems. As your technical clarity grows, extend it to writing developer-facing documentation and public blog posts.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1200",
    category: "learning",
    status: "published",
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Fostering Diversity in Local Developer Groups",
    slug: "fostering-diversity-in-local-developer-groups",
    excerpt:
      "Practical strategies for tech community organizers to build safe, welcoming, and inclusive spaces for underrepresented voices.",
    content: `
      <h2>The Importance of Diverse Teams</h2>
      <p>Tech solutions built by homogeneous teams reflect their blind spots. Fostering diverse communities is not just about ethics—it is about bringing varied cognitive styles and problem-solving perspectives to build better products for everyone.</p>

      <h2>Creating Low-Barrier Entryways</h2>
      <p>Beginners often feel intimidated entering professional developer groups. Organizing welcoming sessions, dedicated study groups, and clear codes of conduct help break down entry barriers for underrepresented engineers.</p>

      <h2>Elevating Diverse Role Models</h2>
      <p>Make representation visible. Ensure your speaker panels, workshop leads, and community moderators represent diverse backgrounds. Seeing people like themselves leading developer spaces inspires early-career engineers to take up space.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200",
    category: "community",
    status: "published",
    published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    title: "Navigating Imposter Syndrome as a Tech Lead",
    slug: "navigating-imposter-syndrome-as-a-tech-lead",
    excerpt:
      "Feeling like a fraud does not mean you lack capability. Strategies for tech leads to normalize self-doubt and focus on skill leverage.",
    content: `
      <h2>The Imposter Epidemic</h2>
      <p>As you grow into leadership roles, the scope of what you do not know expands. This gap between responsibilities and personal certainty is the breeding ground for imposter syndrome. Normalizing self-doubt is the first step to conquering it.</p>

      <h2>Redefining the Role of Lead</h2>
      <p>A tech lead is not an all-knowing oracle. Your job is not to have all the answers, but to facilitate discussions, validate assumptions, and guide the team toward architectural consensus. Acknowledge your limitations and learn alongside your team.</p>

      <h2>Focusing on Evidence and Progress</h2>
      <p>When doubts arise, review the objective achievements of your team: successful builds, deployed features, mentored peers, and solved outages. Let evidence anchor your confidence, and use doubt as a signal to keep learning.</p>
    `,
    cover_image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200",
    category: "reflections",
    status: "published",
    published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

async function seed() {
  console.log("Seeding 10 premium articles to Supabase...");

  // Clean existing seed articles (optional, to avoid duplicate keys if re-running)
  const slugs = articles.map((a) => a.slug);
  const { error: deleteError } = await supabase.from("articles").delete().in("slug", slugs);

  if (deleteError) {
    console.warn("Warning: Could not clear old seed entries:", deleteError.message);
  }

  // Insert seed articles
  const { data, error } = await supabase.from("articles").insert(articles).select();

  if (error) {
    console.error("Error seeding articles:", error.message);
    console.error(
      "\nTIP: If you received a policy/permission violation error, make sure your SUPABASE_SERVICE_ROLE_KEY in .env.local is correct (Settings -> API -> service_role key)."
    );
    process.exit(1);
  }

  console.log(`Successfully seeded ${data.length} articles!`);
  process.exit(0);
}

seed();
