import {expect, test} from 'vitest';
import {QuestionPractice} from '../questionpractice';

function createPractice() {
    let generated = 0;
    const practice = new QuestionPractice(() => ({id: ++generated}));
    return {practice, generated: () => generated};
}

function completeFreshQuestions(practice: QuestionPractice<{id: number}>, count: number, excludedId: number) {
    for (let i = 0; i < count; i++) {
        expect(practice.nextQuestion().id).not.toBe(excludedId);
        practice.registerAnswer(true);
    }
}

test('correct fresh questions do not create reviews', () => {
    const {practice, generated} = createPractice();
    for (let i = 1; i <= 30; i++) {
        expect(practice.nextQuestion().id).toBe(i);
        practice.registerAnswer(true);
    }
    expect(generated()).toBe(30);
});

test('a missed question returns after four intervening questions, then twelve, then retires', () => {
    const {practice, generated} = createPractice();
    const missed = practice.nextQuestion();
    practice.registerAnswer(false);
    practice.registerAnswer(true);

    completeFreshQuestions(practice, 4, missed.id);
    expect(practice.nextQuestion()).toBe(missed);
    expect(generated()).toBe(5);
    practice.registerAnswer(true);

    completeFreshQuestions(practice, 12, missed.id);
    expect(practice.nextQuestion()).toBe(missed);
    practice.registerAnswer(true);
    completeFreshQuestions(practice, 30, missed.id);
});

test('multiple wrong attempts neither advance the queue nor duplicate a review', () => {
    const {practice} = createPractice();
    const missed = practice.nextQuestion();
    for (let i = 0; i < 10; i++) practice.registerAnswer(false);
    expect(() => practice.nextQuestion()).toThrow(/correctly/);
    practice.registerAnswer(true);
    completeFreshQuestions(practice, 4, missed.id);
    expect(practice.nextQuestion()).toBe(missed);
    practice.registerAnswer(true);
    completeFreshQuestions(practice, 12, missed.id);
    expect(practice.nextQuestion()).toBe(missed);
    practice.registerAnswer(true);
    completeFreshQuestions(practice, 20, missed.id);
});

test('missing the second review restarts both review intervals', () => {
    const {practice} = createPractice();
    const missed = practice.nextQuestion();
    practice.registerAnswer(false);
    practice.registerAnswer(true);
    completeFreshQuestions(practice, 4, missed.id);
    expect(practice.nextQuestion()).toBe(missed);
    practice.registerAnswer(true);
    completeFreshQuestions(practice, 12, missed.id);
    expect(practice.nextQuestion()).toBe(missed);
    practice.registerAnswer(false);
    practice.registerAnswer(true);
    completeFreshQuestions(practice, 4, missed.id);
    expect(practice.nextQuestion()).toBe(missed);
    practice.registerAnswer(true);
    completeFreshQuestions(practice, 12, missed.id);
    expect(practice.nextQuestion()).toBe(missed);
    practice.registerAnswer(true);
    completeFreshQuestions(practice, 20, missed.id);
});

test('several missed questions each retain their own review schedule', () => {
    const {practice} = createPractice();
    const first = practice.nextQuestion();
    practice.registerAnswer(false);
    practice.registerAnswer(true);
    const second = practice.nextQuestion();
    practice.registerAnswer(false);
    practice.registerAnswer(true);
    completeFreshQuestions(practice, 3, first.id);
    expect(practice.nextQuestion()).toBe(first);
    practice.registerAnswer(true);
    expect(practice.nextQuestion()).toBe(second);
    practice.registerAnswer(true);
});

test('reset discards the active question, queued reviews, and review progress', () => {
    let gap = 2;
    let sameOption = true;
    let generated = 0;
    const practice = new QuestionPractice(() => ({id: ++generated, gap, sameOption}));
    const missed = practice.nextQuestion();
    practice.registerAnswer(false);
    practice.registerAnswer(true);
    practice.nextQuestion();
    practice.registerAnswer(false);

    gap = 5;
    sameOption = false;
    practice.reset();
    for (let i = 0; i < 25; i++) {
        const question = practice.nextQuestion();
        expect(question.id).not.toBe(missed.id);
        expect(question.gap).toBe(5);
        expect(question.sameOption).toBe(false);
        practice.registerAnswer(true);
    }
});

test('new instances have no shared practice history', () => {
    const createQuestion = () => ({id: 1});
    const previousSession = new QuestionPractice(createQuestion);
    previousSession.nextQuestion();
    previousSession.registerAnswer(false);

    const nextSession = new QuestionPractice(createQuestion);
    expect(nextSession.nextQuestion()).toEqual({id: 1});
    nextSession.registerAnswer(true);
});

test('answers require an active question', () => {
    const {practice} = createPractice();
    expect(() => practice.registerAnswer(false)).toThrow(/Request a question/);
    practice.nextQuestion();
    practice.registerAnswer(true);
    expect(() => practice.registerAnswer(true)).toThrow(/Request a question/);
});
