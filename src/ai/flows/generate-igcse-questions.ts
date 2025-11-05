// src/ai/flows/generate-igcse-questions.ts
"use server";

/**
 * @fileOverview A flow to generate IGCSE-style exam questions using AI.
 *
 * - generateIgcseQuestions - A function that generates IGCSE questions.
 * - GenerateIgcseQuestionsInput - The input type for the generateIgcseQuestions function.
 * - GenerateIgcseQuestionsOutput - The return type for the generateIgcseQuestions function.
 */

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const GenerateIgcseQuestionsInputSchema = z.object({
  examBoard: z
    .enum(["IGCSE", "WAEC"])
    .describe("The exam board (IGCSE or WAEC)."),
  subject: z
    .enum(["Mathematics", "Biology", "Physics", "Chemistry"])
    .describe("The subject for which to generate questions."),
  targetYear: z
    .number()
    .optional()
    .describe("The target exam year for theory questions."),
  questionTypes: z
    .array(z.enum(["MCQ", "Theory"]))
    .optional()
    .describe("Restrict generation to these types (MCQ, Theory)."),
  counts: z
    .object({
      mcq: z.number().optional(),
      theory: z.number().optional(),
    })
    .optional()
    .describe("Desired counts per type (e.g., mcq: 40, theory: 10)."),
});
export type GenerateIgcseQuestionsInput = z.infer<
  typeof GenerateIgcseQuestionsInputSchema
>;

const QuestionSchema = z.object({
  questionType: z.enum(["MCQ", "Theory"]),
  questionText: z.string(),
  diagramUrl: z.string().nullable(),
});

const GenerateIgcseQuestionsOutputSchema = z.object({
  questions: z.array(QuestionSchema),
});
export type GenerateIgcseQuestionsOutput = z.infer<
  typeof GenerateIgcseQuestionsOutputSchema
>;

export async function generateIgcseQuestions(
  input: GenerateIgcseQuestionsInput,
): Promise<GenerateIgcseQuestionsOutput> {
  return generateIgcseQuestionsFlow(input);
}

const PromptQuestionSchema = z.object({
  questionType: z.enum(["MCQ", "Theory"]),
  questionText: z
    .string()
    .describe(
      "The full text of the question, including multiple choice options if applicable (with an asterisk * on the correct one). This should NOT contain any diagram descriptions.",
    ),
  diagramPrompt: z
    .string()
    .nullable()
    .describe(
      "A concise prompt for an image generation model to create a simple, clean, black and white, exam-standard diagram, if one is needed.",
    ),
});

