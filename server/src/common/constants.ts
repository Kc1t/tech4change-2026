export const MODEL_TIMEOUT_MS = 2500
export const CANDIDATE_POOL_SIZE = 40
export const SPREAD_DECAY = 0.6
export const DEFAULT_MODEL = 'claude-sonnet-5'
export const DEFAULT_MODEL_BASE_URL = 'https://api.anthropic.com'
export const DEFAULT_FREE_MODEL = 'llama-3.3-70b-versatile'
export const DEFAULT_FREE_BASE_URL = 'https://api.groq.com/openai'
export const STT_PATH = '/v1/stt'
export const STT_MODEL = 'flux-general-multi'
export const STT_MAX_SESSIONS = 20
export const STT_MAX_SESSION_MS = 10 * 60_000
export const STT_MAX_KEYTERMS = 24
export const STT_MAX_KEYTERM_LENGTH = 40
export const STT_MAX_PENDING_CHUNKS = 50
export const TTS_MODEL = 'eleven_flash_v2_5'
export const TTS_VOICES = [
  { id: 'clara', name: 'Clara', description: 'calma e acolhedora', providerId: 'EXAVITQu4vr4xnSDxMaL' },
  { id: 'lia', name: 'Lia', description: 'leve e carinhosa', providerId: 'cgSgspJ2msm6clMCkdW9' },
  { id: 'davi', name: 'Davi', description: 'grave e tranquilo', providerId: 'nPczCjzI2devNBz1zQrb' },
  { id: 'tomas', name: 'Tomás', description: 'maduro e paciente', providerId: 'pqHfZKP75CvOlQylNhV4' }
] as const
export const TTS_VOICE_SETTINGS = { stability: 0.6, similarity_boost: 0.8, speed: 0.9 }
export const TTS_OUTPUT_FORMAT = 'mp3_22050_32'
export const TTS_TIMEOUT_MS = 6000
export const TTS_CACHE_SIZE = 300
export const TTS_MAX_TEXT_LENGTH = 200

export const ASK_TIMEOUT_MS = 12_000
export const ASK_MAX_TOKENS = 420
export const ASK_MAX_QUESTION = 400
