import {type PresetInfo, type WaveEnvelope, type WavePreset, WebAudioFontPlayer} from "@/support/webaudiofont";
import {toPitch} from "@/support/notes";

let audioContext: AudioContext
export const player: WebAudioFontPlayer = new WebAudioFontPlayer()

async function getPreset(presetInfo: PresetInfo): Promise<WavePreset> {
    if (!audioContext) audioContext = new window.AudioContext()
    return await player.loader.getPreset(audioContext, presetInfo)
}

export async function play(presetInfo: PresetInfo, note: string | number,
                           duration: number = 1, delay: number = 0) : Promise<WaveEnvelope> {
    let preset = await getPreset(presetInfo)
    let pitch = typeof note === "string" ? toPitch(note) : note
    return await player.queueWaveTable(audioContext, audioContext.destination, preset,
        delay, pitch, duration)
}
