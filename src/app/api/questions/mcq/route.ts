import { NextRequest, NextResponse } from 'next/server';
import { generateIgcseQuestions } from '@/ai/flows/generate-igcse-questions';

// Simple in-memory cache with TTL to speed up repeated requests
type CacheEntry = { expiresAt: number; data: any };
const cache = new Map<string, CacheEntry>();
const TTL_MS = 30 * 60 * 1000; // 30 minutes

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

    const cacheKey = `questions:${examBoard}:${subject}:${targetYear ?? 'na'}:mcq`;
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return NextResponse.json(cached.data);
    }

    const result = await generateIgcseQuestions({
      examBoard,
      subject,
      targetYear,
      questionTypes: ['MCQ'],
      counts: { mcq: 40 },
    });

    const mcqQuestions = result.questions.filter(q => q.questionType === 'MCQ');
    const payload = { questions: mcqQuestions };
    cache.set(cacheKey, { expiresAt: now + TTL_MS, data: payload });

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error generating MCQ questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate MCQ questions' },
      { status: 500 }
    );
  }
}
