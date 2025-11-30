import { z } from "zod";

// Point in 2D space
export const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export type Point = z.infer<typeof pointSchema>;

// Line defined by two points
export const lineSchema = z.object({
  start: pointSchema,
  end: pointSchema,
  isUserDrawn: z.boolean().default(false),
});

export type Line = z.infer<typeof lineSchema>;

// Angle defined by three points (vertex in middle)
export const angleSchema = z.object({
  point1: pointSchema,
  vertex: pointSchema,
  point2: pointSchema,
  measure: z.number().optional(), // degrees
});

export type Angle = z.infer<typeof angleSchema>;

// Question types
export const questionTypeSchema = z.enum([
  "angle_bisector",
  "angle_measurement",
  "complementary_angles",
  "supplementary_angles",
]);

export type QuestionType = z.infer<typeof questionTypeSchema>;

// Question structure
export const questionSchema = z.object({
  id: z.string(),
  type: questionTypeSchema,
  title: z.string(),
  description: z.string(),
  instructions: z.array(z.string()),
  givenPoints: z.array(pointSchema),
  givenLines: z.array(lineSchema),
  givenAngles: z.array(angleSchema),
  correctAnswer: z.object({
    bisectorLine: lineSchema.optional(),
    angleMeasure: z.number().optional(),
    points: z.array(pointSchema).optional(),
  }),
  hint: z.string().optional(),
});

export type Question = z.infer<typeof questionSchema>;

// User answer
export const userAnswerSchema = z.object({
  questionId: z.string(),
  drawnLines: z.array(lineSchema),
  drawnPoints: z.array(pointSchema),
  angleMeasure: z.number().optional(),
});

export type UserAnswer = z.infer<typeof userAnswerSchema>;

// Game progress
export const gameProgressSchema = z.object({
  currentQuestionIndex: z.number(),
  score: z.number(),
  totalQuestions: z.number(),
  answeredCorrectly: z.array(z.string()), // question IDs
});

export type GameProgress = z.infer<typeof gameProgressSchema>;

// Answer validation result
export const validationResultSchema = z.object({
  isCorrect: z.boolean(),
  message: z.string(),
  partialCredit: z.boolean().default(false),
  hint: z.string().optional(),
});

export type ValidationResult = z.infer<typeof validationResultSchema>;