const prompt = ai.definePrompt({
  name: "generateIgcseQuestionsPrompt",
  input: {
    schema: z.object({
      examBoard: z.enum(["IGCSE", "WAEC"]),
      subject: z.enum(["Mathematics", "Biology", "Physics", "Chemistry"]),
      targetYear: z.number().optional(),
      // convenience flags/values computed at runtime
      onlyMCQ: z.boolean().optional(),
      onlyTheory: z.boolean().optional(),
      mcqCount: z.number().optional(),
      theoryCount: z.number().optional(),
    }),
  },
  output: {
    schema: z.object({
      questions: z.array(PromptQuestionSchema),
    }),
  },
  prompt: `You are an expert {{examBoard}} exam question generator with deep knowledge of actual past papers and exam standards.

{{#if onlyMCQ}}
Generate ONLY multiple-choice questions (MCQ). Produce exactly {{mcqCount}} MCQ questions.
{{/if}}
{{#if onlyTheory}}
Generate ONLY theory questions. Produce exactly {{theoryCount}} Theory questions.
{{/if}}
{{#unless onlyMCQ}}{{#unless onlyTheory}}
Your task is to produce a full exam paper with 10 theory questions and 40 multiple-choice questions.
{{/unless}}{{/unless}}

**CRITICAL QUALITY REQUIREMENTS - EXAM STANDARD DIFFICULTY:**

1. **Difficulty Level**: Generate questions that match authentic {{examBoard}} exam difficulty:
   - **30% Easy-Medium**: Test recall, basic understanding, and straightforward application (Grades E-D)
   - **50% Medium-Hard**: Require multi-step reasoning, analysis, and synthesis of concepts (Grades C-B)
   - **20% Hard**: Challenge top students with complex scenarios, unfamiliar contexts, and higher-order thinking (Grades A-A*)
   - Questions must be challenging but fair - avoiding trivial or impossibly difficult questions

2. **Richness & Depth**: Every question must be RICH and COMPREHENSIVE:
   - Include real-world context, scenarios, or applications where relevant
   - Provide sufficient detail and background information
   - Avoid superficial or overly simplistic questions
   - For MCQs: Each question should test genuine understanding, not just recall
   - For Theory: Multi-part questions (a, b, c, d) with progressive difficulty within each question

3. **Question Quality Standards**:
   - **MCQ Questions**: 
     * Each question must have a clear, unambiguous stem with sufficient context
     * All 4 options must be plausible and well-crafted (avoid obvious wrong answers)
     * Wrong options should represent common misconceptions or calculation errors
     * Include realistic numerical values, units, and scenarios
     * Test application, analysis, or evaluation - not just definition recall
   - **Theory Questions**:
     * Must be multi-part (typically 3-5 parts: a, b, c, d, e)
     * Each part should build on previous parts or test different skills
     * Include mark allocations where appropriate (e.g., [2 marks], [3 marks])
     * Require detailed explanations, calculations, diagrams, or comparisons
     * Incorporate real-world applications, experimental scenarios, or data analysis

4. **Bloom's Taxonomy Levels**: Questions should test:
   - **Application**: Using knowledge in new situations (40% of questions)
   - **Analysis**: Breaking down complex problems, identifying relationships (30%)
   - **Evaluation**: Making judgments, comparing options, justifying conclusions (20%)
   - **Synthesis**: Combining concepts from different topics (10%)
   - Avoid excessive pure recall questions (definitions, simple facts)

You will generate questions for {{subject}}. The questions must be authentic, exam-standard quality that would appear in actual {{examBoard}} past papers. They should require multi-step reasoning, synthesis of different topics, and application of knowledge to unfamiliar scenarios.
{{#if targetYear}}
The theory questions should be tailored for a target exam year of {{targetYear}} and reflect the style and difficulty of questions from that period.
{{/if}}

For theory questions, ensure they are rich, multi-part questions (typically 3-5 parts) that require detailed explanations, calculations, diagrams, and real-world context. Each part should test different skills and build progressively in difficulty.

For each question, provide the question text. Separately, provide a text description for a "clean, neat, exam-standard" diagram in the 'diagramPrompt' field. If no diagram is needed, set 'diagramPrompt' to null.

### 1. **MATHEMATICS**
   - **Overview**: Contains 2 papers (one objectives from 2003, one theory from 2024). Focuses on O-Level Syllabus D (4024). Questions cover algebra, geometry, trigonometry, statistics, and real-world applications (e.g., time zones, currency conversion).
   - **Quality Standards**: 
     * MCQs must include realistic numerical values, units, and context
     * Include word problems with real-world scenarios (e.g., "A rectangular garden has length 15m and width 8m...")
     * Wrong options should reflect common calculation errors or misconceptions
     * Theory questions must include multi-step problems with clear mark allocations
   - **Question Types & Patterns**:
     - **Objectives (Multiple Choice, 40 questions)**: 
       * Rich contextual questions with clear scenarios and sufficient detail
       * Short problems with 4 options (A-D). Common stems: "Evaluate/Solve [expression/equation]", "Calculate [angle/area/volume]", "Find [gradient/symmetry/locus]"
       * Often includes diagrams (e.g., clocks, graphs, circles, triangles) with proper labeling
       * Answers involve fractions, percentages, vectors, or inequalities
       * Example Pattern: "A rectangular field has length 24m and width 18m. A path 2m wide runs around the outside. Calculate the area of the path." with realistic numerical options
       * Generation Tip: Include word problems with context, realistic values (avoid round numbers exclusively), and common error-based distractors
     - **Theory (Structured, 10 questions)**: 
       * Multi-part (a-e) with calculations, proofs, graphs, and explanations
       * Marks: 1-4 per part, clearly indicated [1 mark], [2 marks], etc.
       * Includes similarity (triangles), angles, areas, rearrangements (e.g., solve x² + 40x - 48000=0)
       * Real-world applications (e.g., currency/cost problems, construction, design)
       * Example Pattern: "A company manufactures rectangular boxes. The length is 3x cm, width is 2x cm, and height is x cm. a) Write an expression for the volume. [2 marks] b) If the volume is 96 cm³, find x. [3 marks] c) Calculate the total surface area. [3 marks]"
       * Generation Tip: Build complexity progressively within each question, include realistic contexts, and ensure mark allocations are appropriate
   - **Key Topics**: Fractions/percentages (10%), algebra/equations (25%), geometry/trig (30%), graphs/inequalities (15%), vectors/matrices (10%), symmetry/loci (10%).

### 2. **BIOLOGY**
   - **Overview**: Contains 3 papers (two objectives from 2004/2005, one theory from 2024). Syllabus 5090. Emphasizes human biology, ecology, cells, and processes like respiration/photosynthesis.
   - **Quality Standards**:
     * Include experimental scenarios with controlled variables and data
     * MCQs should test understanding of processes, not just definitions
     * Wrong options should represent common misconceptions (e.g., "respiration is the same as breathing")
     * Theory questions must include data analysis, graph interpretation, or experimental design
     * Incorporate real-world applications (e.g., conservation, disease prevention, agriculture)
   - **Question Types & Patterns**:
     - **Objectives (Multiple Choice, 40 questions)**: 
       * Rich contextual questions with experimental scenarios or real-world contexts
       * 4 options (A-D). Stems: "Which [process/structure]?", "What happens when [scenario]?", "In an experiment where..."
       * Graphs with data interpretation (e.g., oxygen production over time, enzyme activity vs pH)
       * Diagrams: Cells, organs, food chains with proper labeling requirements
       * Example Pattern: "A student investigates the effect of light intensity on photosynthesis. She measures oxygen production over 30 minutes. Which graph shows the correct relationship?" with plausible data-based options
       * Generation Tip: Include experimental contexts, data analysis, and common misconceptions as distractors
     - **Theory (Structured, 10 questions)**: 
       * Multi-part with labels, explanations, calculations (e.g., energy flow in food chains)
       * Marks: 1-7 per part, clearly indicated
       * Includes diagrams requiring labeling (e.g., seed structure, heart, cell)
       * Comparisons (e.g., human vs. fish circulation, plant vs. animal cells)
       * Applications (e.g., overfishing solutions, disease prevention, conservation)
       * Data analysis: "The table shows energy transfer in a food chain. Calculate the percentage efficiency..." [3 marks]
       * Example Pattern: "A student investigates the effect of temperature on enzyme activity. a) Name the independent variable. [1 mark] b) Describe how the student could control other variables. [2 marks] c) The graph shows enzyme activity decreases above 40°C. Explain why. [3 marks]"
       * Generation Tip: Include experimental design, data analysis, and real-world applications with clear mark allocations
   - **Key Topics**: Cells/tissues (15%), transport/diffusion (20%), respiration/photosynthesis (20%), ecology/food chains (15%), genetics/inheritance (10%), health/diseases (10%), enzymes/nutrients (10%).

### 3. **PHYSICS**
   - **Overview**: Contains 3 papers (two objectives from 2003/2004, one theory from 2024). Syllabus 5054. Covers mechanics, waves, electricity, nuclear physics, and thermal properties.
   - **Quality Standards**:
     * Include realistic numerical values with proper units and significant figures
     * MCQs should test application of formulas and concepts, not just definitions
     * Wrong options should reflect common calculation errors (e.g., forgetting to convert units)
     * Theory questions must include multi-step calculations with clear working
     * Incorporate real-world applications (e.g., engineering, technology, energy conservation)
   - **Question Types & Patterns**:
     - **Objectives (Multiple Choice, 40 questions)**: 
       * Rich contextual questions with realistic scenarios and numerical values
       * 4 options (A-D). Stems: "What is [quantity]?", "Which graph shows [effect]?", "A car accelerates from rest..."
       * Diagrams: Circuits, waves, forces with proper labeling and realistic values
       * Example Pattern: "A car of mass 1200 kg accelerates from rest to 25 m/s in 8 seconds. Calculate the average force required." with realistic options (e.g., 3750 N, 375 N, 15000 N, 300 N)
       * Generation Tip: Include word problems with context, realistic values, and common calculation errors as distractors
     - **Theory (Structured, 10 questions)**: 
       * Multi-part with calculations, sketches, explanations
       * Marks: 1-5 per part, clearly indicated
       * Includes waves (e.g., refraction, reflection), circuits (e.g., power = V²/R, series/parallel)
       * Radioactivity (half-life calculations), orbits (e.g., Earth rotation speed)
       * Real-world applications (e.g., energy efficiency, safety, technology)
       * Example Pattern: "A student investigates the relationship between voltage and current in a resistor. a) State the independent variable. [1 mark] b) The graph shows a straight line through the origin. What does this show? [2 marks] c) Calculate the resistance if the voltage is 12 V and current is 0.5 A. Show your working. [3 marks]"
       * Generation Tip: Include experimental scenarios, multi-step calculations with working, and real-world applications
   - **Key Topics**: Mechanics/forces (25%), thermal/energy (15%), waves/light/sound (20%), electricity/circuits (20%), magnetism/electromagnetism (10%), nuclear/atomic (10%).

### 4. **CHEMISTRY**
   - **Overview**: Contains 2 papers (one objectives from 2018, one theory from 2024). Syllabus 5070. Focuses on stoichiometry, reactions, organic chemistry, and Periodic Table trends.
   - **Quality Standards**:
     * Include realistic chemical formulas, balanced equations, and proper notation
     * MCQs should test understanding of reactions, bonding, and properties, not just definitions
     * Wrong options should represent common misconceptions (e.g., confusing ionic and covalent bonding)
     * Theory questions must include balanced equations, calculations with working, and structural diagrams
     * Incorporate real-world applications (e.g., industrial processes, environmental chemistry, materials)
   - **Question Types & Patterns**:
     - **Objectives (Multiple Choice, 40 questions)**: 
       * Rich contextual questions with chemical scenarios and reactions
       * 4 options (A-D). Stems: "Which [statement/process]?", "What happens when...?", "In the reaction..."
       * Tests (e.g., litmus for gases, flame tests, precipitation)
       * Diagrams: Dot-cross diagrams, structural formulas, reaction mechanisms
       * Example Pattern: "When magnesium reacts with hydrochloric acid, which gas is produced? A) Hydrogen B) Oxygen C) Carbon dioxide D) Nitrogen" with plausible distractors
       * Generation Tip: Include reaction scenarios, test identification, and common misconceptions as distractors
     - **Theory (Structured, 7 questions)**: 
       * Multi-part with equations, calculations, diagrams
       * Marks: 1-4 per part, clearly indicated
       * Includes electrolysis, esters/polymers, redox (oxidation numbers), Group trends
       * Balanced chemical equations with state symbols
       * Calculations: Moles, concentrations, percentage yield with clear working
       * Example Pattern: "A student reacts 5.0 g of magnesium with excess hydrochloric acid. a) Write the balanced equation with state symbols. [2 marks] b) Calculate the number of moles of magnesium used. [2 marks] c) Calculate the volume of hydrogen gas produced at room temperature and pressure. [3 marks]"
       * Generation Tip: Include balanced equations, multi-step calculations with working, and real-world chemical applications
   - **Key Topics**: Atomic structure/bonding (20%), reactions/equations (25%), organic (esters/polymers, 15%), electrochemistry (10%), acids/bases (10%), Periodic Table/metals (10%), stoichiometry (10%).

### Overarching Patterns for Infinite Question Generation
- **Common Formats Across Subjects**:
  - **Diagrams**: Text-described (e.g., "NOT TO SCALE" triangles, circuits, cells). Include proper labeling and realistic values.
  - **Graphs/Tables**: E.g., speed-time, pH changes, temperature vs. time. Include data interpretation and analysis.
  - **Calculations**: Frequent (e.g., speed = distance/time, moles = mass/M_r). Show working where appropriate.
  - **Explanations/Proofs**: "Explain why/show that" (e.g., similarity in triangles, redox via oxidation numbers). Require detailed reasoning.
  - **Real-World Contexts**: Time zones, ecosystems, alloys, fuels, engineering, technology, conservation, health.
- **Quality Assurance - Final Checklist**:
  - **Every question must be RICH**: Include context, realistic scenarios, sufficient detail
  - **Difficulty distribution**: 30% easy-medium, 50% medium-hard, 20% hard
  - **MCQ quality**: All options plausible, wrong options reflect misconceptions, test understanding not just recall
  - **Theory quality**: Multi-part (3-5 parts), clear mark allocations, progressive difficulty, real-world applications
  - **Authenticity**: Questions should match actual {{examBoard}} exam style and difficulty
  - **Avoid**: Trivial questions, obvious wrong answers, superficial content, overly simple scenarios
- **Generation Guidelines**:
  - **Variety**: Generate questions across different topics and difficulty levels. MCQs must have 4 options (A,B,C,D) with one correct answer marked with an asterisk (*). Ensure each option is on a new line.
  - **Output Format**: For each question, provide the complete question text with all necessary context, including any multiple choice options. Do not include answers or mark schemes. For theory questions, include mark allocations [X marks] for each part.

`,
  config: {
    maxOutputTokens: 16000,
    safetySettings: [
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_ONLY_HIGH",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_LOW_AND_ABOVE",
      },
    ],
  },
});

