export interface ConceptNode {
  id: string;
  title: string;
  description: string;
  prerequisites: string[];
  status: "mastered" | "current" | "gap" | "locked";
  difficulty: "beginner" | "intermediate" | "advanced";
  commonMisconceptions: string[];
}

export interface PracticeQuestion {
  id: string;
  conceptId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  misconceptionMap: Record<number, string>; // Maps incorrect option index to identified gap
  hint: string;
}

export interface SubjectCurriculum {
  id: string;
  name: string;
  category: string;
  badge: string;
  description: string;
  concepts: ConceptNode[];
  questions: PracticeQuestion[];
}

export const PRESET_CURRICULA: SubjectCurriculum[] = [
  {
    id: "calculus",
    name: "Calculus: Derivatives & Rates of Change",
    category: "Mathematics",
    badge: "f'(x)",
    description: "Master limits, power rule, product rule, and the chain rule through intuitive rate-of-change models.",
    concepts: [
      {
        id: "calc-limits",
        title: "Limits & Infinitesimals",
        description: "Approaching values without dividing by zero; instantaneous velocity intuition.",
        prerequisites: [],
        status: "mastered",
        difficulty: "beginner",
        commonMisconceptions: ["Confusing f(a) with the limit as x approaches a", "Treating 0/0 as undefined rather than indeterminate"]
      },
      {
        id: "calc-power-rule",
        title: "Power Rule & Polynomials",
        description: "d/dx(x^n) = n * x^(n-1); geometric intuition of dimensional peeling.",
        prerequisites: ["calc-limits"],
        status: "mastered",
        difficulty: "beginner",
        commonMisconceptions: ["Forgetting to subtract 1 from negative powers", "Applying power rule to exponential functions like 2^x"]
      },
      {
        id: "calc-product-rule",
        title: "Product & Quotient Rules",
        description: "Differentiating composite products: (uv)' = u'v + uv' and quotient balances.",
        prerequisites: ["calc-power-rule"],
        status: "current",
        difficulty: "intermediate",
        commonMisconceptions: ["Assuming (uv)' = u' * v'", "Swapping numerator and denominator in quotient rule"]
      },
      {
        id: "calc-chain-rule",
        title: "The Chain Rule",
        description: "Differentiating nested composite functions: d/dx[f(g(x))] = f'(g(x)) * g'(x).",
        prerequisites: ["calc-product-rule"],
        status: "gap",
        difficulty: "advanced",
        commonMisconceptions: ["Neglecting the inner derivative g'(x)", "Differentiating both f and g at the same time incorrectly"]
      },
      {
        id: "calc-optimization",
        title: "Extrema & Optimization",
        description: "Finding critical points (f'(x) = 0) and second derivative concavity tests.",
        prerequisites: ["calc-chain-rule"],
        status: "locked",
        difficulty: "advanced",
        commonMisconceptions: ["Assuming all critical points are local extrema", "Ignoring boundary domain constraints"]
      }
    ],
    questions: [
      {
        id: "q-calc-1",
        conceptId: "calc-chain-rule",
        question: "What is the derivative of h(x) = (3x² + 5)⁴ with respect to x?",
        options: [
          "4(3x² + 5)³",
          "24x(3x² + 5)³",
          "12x(3x² + 5)³",
          "4(6x)³"
        ],
        correctIndex: 1,
        explanation: "By the Chain Rule, d/dx[u⁴] = 4u³ * (du/dx). Here u = 3x² + 5, so du/dx = 6x. Multiplying: 4(3x² + 5)³ * 6x = 24x(3x² + 5)³.",
        misconceptionMap: {
          0: "Missing inner derivative g'(x) — applied power rule to outer shell only",
          2: "Calculation error when multiplying outer constant (4) by inner derivative (6x)",
          3: "Differentiated inside the exponent directly instead of holding inner function constant"
        },
        hint: "Identify the 'outer' shell u⁴ and the 'inner' function u = 3x² + 5. Remember to multiply by the derivative of the inside!"
      },
      {
        id: "q-calc-2",
        conceptId: "calc-product-rule",
        question: "Differentiate f(x) = x³ * sin(x).",
        options: [
          "3x² * cos(x)",
          "3x² sin(x) + x³ cos(x)",
          "3x² sin(x) - x³ cos(x)",
          "x³ cos(x)"
        ],
        correctIndex: 1,
        explanation: "Using the Product Rule (u*v)' = u'v + uv': u=x³ (u'=3x²), v=sin(x) (v'=cos(x)). Result: 3x²sin(x) + x³cos(x).",
        misconceptionMap: {
          0: "Multiplied individual derivatives (u' * v') instead of applying the product rule formula",
          2: "Accidentally placed a minus sign as if doing the quotient rule",
          3: "Only differentiated the second factor, forgetting the derivative of the first term"
        },
        hint: "Recall: Derivative of first times second, PLUS first times derivative of second."
      }
    ]
  },
  {
    id: "cs-algorithms",
    name: "Computer Science: Recursion to Dynamic Programming",
    category: "Computer Science",
    badge: "O(n)",
    description: "Bridge mental gaps from recursive call stacks to memoization and optimal sub-structure.",
    concepts: [
      {
        id: "cs-call-stack",
        title: "Call Stacks & Activation Frames",
        description: "How function invocations, local variables, and return addresses are pushed/popped in memory.",
        prerequisites: [],
        status: "mastered",
        difficulty: "beginner",
        commonMisconceptions: ["Thinking recursive calls overwrite previous frame variables", "Stack overflow cause confusion"]
      },
      {
        id: "cs-base-cases",
        title: "Base Cases & Terminating Induction",
        description: "Formulating strict stopping conditions and monotonic progress towards the base.",
        prerequisites: ["cs-call-stack"],
        status: "mastered",
        difficulty: "beginner",
        commonMisconceptions: ["Missing base case branch causing infinite loop", "Off-by-one in stopping index"]
      },
      {
        id: "cs-tree-recursion",
        title: "Tree Recursion & Overlapping Subproblems",
        description: "Visualizing O(2^n) branching factor (Fibonacci, subsets) and redundant node recomputations.",
        prerequisites: ["cs-base-cases"],
        status: "gap",
        difficulty: "intermediate",
        commonMisconceptions: ["Confusing recursive call depth with total operation count", "Assuming recursion is always slower than iteration"]
      },
      {
        id: "cs-memoization",
        title: "Top-Down Memoization (Caching)",
        description: "Attaching state hashes/hashmaps to prune recursive trees from O(2^n) down to O(n).",
        prerequisites: ["cs-tree-recursion"],
        status: "current",
        difficulty: "intermediate",
        commonMisconceptions: ["Using mutable objects as cache keys", "Forgetting to return the cached value after saving"]
      },
      {
        id: "cs-tabulation",
        title: "Bottom-Up Tabulation (DP)",
        description: "Iterative state transition matrices: dp[i] = min/max state relations.",
        prerequisites: ["cs-memoization"],
        status: "locked",
        difficulty: "advanced",
        commonMisconceptions: ["Wrong iteration order violating state readiness", "Space complexity oversight"]
      }
    ],
    questions: [
      {
        id: "q-cs-1",
        conceptId: "cs-tree-recursion",
        question: "In naive recursive Fibonacci fib(5), how many total calls to fib(1) are executed?",
        options: [
          "1 call",
          "3 calls",
          "5 calls",
          "8 calls"
        ],
        correctIndex: 2,
        explanation: "fib(5) breaks down into a binary call tree. The number of calls to fib(1) equals fib(5) = 5. Because identical calls are recalculated redundantly!",
        misconceptionMap: {
          0: "Assumed each sub-problem is evaluated once (thinking like a memoized solution)",
          1: "Underestimated the overlapping tree branches",
          3: "Confused with fib(6) value"
        },
        hint: "Draw the tree: fib(5) = fib(4) + fib(3). fib(4) calls fib(3) again! Each branch separately calculates fib(1)."
      }
    ]
  },
  {
    id: "physics-mechanics",
    name: "Physics: Newton's Laws & Momentum Conservation",
    category: "Physics",
    badge: "F=ma",
    description: "Diagnose vector misconceptions, free body diagrams, and elastic vs inelastic collisions.",
    concepts: [
      {
        id: "phys-vectors",
        title: "Vector Decomposition & Net Forces",
        description: "Resolving force vectors into orthogonal components (Fx = F cos θ, Fy = F sin θ).",
        prerequisites: [],
        status: "mastered",
        difficulty: "beginner",
        commonMisconceptions: ["Adding vector magnitudes directly without considering angles", "Swapping sin and cos on inclined planes"]
      },
      {
        id: "phys-third-law",
        title: "Newton's 3rd Law & Interaction Pairs",
        description: "Action-reaction pairs: equal in magnitude, opposite in direction, acting on DIFFERENT bodies.",
        prerequisites: ["phys-vectors"],
        status: "gap",
        difficulty: "intermediate",
        commonMisconceptions: ["Thinking the normal force and gravity on a table are a 3rd law pair", "Believing a heavier object exerts a greater force on a lighter one"]
      },
      {
        id: "phys-work-energy",
        title: "Work-Kinetic Energy Theorem",
        description: "W_net = ΔK = 1/2 m v_f² - 1/2 m v_i²; conservative vs dissipative work.",
        prerequisites: ["phys-third-law"],
        status: "current",
        difficulty: "intermediate",
        commonMisconceptions: ["Assuming work is done when displacement is perpendicular to force", "Negative work misunderstanding"]
      },
      {
        id: "phys-momentum",
        title: "Momentum & Collisions",
        description: "Linear momentum conservation (p = mv) and kinetic energy retention in elastic collisions.",
        prerequisites: ["phys-work-energy"],
        status: "locked",
        difficulty: "advanced",
        commonMisconceptions: ["Thinking momentum is lost in inelastic collisions", "Treating momentum as a scalar"]
      }
    ],
    questions: [
      {
        id: "q-phys-1",
        conceptId: "phys-third-law",
        question: "A heavy 2000kg truck collides head-on with a small 1000kg compact car. During the collision, which vehicle experiences a greater magnitude of force?",
        options: [
          "The truck exerts a greater force on the car because of its larger mass",
          "The car experiences a greater force because it accelerates backward faster",
          "Both vehicles experience exactly equal force magnitudes on each other",
          "The vehicle traveling at higher speed exerts the greater force"
        ],
        correctIndex: 2,
        explanation: "By Newton's Third Law (F_A_on_B = -F_B_on_A), the forces are an interaction pair and are identical in magnitude. The car accelerates more because a = F / m (smaller mass = greater acceleration), but the force itself is identical!",
        misconceptionMap: {
          0: "Conflating mass/damage with force magnitude (Intuition trap: larger object = more force)",
          1: "Confusing resulting acceleration (F/m) with the contact force itself",
          3: "Believing kinetic energy or velocity governs collision force pairs"
        },
        hint: "Remember Newton's Third Law: For every action, there is an equal and opposite reaction. What does 'equal' mean here?"
      }
    ]
  }
];
