# IGCSE Question Generator API

This API provides endpoints for generating IGCSE/WAEC exam questions and evaluating student answers.

## API Endpoints

### 1. Get MCQ Questions
Generate 40 multiple-choice questions for a specific subject and exam board.

```http
GET /api/questions/mcq?examBoard=IGCSE&subject=Physics&targetYear=2024
```

#### Query Parameters
- `examBoard` (required): Either 'IGCSE' or 'WAEC'
- `subject` (required): One of 'Mathematics', 'Biology', 'Physics', 'Chemistry'
- `targetYear` (optional): Target year for the questions (e.g., 2024)

#### Response Structure
```typescript
{
  questions: Array<{
    questionType: 'MCQ',
    questionText: string,  // Includes the question and options A-D with correct answer marked with *
    diagramUrl: string | null
  }>
}

// Example Response
{
  "questions": [
    {
      "questionType": "MCQ",
      "questionText": "A body of mass 2kg is acted upon by a force of 10N. What is its acceleration?\nA) 2 m/s²\nB) 4 m/s²\nC) *5 m/s²\nD) 8 m/s²",
      "diagramUrl": null
    },
    // ... 39 more questions
  ]
}
```

### 2. Get Theory Questions
Generate 10 theory questions for a specific subject and exam board.

```http
GET /api/questions/theory?examBoard=IGCSE&subject=Physics&targetYear=2024
```

#### Query Parameters
Same as MCQ endpoint

#### Response Structure
```typescript
{
  questions: Array<{
    questionType: 'Theory',
    questionText: string,  // Multi-part theory question
    diagramUrl: string | null
  }>
}

// Example Response
{
  "questions": [
    {
      "questionType": "Theory",
      "questionText": "A student investigates the motion of a pendulum.\na) Describe how the period of oscillation can be measured accurately. [3 marks]\nb) Explain how changing the length affects the period. [4 marks]",
      "diagramUrl": null
    },
    // ... 9 more questions
  ]
}
```

### 3. Submit MCQ Answer
Submit a student's answer for an MCQ question.

```http
POST /api/answers/mcq/submit
```

#### Request Body
```typescript
{
  questionId: string,    // Unique identifier for the question
  selectedOption: string // One of: 'A', 'B', 'C', 'D'
}
```

#### Response Structure
```typescript
{
  received: boolean,
  questionId: string,
  selectedOption: string
}

// Example Response
{
  "received": true,
  "questionId": "q1",
  "selectedOption": "C"
}
```

### 4. Evaluate Theory Answer
Submit a student's theory answer (text and/or image) for AI evaluation.

```http
POST /api/answers/theory/evaluate
Content-Type: multipart/form-data
```

#### Request Body (FormData)
```typescript
{
  question: string,     // The original question
  subject: string,      // Subject name
  answer?: string,      // Student's text answer (optional if image provided)
  answerImage?: File    // Student's answer image (optional if text provided)
}
```

Note: At least one of `answer` or `answerImage` must be provided.

#### Response Structure
```typescript
{
  solution: string,     // HTML-formatted detailed evaluation and solution
  imageReceived: boolean // Indicates if an image was received with the submission
}

// Example Response
{
  "solution": "<p>Student's answer demonstrates good understanding...</p><p>Key points covered:</p><ul><li>Correct explanation of measurement process</li>...</ul>",
  "imageReceived": true
}
```

## Usage Examples

```typescript
// Fetching MCQ Questions
const fetchMCQQuestions = async () => {
  const response = await fetch('/api/questions/mcq?examBoard=IGCSE&subject=Physics');
  const data = await response.json();
  const { questions } = data;  // Array of 40 MCQ questions
};

// Fetching Theory Questions
const fetchTheoryQuestions = async () => {
  const response = await fetch('/api/questions/theory?examBoard=IGCSE&subject=Physics');
  const data = await response.json();
  const { questions } = data;  // Array of 10 theory questions
};

// Submitting MCQ Answer
const submitMCQAnswer = async () => {
  const response = await fetch('/api/answers/mcq/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      questionId: 'q1',
      selectedOption: 'C'
    })
  });
  const { received, questionId, selectedOption } = await response.json();
};

// Evaluating Theory Answer
const evaluateTheoryAnswer = async () => {
  const response = await fetch('/api/answers/theory/evaluate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: "Describe Newton's First Law of Motion",
      subject: "Physics",
      answer: "An object remains at rest or continues in uniform motion..."
    })
  });
  const { solution } = await response.json();  // HTML-formatted evaluation
};
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Successful request
- 400: Bad request (missing or invalid parameters)
- 500: Server error

Error responses have the following structure:
```typescript
{
  error: string  // Error message describing what went wrong
}
```

## Notes

1. MCQ questions always include 4 options (A, B, C, D) with the correct answer marked with an asterisk (*).
2. Theory questions may include multiple parts and mark allocations.
3. Diagram URLs are currently returned as null but may be implemented in future versions.
4. All responses are in JSON format.
