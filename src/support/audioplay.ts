import WebAudioFontPlayer, {type NoteEnvelope, type Sf2Preset, type Sf2Zone} from 'webaudiofontplayer';
import {type Instrument} from '@/support/instruments';
import {toPitch} from '@/support/notes';

type LegacyPreset = {
    zones: (Omit<Sf2Zone, 'ahdsr'> & {ahdsr?: Sf2Zone['ahdsr'] | boolean})[];
};

interface SequenceNote {
    instrument: Instrument;
    note: string | number;
    duration?: number;
    delay?: number;
}

let audioContext: AudioContext;
let wrongAnswerBuffer: AudioBuffer;
const players = new Map<string, Promise<WebAudioFontPlayer>>();

function loadPreset(instrument: Instrument): Promise<LegacyPreset> {
    const variable = '_tone_' + instrument.key;
    const presets = window as unknown as Record<string, LegacyPreset | undefined>;
    const existingPreset = presets[variable];
    if (existingPreset) return Promise.resolve(existingPreset);

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://surikov.github.io/webaudiofontdata/sound/' + instrument.key + '.js';
        const cleanup = () => {
            clearTimeout(timeout);
            script.remove();
        };
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Timed out loading instrument: ' + instrument.title));
        }, 30000);
        script.onload = () => {
            cleanup();
            const preset = presets[variable];
            if (preset?.zones.length) resolve(preset);
            else reject(new Error('Invalid instrument preset: ' + instrument.title));
        };
        script.onerror = () => {
            cleanup();
            reject(new Error('Could not load instrument: ' + instrument.title));
        };
        document.head.appendChild(script);
    });
}

async function createPlayer(instrument: Instrument): Promise<WebAudioFontPlayer> {
    const legacyPreset = await loadPreset(instrument);
    const preset: Sf2Preset = {
        zones: legacyPreset.zones.map(zone => ({
            ...zone,
            // Legacy `true` selects WebAudioFont's default decay envelope.
            ahdsr: zone.ahdsr === true ? [
                {duration: 0, volume: 1},
                {duration: 0.5, volume: 1},
                {duration: 1.5, volume: 0.5},
                {duration: 3, volume: 0}
            ] : zone.ahdsr === false ? undefined : zone.ahdsr
        }))
    };
    const player = await WebAudioFontPlayer.load(preset, audioContext);
    if (preset.zones.some(zone => !zone.buffer)) {
        player.close();
        throw new Error('Could not decode instrument: ' + instrument.title);
    }
    // The new engine adds a master gain; retain the original playback level.
    player.setController(7, 127);
    return player;
}

function getPlayer(instrument: Instrument): Promise<WebAudioFontPlayer> {
    let pendingPlayer = players.get(instrument.key);
    if (!pendingPlayer) {
        pendingPlayer = createPlayer(instrument).catch(error => {
            players.delete(instrument.key);
            throw error;
        });
        players.set(instrument.key, pendingPlayer);
    }
    return pendingPlayer;
}

export async function playSequence(notes: SequenceNote[]): Promise<NoteEnvelope[]> {
    if (!audioContext) audioContext = new window.AudioContext();
    // Resume during the click handler, before network or decoding awaits.
    const [, instruments] = await Promise.all([
        audioContext.resume(),
        Promise.all(notes.map(note => getPlayer(note.instrument)))
    ]);
    const startTime = audioContext.currentTime;
    return notes.map((note, index) => {
        const pitch = typeof note.note === 'string' ? toPitch(note.note) : note.note;
        const envelope = instruments[index].queueWaveTable(
            startTime + (note.delay ?? 0), pitch, note.duration ?? 1
        );
        if (!envelope) throw new Error('No playable sample for pitch: ' + pitch);
        return envelope;
    });
}

export async function play(instrument: Instrument, note: string | number,
                           duration: number = 1, delay: number = 0): Promise<NoteEnvelope> {
    const [envelope] = await playSequence([{instrument, note, duration, delay}]);
    return envelope;
}

export async function playWrongAnswer(): Promise<void> {
    if (!audioContext) audioContext = new window.AudioContext();
    await audioContext.resume();

    const duration = 0.15;
    if (!wrongAnswerBuffer) {
        wrongAnswerBuffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * duration), audioContext.sampleRate);
        const samples = wrongAnswerBuffer.getChannelData(0);
        for (let index = 0; index < samples.length; index++) {
            samples[index] = Math.random() * 2 - 1;
        }
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = wrongAnswerBuffer;
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.5;
    const gain = audioContext.createGain();
    const startTime = audioContext.currentTime;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.01);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    noise.onended = () => {
        noise.disconnect();
        filter.disconnect();
        gain.disconnect();
    };
    noise.start(startTime);
    noise.stop(startTime + duration);
}
