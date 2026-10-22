export interface RAGSource {
  id: string;
  title: string;
  sourceType: "OpenStax" | "KhanAcademy" | "ArXiv" | "UCI_ML";
  subject: string;
  citation: string;
  url?: string;
  snippet: string;
}

export const OPENSTAX_KNOWLEDGE_BASE: RAGSource[] = [
  {
    id: "os-calc-1",
    title: "OpenStax Calculus Vol 1: Section 3.6 The Chain Rule",
    sourceType: "OpenStax",
    subject: "Calculus",
    citation: "Strang, G. & Herman, E. (OpenStax, 2021). Calculus Volume 1, Chapter 3: Derivatives.",
    snippet: "Let f and g be functions. For all x in the domain of g for which g is differentiable at x and f is differentiable at g(x), the derivative of the composite function h(x) = (f ∘ g)(x) = f(g(x)) is given by h'(x) = f'(g(x)) * g'(x). A common error is evaluating f'(g'(x)) instead of multiplying by the internal derivative."
  },
  {
    id: "os-calc-2",
    title: "OpenStax Calculus Vol 1: Section 3.3 The Product and Quotient Rules",
    sourceType: "OpenStax",
    subject: "Calculus",
    citation: "Strang, G. & Herman, E. (OpenStax, 2021). Calculus Volume 1, Section 3.3.",
    snippet: "The derivative of a product of two differentiable functions is not the product of their derivatives. Instead, d/dx[u(x)v(x)] = u'(x)v(x) + u(x)v'(x). Geometric intuition: If a rectangle has sides u and v, an infinitesimal increase du and dv adds area u*dv + v*du (with second-order du*dv vanishing)."
  },
  {
    id: "ka-phys-1",
    title: "Khan Academy Physics Library: Newton's Third Law & Momentum Conservation",
    sourceType: "KhanAcademy",
    subject: "Physics",
    citation: "Khan Academy (2023). Physics: Forces and Newton's laws of motion.",
    snippet: "Newton's Third Law states that whenever one object exerts a force on a second object, the second object exerts an equal in magnitude and opposite in direction force on the first. Notice: These forces act on DIFFERENT objects and therefore NEVER cancel each other out in single-body free-body diagrams."
  },
  {
    id: "arxiv-ai-1",
    title: "ArXiv:2401.03428 - Attention Mechanisms in Deep Transformer Networks",
    sourceType: "ArXiv",
    subject: "Computer Science",
    citation: "Vaswani et al. / Modern survey (arXiv:2401.03428v2 [cs.LG]).",
    snippet: "Scaled Dot-Product Attention computes Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V. The scaling factor 1/sqrt(d_k) counteracts extremely small gradients in large dimensions when dot products grow large in magnitude, preventing softmax saturation."
  },
  {
    id: "uci-perf-1",
    title: "UCI ML Repository: Student Performance Diagnostic Benchmark",
    sourceType: "UCI_ML",
    subject: "All Subjects",
    citation: "Cortez & Silva, UCI Machine Learning Repository (Student Performance Dataset).",
    snippet: "Predictive indicators of learning score dropouts: Latency between consecutive problem attempts exceeding 180 seconds correlates with working memory overload; conversely, latency under 5 seconds indicates guessing rather than cognitive retrieval."
  }
];

export interface BloomsTaxonomyLevel {
  level: number;
  name: "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create";
  verb: string;
  description: string;
  targetLatencySeconds: number; // expected deliberation time
}

export const BLOOMS_TAXONOMY: BloomsTaxonomyLevel[] = [
  {
    level: 1,
    name: "Remember",
    verb: "Recall, Define, List",
    description: "Retrieving relevant knowledge from long-term memory.",
    targetLatencySeconds: 8
  },
  {
    level: 2,
    name: "Understand",
    verb: "Explain, Paraphrase, Classify",
    description: "Constructing meaning from instructional messages.",
    targetLatencySeconds: 15
  },
  {
    level: 3,
    name: "Apply",
    verb: "Calculate, Implement, Execute",
    description: "Executing or implementing a procedure in a given situation.",
    targetLatencySeconds: 25
  },
  {
    level: 4,
    name: "Analyze",
    verb: "Differentiate, Organize, Deconstruct",
    description: "Breaking material into constituent parts and determining relations.",
    targetLatencySeconds: 40
  },
  {
    level: 5,
    name: "Evaluate",
    verb: "Appraise, Judge, Critique",
    description: "Making judgments based on criteria and standards.",
    targetLatencySeconds: 50
  },
  {
    level: 6,
    name: "Create",
    verb: "Synthesize, Formulate, Design",
    description: "Putting elements together to form a novel, coherent whole.",
    targetLatencySeconds: 75
  }
];