const generateIgcseQuestionsFlow = ai.defineFlow(
  {
    name: "generateIgcseQuestionsFlow",
    inputSchema: GenerateIgcseQuestionsInputSchema,
    outputSchema: GenerateIgcseQuestionsOutputSchema,
  },
  async (input) => {
    // derive convenience flags and counts for the prompt
    const onlyMCQ = Array.isArray(input.questionTypes)
      ? input.questionTypes.length === 1 && input.questionTypes[0] === "MCQ"
      : false;
    const onlyTheory = Array.isArray(input.questionTypes)
      ? input.questionTypes.length === 1 && input.questionTypes[0] === "Theory"
      : false;

    const mcqCount = input.counts?.mcq ?? (onlyMCQ ? 40 : 40);
    const theoryCount = input.counts?.theory ?? (onlyTheory ? 10 : 10);

    const { output } = await prompt({
      examBoard: input.examBoard,
      subject: input.subject,
      targetYear: input.targetYear,
      onlyMCQ,
      onlyTheory,
      mcqCount,
      theoryCount,
    });

    if (!output || !output.questions) {
      return { questions: [] };
    }

    // Optionally restrict by types and counts post-generation as a safety net
    let filtered = output.questions;

    if (Array.isArray(input.questionTypes) && input.questionTypes.length > 0) {
      filtered = filtered.filter((q) => input.questionTypes!.includes(q.questionType));
    }

    // enforce counts
    if (input.counts?.mcq || input.counts?.theory) {
      const mcqs = filtered.filter((q) => q.questionType === "MCQ").slice(0, input.counts?.mcq ?? Infinity);
      const theories = filtered
        .filter((q) => q.questionType === "Theory")
        .slice(0, input.counts?.theory ?? Infinity);
      filtered = [...mcqs, ...theories];
    }

    const questionsWithDiagrams = filtered.map((q) => ({
      questionType: q.questionType,
      questionText: q.questionText,
      diagramUrl: null,
    }));

    return { questions: questionsWithDiagrams };
  },
);
