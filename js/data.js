const portfolioData = {
  profile: {
    name: "Abishek Gokul",
    title: "AI/ML Engineer",
    headline:
      "Building practical AI products from curiosity, experiments, and Python-first problem solving.",
    location: "Tenkasi, Tamil Nadu, India",
    email: "abishekgokulv@gmail.com",
    linkedin: "https://www.linkedin.com/in/abishekgokul-v/",
    github: "https://github.com/AbishekGokul05",
    portfolio: "abishekgokul.engineer",
    image: "assets/images/profile/profile_photo.png",
    intro:
      "I am an AI/ML graduate and developer who finds joy in building products and solving the problems I face.",
    summary:
      "I specialize in building AI-integrated products that solve practical problems, even when the problem is small. I work primarily with Python and the ecosystem around it, and I want to become a versatile engineer who keeps experimenting, learning, and moving toward challenges that feed my curiosity.",
  },
  status: {
    type: "open_to_opportunities",
    label: "OPEN TO OPPORTUNITIES",
    currentHeadline: "Looking for my next chapter",
    note: "Available for roles where practical AI, product thinking, and engineering curiosity matter.",
  },
  education: [
    {
      id: "sns-btech-aiml",
      degree: "Bachelor of Technology",
      institution: "SNS College of Technology",
      years: "2021 - 2025",
      location: "Coimbatore, Tamil Nadu",
      specialization: "Artificial Intelligence and Machine Learning",
      description:
        "Academic foundation in artificial intelligence, machine learning, and product-minded engineering experiments.",
      technologies: ["AI", "ML", "Python", "Algorithms"],
    },
  ],
  experience: [
    {
      id: "rdx-digital-technologies",
      organization: "RdX Digital Technologies",
      role: "AIML Developer",
      start: "July 2025",
      end: "April 2026",
      location: "Coimbatore",
      type: "Experience",
      description:
        "AI/ML developer role focused on practical product work, Python-first implementation, and applied experimentation.",
      responsibilities: [
        "Worked on AI/ML development tasks connected to real product needs.",
        "Used Python-centered tooling to prototype, iterate, and solve implementation problems.",
        "Detailed responsibilities are available in the supplied resume.",
      ],
      technologies: ["Python", "AI/ML", "Product Engineering"],
    },
  ],
  projects: [
    {
      id: "axion",
      title: "Axion",
      description:
        "A Python-first RAG exploration project built to understand retrieval systems from the inside out.",
      problem:
        "Tutorial RAG builds did not feel close enough to production RAG, so the project started as a deeper exploration of every moving part.",
      approach:
        "Build the retrieval workflow directly with Python, MySQL, Qdrant, and bge-m3 sentence-transformer embeddings while avoiding heavy orchestration frameworks.",
      image: "assets/images/projects/current_project_img.png",
      technologies: ["Python", "MySQL", "Qdrant", "Sentence Transformers"],
      status: "IN PROGRESS",
      deployment: "Under development",
      aiFlag: "Fully human coded",
      githubUrl: "",
      liveUrl: "",
      linkNote: "Project link available after finish",
      featured: true,
      category: "Current Build",
    },
    {
      id: "roast-playlist",
      title: "Roast a person based on Playlist",
      description:
        "A Spotify OAuth application that reads playlist data and generates a playful roast from songs and artists.",
      problem:
        "Turn personal playlist data into a funny generated experience while learning how real OAuth flows behave.",
      approach:
        "Use FastAPI, SQLite, Spotify Developer API access, cookies, refresh tokens, and Groq API generation.",
      image: "assets/images/projects/project_1_img.png",
      technologies: ["Python", "FastAPI", "SQLite", "Spotify API", "OAuth"],
      status: "COMPLETED",
      deployment: "Not deployed",
      aiFlag: "Fully developed by hand",
      githubUrl: "https://github.com/AbishekGokul05/roast_playlist",
      liveUrl: "",
      featured: false,
      category: "Product",
    },
    {
      id: "wikipedia-speedrunner",
      title: "Wikipedia Speedrunner",
      description:
        "A prototype that tries to move from one Wikipedia page to another using links, scraping, and embedding similarity.",
      problem:
        "Recreate the Wikipedia speedrun challenge as a machine-driven navigation experiment.",
      approach:
        "Scrape page links with BeautifulSoup and requests, compare semantic similarity with sentence-transformers, and prototype the flow in Tkinter.",
      image: "assets/images/projects/project_2_img.png",
      technologies: [
        "Python",
        "BeautifulSoup",
        "Sentence Transformers",
        "Tkinter",
      ],
      status: "COMPLETED",
      deployment: "Not deployed",
      aiFlag: "Fully developed by hand",
      githubUrl: "https://github.com/AbishekGokul05/wikipedia_speedrun_v1.git",
      liveUrl: "",
      featured: false,
      category: "Prototype",
    },
    {
      id: "nextlee",
      title: "NextLee",
      description:
        "A LeetCode problem selector that recommends the next problem from difficulty and topic commands.",
      problem:
        "Job hunting and LeetCode practice made choosing the next useful problem harder than expected.",
      approach:
        "Query LeetCode's exposed GraphQL endpoints with Python requests and cache results locally for fast problem selection.",
      image: "assets/images/projects/project_3_img.png",
      technologies: ["Python", "GraphQL", "Requests", "Disk Cache"],
      status: "COMPLETED",
      deployment: "Not deployed",
      aiFlag: "Fully developed by hand",
      githubUrl: "https://github.com/AbishekGokul05/NextLee.git",
      liveUrl: "",
      featured: false,
      category: "Tooling",
    },
    {
      id: "mart",
      title: "MART",
      description:
        "A Multi-Agent Research Team that plans, retrieves, stores, and refines research into structured reports.",
      problem:
        "Research across web, papers, PDFs, DOCX files, and technical sources needs a coordinated workflow instead of one-off searching.",
      approach:
        "Combine Streamlit, Groq, FAISS, sentence-transformers, LangChain, async scraping, document parsing, and reviewer/summarizer agent loops.",
      image: "assets/images/projects/project_4_img.png",
      technologies: ["Python", "Streamlit", "Groq API", "FAISS", "LangChain"],
      status: "COMPLETED",
      deployment: "Not deployed",
      aiFlag: "AI assisted with human planning and thinking",
      githubUrl:
        "https://github.com/AbishekGokul05/AI-Researcher/tree/main.git",
      liveUrl: "",
      featured: false,
      category: "AI Research",
    },
    {
      id: "nutriknow",
      title: "NutriKnow",
      description:
        "A food label analysis app that scans ingredients and gives feedback based on dietary needs and restrictions.",
      problem:
        "Useful ingredient analysis apps were hard to access locally or were behind paywalls.",
      approach:
        "Use FastAPI, Gemini API, EasyOCR, and Pydantic to read ingredient labels, explain ingredients, and tailor feedback.",
      image: "assets/images/projects/project_5_img.png",
      technologies: ["Python", "FastAPI", "Gemini API", "EasyOCR", "Pydantic"],
      status: "ARCHIVED",
      deployment: "Deployed earlier and later taken down",
      aiFlag: "AI assisted frontend and backend",
      githubUrl: "https://github.com/AbishekGokul05/NutriKnow.git",
      liveUrl: "",
      featured: false,
      category: "Product",
    },
    {
      id: "news-summarizer",
      title: "News Article Summarizer",
      description:
        "A lightweight article summarizer that fetches news from a link and estimates article polarity.",
      problem:
        "Quickly understand long news articles and whether their tone is positive or negative.",
      approach:
        "Fetch article content with Newspaper, summarize it, and estimate polarity with TextBlob in a Tkinter interface.",
      image: "assets/images/projects/project_6_img.png",
      technologies: ["Python", "TextBlob", "Tkinter", "Newspaper"],
      status: "COMPLETED",
      deployment: "Not deployed",
      aiFlag: "Fully human written",
      githubUrl:
        "https://github.com/AbishekGokul05/News-Article-Summarizer.git",
      liveUrl: "",
      featured: false,
      category: "Tooling",
    },
  ],
  currentProjectId: "axion",
  contact: {
    email: "abishekgokulv@gmail.com",
    linkedin: "https://www.linkedin.com/in/abishekgokul-v/",
    github: "https://github.com/AbishekGokul05",
    copy:
      "Always open to practical AI ideas, product experiments, and engineering conversations.",
  },
  quotes: [
    {
      text:
        "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. So throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails. Explore. Dream. Discover.",
      author: "H. Jackson Brown Jr.",
    },
    {
      text:
        "Do not be too timid and squeamish about your actions. All life is an experiment. The more experiments you make the better. What if you do fail, and get fairly rolled in the dirt once or twice? Up again - you shall never be so afraid of a tumble.",
      author: "Ralph Waldo Emerson, Journal, 1842",
    },
    {
      text:
        "The purpose of life is to live it, to taste experience to the utmost, to reach out eagerly and without fear for newer and richer experience.",
      author: "Eleanor Roosevelt",
    },
    {
      text: "To live is the rarest thing in the world. Most people just exist.",
      author: "Oscar Wilde",
    },
  ],
};

function getCurrentProject() {
  return (
    portfolioData.projects.find(
      (project) => project.id === portfolioData.currentProjectId,
    ) || null
  );
}

async function getPortfolioData() {
  return portfolioData;
}

window.portfolioData = portfolioData;
window.getPortfolioData = getPortfolioData;
window.getCurrentProject = getCurrentProject;
