// src/ai/flows/generate-igcse-questions.ts
'use server';

/**
 * @fileOverview A flow to generate IGCSE-style exam questions using AI.
 *
 * - generateIgcseQuestions - A function that generates IGCSE questions.
 * - GenerateIgcseQuestionsInput - The input type for the generateIgcseQuestions function.
 * - GenerateIgcseQuestionsOutput - The return type for the generateIgcseQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateIgcseQuestionsInputSchema = z.object({
  subject: z.enum(['Mathematics', 'Biology', 'Physics', 'Chemistry']).describe('The subject for which to generate questions.'),
  questionType: z.enum(['MCQ', 'Theory']).describe('The type of questions to generate.'),
});
export type GenerateIgcseQuestionsInput = z.infer<typeof GenerateIgcseQuestionsInputSchema>;

const GenerateIgcseQuestionsOutputSchema = z.object({
  questions: z.string().describe('The generated IGCSE questions.'),
});
export type GenerateIgcseQuestionsOutput = z.infer<typeof GenerateIgcseQuestionsOutputSchema>;

export async function generateIgcseQuestions(input: GenerateIgcseQuestionsInput): Promise<GenerateIgcseQuestionsOutput> {
  return generateIgcseQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateIgcseQuestionsPrompt',
  input: {schema: GenerateIgcseQuestionsInputSchema},
  output: {schema: GenerateIgcseQuestionsOutputSchema},
  prompt: `You are an expert IGCSE exam question generator. Your task is to produce infinite, high-quality questions based on the provided subject-specific analysis.

You will generate 10 {{questionType}} questions for {{subject}}.

Use the following analysis as a blueprint. Randomize elements like numbers, scenarios, and options, but maintain educational validity and alignment with O-Level Cambridge-style exams.

### 1. **MATHEMATICS**
   - **Overview**: Contains 2 papers (one objectives from 2003, one theory from 2024). Focuses on O-Level Syllabus D (4024). Questions cover algebra, geometry, trigonometry, statistics, and real-world applications (e.g., time zones, currency conversion).
   - **Question Types & Patterns**:
     - **Objectives (Multiple Choice, ~40 questions)**: Short problems with 4 options (A-D). Common stems: "Evaluate/Solve [expression/equation]", "Calculate [angle/area/volume]", "Find [gradient/symmetry/locus]". Often includes diagrams (e.g., clocks, graphs, circles). Answers involve fractions, percentages, vectors, or inequalities.
       - Example Pattern: Algebraic manipulation (e.g., factorize x² - 7x + 12 → (x-3)(x-4)).
       - Generation Tip: Randomize coefficients (e.g., generate quadratic ax² + bx + c where a=1-5, solve for roots).
     - **Theory (Structured, 10-15 questions)**: Multi-part (a-e) with calculations, proofs, graphs, and explanations. Marks: 1-4 per part. Includes similarity (triangles), angles, areas, rearrangements (e.g., solve x² + 40x - 48000=0), and real-world (e.g., currency/cost problems).
       - Example Pattern: Geometry proofs (e.g., similar triangles: angles equal due to common/parallel lines).
       - Generation Tip: For infinite questions, vary scales (e.g., random lengths 1-20 cm), use trig functions (sin/cos/tan with angles 0-180°), or create equations like ax² + bx + c = 0 with random integer roots.
   - **Key Topics**: Fractions/percentages (10%), algebra/equations (25%), geometry/trig (30%), graphs/inequalities (15%), vectors/matrices (10%), symmetry/loci (10%).

### 2. **BIOLOGY**
   - **Overview**: Contains 3 papers (two objectives from 2004/2005, one theory from 2024). Syllabus 5090. Emphasizes human biology, ecology, cells, and processes like respiration/photosynthesis.
   - **Question Types & Patterns**:
     - **Objectives (Multiple Choice, ~40 questions)**: 4 options (A-D). Stems: "Which [process/structure]?", "What happens when [scenario]?", graphs (e.g., oxygen production over time). Diagrams: Cells, organs, food chains.
       - Example Pattern: Diffusion/osmosis (e.g., water entering roots via low potential). Genetics (e.g., sex inheritance diagrams).
       - Generation Tip: Randomize scenarios (e.g., "Plant in [dark/light] for [X hours], what happens to [starch/oxygen]?").
     - **Theory (Structured, 7-10 questions)**: Multi-part with labels, explanations, calculations (e.g., energy flow in food chains). Marks: 1-7 per part. Includes diagrams (e.g., seed structure), comparisons (e.g., human vs. fish circulation), and applications (e.g., overfishing solutions).
       - Example Pattern: Immunity (e.g., pathogens/antibodies/memory cells). Ecology (e.g., food webs: predict changes if [species] decreases).
       - Generation Tip: For infinite: Vary organisms (e.g., human/fish/plant), processes (respiration/photosynthesis), or factors (temperature/pH). Calculate ratios (e.g., energy loss in chains: 90% per level).
   - **Key Topics**: Cells/tissues (15%), transport/diffusion (20%), respiration/photosynthesis (20%), ecology/food chains (15%), genetics/inheritance (10%), health/diseases (10%), enzymes/nutrients (10%).

### 3. **PHYSICS**
   - **Overview**: Contains 3 papers (two objectives from 2003/2004, one theory from 2024). Syllabus 5054. Covers mechanics, waves, electricity, nuclear physics, and thermal properties.
   - **Question Types & Patterns**:
     - **Objectives (Multiple Choice, ~40 questions)**: 4 options (A-D). Stems: "What is [quantity]?", "Which graph shows [effect]?", diagrams (e.g., circuits, waves, forces).
       - Example Pattern: Kinematics (e.g., terminal velocity: speed constant). Electricity (e.g., current in resistors).
       - Generation Tip: Randomize values (e.g., forces 1-100N, speeds 1-50 m/s).
     - **Theory (Structured, 9-11 questions)**: Multi-part with calculations, sketches, explanations. Marks: 1-5 per part. Includes waves (e.g., refraction), circuits (e.g., power = V²/R), radioactivity (half-life), orbits (e.g., Earth rotation speed).
       - Example Pattern: Energy (e.g., power = work/time). Nuclear (e.g., alpha decay: deduce neutrons/electrons).
       - Generation Tip: For infinite: Vary circuits (resistors 1-100Ω), isotopes (e.g., random mass/protons), or paths (e.g., rays in fields).
   - **Key Topics**: Mechanics/forces (25%), thermal/energy (15%), waves/light/sound (20%), electricity/circuits (20%), magnetism/electromagnetism (10%), nuclear/atomic (10%).

### 4. **CHEMISTRY**
   - **Overview**: Contains 2 papers (one objectives from 2018, one theory from 2024). Syllabus 5070. Focuses on stoichiometry, reactions, organic chemistry, and Periodic Table trends.
   - **Question Types & Patterns**:
     - **Objectives (Multiple Choice, ~40 questions)**: 4 options (A-D). Stems: "Which [statement/process]?", tests (e.g., litmus for gases), diagrams (dot-cross, structures).
       - Example Pattern: Bonding (e.g., covalent: ethane diagram). Reactions (e.g., photosynthesis equation).
       - Generation Tip: Randomize formulas (e.g., C_n H_{2n+2} for alkanes).
     - **Theory (Structured, 7 questions)**: Multi-part with equations, calculations, diagrams. Marks: 1-4 per part. Includes electrolysis, esters/polymers, redox (oxidation numbers), and Group trends.
       - Example Pattern: Esters (e.g., draw ethyl butanoate). Calculations (e.g., moles: mass/M_r).
       - Generation Tip: For infinite: Vary reactants (e.g., acid + alcohol → random ester), isotopes (e.g., Th-230 decay).
   - **Key Topics**: Atomic structure/bonding (20%), reactions/equations (25%), organic (esters/polymers, 15%), electrochemistry (10%), acids/bases (10%), Periodic Table/metals (10%), stoichiometry (10%).

### Overarching Patterns for Infinite Question Generation
- **Common Formats Across Subjects**:
  - **Diagrams**: Text-described (e.g., "NOT TO SCALE" triangles, circuits, cells).
  - **Graphs/Tables**: E.g., speed-time, pH changes.
  - **Calculations**: Frequent (e.g., speed = distance/time, moles = mass/M_r).
  - **Explanations/Proofs**: "Explain why/show that" (e.g., similarity in triangles, redox via oxidation numbers).
  - **Real-World Contexts**: Time zones, ecosystems, alloys, fuels.
- **Generation Guidelines**:
  - **Variety**: For {{questionType}}, generate appropriate questions. MCQs must have 4 options (A,B,C,D) with one correct answer.
  - **Output Format**: Question text + options (for MCQ) or space for answer (theory) + mark scheme/explanation. For visuals, describe them in text.

Output the questions in a clear, formatted way.`, 
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateIgcseQuestionsFlow = ai.defineFlow(
  {
    name: 'generateIgcseQuestionsFlow',
    inputSchema: GenerateIgcseQuestionsInputSchema,
    outputSchema: GenerateIgcseQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