export interface CareerPath {
  id: string;
  title: string;
  companyTarget: string;
  industry: string;
  description: string;
  dailyModules: {
    day: number;
    title: string;
    targetSkill: string;
    practicalProject: string;
    openStaxReference: string;
  }[];
}

export const PRESET_CAREER_PATHS: CareerPath[] = [
  {
    id: "ai-engineer",
    title: "Applied AI & Foundation Model Engineer",
    companyTarget: "DeepMind / Anthropic / OpenAI",
    industry: "Artificial Intelligence",
    description: "Master vector embeddings, multi-head attention, quantization, and evaluation benchmarks for generative systems.",
    dailyModules: [
      {
        day: 1,
        title: "Matrix Calculus for Backpropagation",
        targetSkill: "Jacobian gradients & chain rule on tensors",
        practicalProject: "Implement a 2-layer MLP backward pass in pure NumPy",
        openStaxReference: "OpenStax Calculus Vol 3: Partial Derivatives"
      },
      {
        day: 2,
        title: "Self-Attention Mathematics & Softmax Scaling",
        targetSkill: "QK^T dot-product dynamics & memory complexity",
        practicalProject: "Build FlashAttention intuition toy simulation",
        openStaxReference: "ArXiv:1706.03762 Attention Is All You Need"
      },
      {
        day: 3,
        title: "Retrieval-Augmented Generation (RAG) Architecture",
        targetSkill: "Vector chunking, cosine distance, and reciprocal rank fusion",
        practicalProject: "Build hybrid sparse/dense textbook retriever",
        openStaxReference: "OpenStax CS: Data Structures & Hashing"
      }
    ]
  },
  {
    id: "robotics-control",
    title: "Autonomous Robotics & Control Systems Engineer",
    companyTarget: "Boston Dynamics / Tesla Autopilot / NASA JPL",
    industry: "Robotics & Space Systems",
    description: "Synthesize rigid body kinematics, differential equations, and Kalman filters for dynamic balancing.",
    dailyModules: [
      {
        day: 1,
        title: "Newton-Euler Equations on Incline Planes",
        targetSkill: "Free body decomposition with friction coefficients",
        practicalProject: "Simulate a two-wheeled inverted pendulum balancer",
        openStaxReference: "OpenStax Physics Vol 1: Rotational Dynamics"
      },
      {
        day: 2,
        title: "PID Controller Tuning & Step Response",
        targetSkill: "Proportional, integral, derivative error correction",
        practicalProject: "Tune motor velocity loop under simulated payload disturbance",
        openStaxReference: "OpenStax Calculus: Second-Order Differential Equations"
      }
    ]
  },
  {
    id: "quant-finance",
    title: "Quantitative Research Analyst",
    companyTarget: "Two Sigma / Citadel / Jane Street",
    industry: "Financial Engineering",
    description: "Master stochastic calculus, Black-Scholes PDE, and Monte Carlo expectation models.",
    dailyModules: [
      {
        day: 1,
        title: "Itô's Lemma & Geometric Brownian Motion",
        targetSkill: "Continuous-time stochastic differential equations",
        practicalProject: "Simulate asset price paths with log-normal volatility",
        openStaxReference: "OpenStax Statistics: Probability Distributions"
      },
      {
        day: 2,
        title: "Option Greeks & Delta Neutral Hedging",
        targetSkill: "First and second partial derivatives of option contracts",
        practicalProject: "Backtest dynamic hedging on real market ticks",
        openStaxReference: "OpenStax Calculus: Multivariable Optimization"
      }
    ]
  }
];
