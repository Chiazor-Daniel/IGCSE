import { NextRequest, NextResponse } from 'next/server';
import { generateIgcseQuestions } from '@/ai/flows/generate-igcse-questions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const examBoard = searchParams.get('examBoard') as 'IGCSE' | 'WAEC';
    const subject = searchParams.get('subject') as 'Mathematics' | 'Biology' | 'Physics' | 'Chemistry';
    const targetYear = searchParams.get('targetYear') ? Number(searchParams.get('targetYear')) : undefined;

    if (!examBoard || !subject) {
      return NextResponse.json(
        { error: 'Missing required parameters: examBoard and subject are required' },
        { status: 400 }
      );
    }

    const result = await generateIgcseQuestions({
      examBoard,
      subject,
      targetYear,
    });

    // Filter only MCQ questions (40 questions)
    const mcqQuestions = result.questions.filter(q => q.questionType === 'MCQ');

    return NextResponse.json({ questions: mcqQuestions });
  } catch (error) {
    console.error('Error generating MCQ questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate MCQ questions' },
      { status: 500 }
    );
  }
}
