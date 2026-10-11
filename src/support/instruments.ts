export interface Instrument {
    /** Index in the original WebAudioFont catalog, distinct from a MIDI program number. */
    catalogIndex: number;
    key: string;
    title: string;
}

// Exact presets used by the original WebAudioFont catalog selections.
// Source: https://github.com/surikov/webaudiofontdata
export const steelGuitar: Instrument = {
    catalogIndex: 258,
    key: '0250_Chaos_sf2_file',
    title: 'Acoustic Guitar (steel): Guitar'
};

export const grandPiano: Instrument = {
    catalogIndex: 1,
    key: '0000_Aspirin_sf2_file',
    title: 'Acoustic Grand Piano: Piano'
};

export const brightPiano: Instrument = {
    catalogIndex: 11,
    key: '0010_Aspirin_sf2_file',
    title: 'Bright Acoustic Piano: Piano'
};
