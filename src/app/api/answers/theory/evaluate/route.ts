import { NextRequest, NextResponse } from 'next/server';
import { solveQuestion } from '@/ai/flows/solve-question';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const question = formData.get('question') as string;
    const subject = formData.get('subject') as string;
    const answer = formData.get('answer') as string;
    const answerImage = formData.get('answerImage') as File | null;

    if (!question || !subject || (!answer && !answerImage)) {
      return NextResponse.json(
        { error: 'Missing required parameters: question, subject, and either answer text or image are required' },
        { status: 400 }
      );
    }

    let answerContent = answer || '';

    // If there's an image, we could potentially use OCR or image analysis here
    // For now, we'll just acknowledge the image
    if (answerImage) {
      const imageBuffer = await answerImage.arrayBuffer();
      // Here you would typically:
      // 1. Save the image to a storage service
      // 2. Process it with OCR if needed
      // 3. Add the image URL or OCR text to the answer
      answerContent += `\n[Student submitted an image answer: ${answerImage.name}]`;
    }

    // Combine the question and student's answer for evaluation
    const fullQuestion = `Question: ${question}\n\nStudent's Answer: ${answerContent}`;

    const result = await solveQuestion({
      question: fullQuestion,
      subject,
    });

    return NextResponse.json({ 
      solution: result.solution,
      imageReceived: !!answerImage
    });
  } catch (error) {
    console.error('Error evaluating theory answer:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate theory answer' },
      { status: 500 }
    );
  }
}
