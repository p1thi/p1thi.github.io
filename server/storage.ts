import { Question, UserAnswer, ValidationResult, Point, Line } from "@shared/schema";

export interface IStorage {
  getQuestions(): Promise<Question[]>;
  validateAnswer(answer: UserAnswer): Promise<ValidationResult>;
}

export class MemStorage implements IStorage {
  private questions: Question[];

  constructor() {
    this.questions = this.initializeQuestions();
  }

  private initializeQuestions(): Question[] {
    return [
      {
        id: "q1",
        type: "angle_bisector",
        title: "Draw the Angle Bisector",
        description: "Given angle ABC with points A, B (vertex), and C, draw the angle bisector from vertex B.",
        instructions: [
          "Click on the Line tool in the toolbar",
          "Click on the vertex point B",
          "Draw a line that divides the angle into two equal parts",
          "The bisector should pass through the vertex and divide the angle equally"
        ],
        givenPoints: [
          { x: 400, y: 100 },  // Point A
          { x: 400, y: 300 },  // Point B (vertex)
          { x: 600, y: 300 },  // Point C
        ],
        givenLines: [
          {
            start: { x: 400, y: 300 },  // B to A
            end: { x: 400, y: 100 },
            isUserDrawn: false,
          },
          {
            start: { x: 400, y: 300 },  // B to C
            end: { x: 600, y: 300 },
            isUserDrawn: false,
          },
        ],
        givenAngles: [
          {
            point1: { x: 400, y: 100 },  // A
            vertex: { x: 400, y: 300 },  // B
            point2: { x: 600, y: 300 },  // C
            measure: 90,
          },
        ],
        correctAnswer: {
          bisectorLine: {
            start: { x: 400, y: 300 },
            end: { x: 541, y: 159 },  // 45 degrees from both rays
            isUserDrawn: true,
          },
        },
        hint: "The angle bisector divides the 90° angle into two 45° angles. It should go diagonally from the vertex.",
      },
      {
        id: "q2",
        type: "angle_bisector",
        title: "Bisect a Different Angle",
        description: "Draw the angle bisector for the angle formed by the two given lines meeting at the vertex.",
        instructions: [
          "Identify the vertex where the two lines meet",
          "Use the Line tool to draw the bisector",
          "The bisector should split the angle into two equal parts"
        ],
        givenPoints: [
          { x: 300, y: 200 },  // Point A
          { x: 400, y: 300 },  // Point B (vertex)
          { x: 500, y: 150 },  // Point C
        ],
        givenLines: [
          {
            start: { x: 400, y: 300 },
            end: { x: 300, y: 200 },
            isUserDrawn: false,
          },
          {
            start: { x: 400, y: 300 },
            end: { x: 500, y: 150 },
            isUserDrawn: false,
          },
        ],
        givenAngles: [
          {
            point1: { x: 300, y: 200 },
            vertex: { x: 400, y: 300 },
            point2: { x: 500, y: 150 },
          },
        ],
        correctAnswer: {
          bisectorLine: {
            start: { x: 400, y: 300 },
            end: { x: 400, y: 175 },
            isUserDrawn: true,
          },
        },
        hint: "Look at the angles formed by each ray from the vertex. The bisector should create two equal angles.",
      },
      {
        id: "q3",
        type: "angle_bisector",
        title: "Acute Angle Bisector",
        description: "Find and draw the bisector of this acute angle.",
        instructions: [
          "Observe the acute angle formed by the two rays",
          "Draw a line from the vertex that divides the angle equally",
          "Verify your line creates two equal angles"
        ],
        givenPoints: [
          { x: 350, y: 250 },  // Point A
          { x: 400, y: 350 },  // Point B (vertex)
          { x: 550, y: 250 },  // Point C
        ],
        givenLines: [
          {
            start: { x: 400, y: 350 },
            end: { x: 350, y: 250 },
            isUserDrawn: false,
          },
          {
            start: { x: 400, y: 350 },
            end: { x: 550, y: 250 },
            isUserDrawn: false,
          },
        ],
        givenAngles: [
          {
            point1: { x: 350, y: 250 },
            vertex: { x: 400, y: 350 },
            point2: { x: 550, y: 250 },
            measure: 60,
          },
        ],
        correctAnswer: {
          bisectorLine: {
            start: { x: 400, y: 350 },
            end: { x: 450, y: 250 },
            isUserDrawn: true,
          },
        },
        hint: "This angle measures approximately 60°. The bisector should create two 30° angles.",
      },
    ];
  }

