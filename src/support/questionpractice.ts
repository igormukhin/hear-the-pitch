type Review<T> = {
    question: T;
    dueAfter: number;
    successfulReviews: number;
};

/** In-memory practice queue. Intervals count completed intervening questions. */
export class QuestionPractice<T> {
    private createQuestion: () => T;
    private reviews: Review<T>[] = [];
    private completedQuestions = 0;
    private current: {question: T; review?: Review<T>; missed: boolean} | undefined;

    constructor(createQuestion: () => T) {
        this.createQuestion = createQuestion;
    }

    nextQuestion(): T {
        if (this.current) {
            throw new Error('Answer the current question correctly before advancing');
        }

        const reviewIndex = this.reviews.findIndex(review => review.dueAfter <= this.completedQuestions);
        const review = reviewIndex === -1 ? undefined : this.reviews.splice(reviewIndex, 1)[0];
        const question = review ? review.question : this.createQuestion();
        this.current = {question, review, missed: false};
        return question;
    }

    registerAnswer(correct: boolean): void {
        if (!this.current) {
            throw new Error('Request a question before registering an answer');
        }
        if (!correct) {
            this.current.missed = true;
            return;
        }

        this.completedQuestions++;
        const {question, review, missed} = this.current;
        if (missed) {
            // Repeated attempts on one question create just one queued review.
            this.reviews.push({question, dueAfter: this.completedQuestions + 4, successfulReviews: 0});
        } else if (review && review.successfulReviews === 0) {
            this.reviews.push({question, dueAfter: this.completedQuestions + 12, successfulReviews: 1});
        }
        // A second successful delayed review retires the question.
        this.current = undefined;
    }

    reset(): void {
        this.reviews = [];
        this.completedQuestions = 0;
        this.current = undefined;
    }
}
