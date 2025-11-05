# Mobile MCQ Parser Fix

Your mobile code's `parseMCQQuestion` function is mostly good, but here's an improved version that matches the web fixes and handles edge cases better:

## Updated parseMCQQuestion Function

Replace your existing `parseMCQQuestion` function with this improved version:

```typescript
// Robust MCQ parser: strips options out of the question display, supports:
// - Multi-line options: "A. ...\nB. ...\nC. ...\nD. ..."
// - Parentheses format: "A) ...\nB) ...\nC) ...\nD) ..."
// - Handles "Q1:" prefixes
// - Extracts correct answer from asterisk
const parseMCQQuestion = (questionText: string) => {
  if (!questionText) {
    return {
      question: "",
      options: [] as { letter: string; text: string; isCorrect: boolean }[],
    };
  }

  let text = questionText;
  
  // Remove "Q1:", "Q2:", etc. prefix if present
  text = text.replace(/^Q\d+:\s*/i, '');

  // Find the first occurrence of an option marker (A/B/C/D with . or ))
  const firstOptionIdx = text.search(/(?:^|\n)[A-D][\.\)]\s/);
  let mainQuestion = text;
  let optionsText = "";

  if (firstOptionIdx !== -1) {
    mainQuestion = text.slice(0, firstOptionIdx).trim();
    optionsText = text.slice(firstOptionIdx).trim();
  } else {
    // Same-line options fallback: try to detect A/B/C/D sequence on one line
    const inlineMatch = text.match(/([A-D])[\.\)]\s+[^*]+(\*?)(?=\s+[A-D][\.\)]|\s*$)/g);
    if (inlineMatch && inlineMatch.length >= 2) {
      // Assume everything before the first match is the main question
      const firstInlineIndex = text.indexOf(inlineMatch[0]);
      mainQuestion = text.slice(0, firstInlineIndex).trim();
      optionsText = text.slice(firstInlineIndex).trim();
    }
  }

  const options: { letter: string; text: string; isCorrect: boolean }[] = [];
  if (optionsText) {
    // Split options by newline or space before option markers
    const rawOptions = optionsText.split(/\n(?=[A-D][\.\)]\s)|(?<=\S)\s(?=[A-D][\.\)]\s)/g);
    rawOptions.forEach((chunk) => {
      const m = chunk.trim().match(/^([A-D])[\.\)]\s+([\s\S]*?)\s*(\*?)$/);
      if (m) {
        const [, letter, text, star] = m;
        options.push({
          letter,
          text: text.replace(/\*/g, "").trim(),
          isCorrect: !!star,
        });
      }
    });
  }

  // If we still didn't find options, try the final fallback splitting
  if (options.length === 0) {
    const fallback = text.split(/(?=(?:^|\n)[A-D][\.\)]\s)/g);
    if (fallback.length > 1) {
      mainQuestion = fallback[0].trim();
      fallback.slice(1).forEach((opt) => {
        const m = opt.trim().match(/^([A-D])[\.\)]\s+([\s\S]*?)\s*(\*?)$/);
        if (m) {
          const [, letter, text, star] = m;
          options.push({
            letter,
            text: text.replace(/\*/g, "").trim(),
            isCorrect: !!star,
          });
        }
      });
    }
  }

  // As a last resort, if no options parsed, leave the whole thing as the question
  if (options.length === 0) {
    return { question: text.trim(), options: [] };
  }
  
  return { question: mainQuestion.trim(), options };
};
```

## Key Improvements

1. **Removes "Q1:" prefix** - Handles questions like "Q1: Which of the following..."
2. **Better option splitting** - Handles both `A)` and `A.` formats more reliably
3. **Consistent letter extraction** - Properly extracts A, B, C, or D from options
4. **Asterisk handling** - Correctly identifies correct answers marked with `*`
5. **Multiple fallback strategies** - More robust parsing with multiple fallback methods

## Testing

After updating, test with:
- Questions with "Q1:" prefix
- Questions with `A)` format
- Questions with `A.` format  
- Questions with asterisk on correct answer: `C) Xylem (*)`
- Questions without clear formatting

Your mobile code should now match the web version's parsing behavior!