  async getQuestions(): Promise<Question[]> {
    return this.questions;
  }

  async validateAnswer(answer: UserAnswer): Promise<ValidationResult> {
    const question = this.questions.find((q) => q.id === answer.questionId);
    
    if (!question) {
      return {
        isCorrect: false,
        message: "Question not found",
        partialCredit: false,
      };
    }

    if (question.type === "angle_bisector") {
      return this.validateAngleBisector(answer, question);
    }

    return {
      isCorrect: false,
      message: "Unknown question type",
      partialCredit: false,
    };
  }

  private validateAngleBisector(answer: UserAnswer, question: Question): ValidationResult {
    if (answer.drawnLines.length === 0) {
      return {
        isCorrect: false,
        message: "You haven't drawn any lines yet. Try drawing a line from the vertex that splits the angle in half.",
        partialCredit: false,
      };
    }

    const correctBisector = question.correctAnswer.bisectorLine;
    if (!correctBisector) {
      return {
        isCorrect: false,
        message: "No correct answer defined for this question",
        partialCredit: false,
      };
    }

    const vertex = question.givenAngles[0]?.vertex;
    if (!vertex) {
      return {
        isCorrect: false,
        message: "No vertex found in question",
        partialCredit: false,
      };
    }

    const userLine = answer.drawnLines[answer.drawnLines.length - 1];

    const startsAtVertex = this.isPointNear(userLine.start, vertex, 20) || 
                          this.isPointNear(userLine.end, vertex, 20);

    if (!startsAtVertex) {
      return {
        isCorrect: false,
        message: "The angle bisector must start from the vertex of the angle. Try again!",
        partialCredit: false,
        hint: "Make sure your line starts at the point where the two given lines meet.",
      };
    }

    const angle1 = question.givenAngles[0];
    const userBisectorAngle = this.calculateLineAngle(userLine, vertex);
    const ray1Angle = this.calculateAngleBetweenPoints(angle1.point1, vertex);

    let expectedBisectorAngle: number;
    
    if (angle1.measure !== undefined) {
      expectedBisectorAngle = ray1Angle + (angle1.measure / 2);
    } else {
      const ray2Angle = this.calculateAngleBetweenPoints(angle1.point2, vertex);
      let angleDiff = ray2Angle - ray1Angle;
      
      if (angleDiff < -180) angleDiff += 360;
      if (angleDiff > 180) angleDiff -= 360;
      
      expectedBisectorAngle = ray1Angle + angleDiff / 2;
    }
    
    expectedBisectorAngle = this.normalizeAngle(expectedBisectorAngle);

    let difference = Math.abs(userBisectorAngle - expectedBisectorAngle);
    if (difference > 180) difference = 360 - difference;

    const tolerance = 15;

    if (difference <= tolerance) {
      return {
        isCorrect: true,
        message: "Perfect! You've correctly drawn the angle bisector. The line divides the angle into two equal parts.",
        partialCredit: false,
      };
    } else if (difference <= tolerance * 2) {
      return {
        isCorrect: false,
        message: "You're close! Your bisector is slightly off. Try to make the two angles more equal.",
        partialCredit: true,
        hint: "Aim to split the angle exactly in half. The two resulting angles should be equal.",
      };
    } else {
      return {
        isCorrect: false,
        message: "Not quite right. Remember, the angle bisector should divide the angle into two equal parts.",
        partialCredit: false,
        hint: question.hint,
      };
    }
  }

  private isPointNear(p1: Point, p2: Point, threshold: number): boolean {
    const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    return distance <= threshold;
  }

  private calculateLineAngle(line: Line, vertex: Point): number {
    const relevantEnd = this.isPointNear(line.start, vertex, 20) ? line.end : line.start;
    return this.calculateAngleBetweenPoints(relevantEnd, vertex);
  }

  private calculateAngleBetweenPoints(point: Point, vertex: Point): number {
    const dx = point.x - vertex.x;
    const dy = point.y - vertex.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    return this.normalizeAngle(angle);
  }

  private normalizeAngle(angle: number): number {
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  }
}

export const storage = new MemStorage();
