const notesToHalfSteps = new Map<string, number>([
    ['C', 0],
    ['C#', 1],
    ['Db', 1],
    ['D', 2],
    ['D#', 3],
    ['Eb', 3],
    ['E', 4],
    ['F', 5],
    ['F#', 6],
    ['Gb', 6],
    ['G', 7],
    ['G#', 8],
    ['Ab', 8],
    ['A', 9],
    ['A#', 10],
    ['Bb', 10],
    ['B', 11]
]);

export function toPitch(note_with_octave: string): number {
    const note = notesToHalfSteps.get(note_with_octave.slice(0, -1));
    const octave = parseInt(note_with_octave.slice(-1));
    if (note === undefined || isNaN(octave)) {
        throw new Error('Invalid note ' + note_with_octave);
    }

    return 12 * octave + note;
}

export function toNotation(pitch: number): string {
    const note = pitch % 12;
    const octave = Math.floor(pitch / 12);
    for (const [key, value] of notesToHalfSteps) {
        if (value === note) {
            return key + octave;
        }
    }
    throw new Error('Invalid pitch ' + pitch);
}
