import { useState } from 'react'
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useSyncChannel } from '../hooks/useSyncChannel'
import { apiBase, type Device, type DeviceKind } from '../sync/client'
import { color, shadow } from '../theme/tokens'

const KIND_LABEL: Record<DeviceKind, string> = {
  phone: 'celular',
  watch: 'relógio',
  earbuds: 'fone',
  desktop: 'computador'
}

const KIND_GLYPH: Record<DeviceKind, string> = {
  phone: 'M7.4 2.6h9.2v18.8H7.4zM10.4 18.6h3.2',
  watch: 'M12 7.4v4.2l2.6 1.6M12 19.4a7.4 7.4 0 1 0 0-14.8 7.4 7.4 0 0 0 0 14.8Z',
  earbuds: 'M12 3.4a7 7 0 0 0-7 7v5.2M12 3.4a7 7 0 0 1 7 7v5.2',
  desktop: 'M3 5h18v11H3zM9 20h6M12 16v4'
}

const SOFT = { ...shadow.card, shadowOpacity: 0.06 }
const LABEL_CAPS = 'font-strong text-caps text-label'

export function SyncPanel() {
  const { code, deviceId, devices, open, connect, close } = useSyncChannel()
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleOpen() {
    setBusy(true)
    setError(null)
    const created = await open()
    if (!created) setError(`A API não respondeu em ${apiBase()}`)
    setBusy(false)
  }

  async function handleJoin() {
    if (typed.length !== 4) return
    setBusy(true)
    setError(null)
    const joined = await connect(typed)
    if (!joined) setError('Código não encontrado.')
    else setTyped('')
    setBusy(false)
  }

  if (!code) {
    const joinOff = busy || typed.length !== 4

    return (
      <View className="gap-2.5">
        <Pressable
          onPress={handleOpen}
          disabled={busy}
          className={`min-h-tap items-center justify-center rounded-large bg-fg ${
            busy ? 'opacity-45' : ''
          }`}
        >
          {busy ? (
            <ActivityIndicator color={color.ink} />
          ) : (
            <Text className="font-strong text-body text-ink">Abrir uma sessão</Text>
          )}
        </Pressable>

        <View className="flex-row gap-2">
          <TextInput
            keyboardType="number-pad"
            maxLength={4}
            value={typed}
            onChangeText={text => setTyped(text.replace(/\D/g, '').slice(0, 4))}
            placeholder="0000"
            placeholderTextColor={color.faint}
            accessibilityLabel="Código da sessão"
            className="min-h-tap flex-1 rounded-large bg-surface text-center font-mid text-[20px] tracking-[6px] text-fg"
            style={SOFT}
          />
          <Pressable
            onPress={handleJoin}
            disabled={joinOff}
            className={`min-h-tap items-center justify-center rounded-large bg-surface px-5 ${
              joinOff ? 'opacity-45' : ''
            }`}
            style={SOFT}
          >
            <Text className="font-strong text-body text-fg">Entrar</Text>
          </Pressable>
        </View>

        {error && <Text className="font-mid text-note text-mastery-low">{error}</Text>}

        <Text className="font-book text-[11.5px] leading-[17px] text-faint">
          Abra a sessão aqui e digite o código no relógio. A ponte leva identificador, degrau e
          aresta — nunca a palavra.
        </Text>
      </View>
    )
  }

  return (
    <View className="gap-2.5">
      <View className="flex-row items-center rounded-large bg-surface p-4" style={SOFT}>
        <View className="flex-1">
          <Text className={LABEL_CAPS}>CÓDIGO DA SESSÃO</Text>
          <Text className="mt-1 font-mid text-[28px] tracking-[5px] text-fg">{code}</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <View className="size-1.5 rounded-full bg-mastery-high" />
          <Text className="font-strong text-[11.5px] text-mastery-high">no ar</Text>
        </View>
      </View>

      {devices.map(device => (
        <DeviceRow key={device.id} device={device} isSelf={device.id === deviceId} />
      ))}

      {devices.length < 2 && (
        <Text className="rounded-large border border-dashed border-line px-4 py-3.5 font-book text-note leading-[18px] text-faint">
          Esperando o segundo aparelho. Abra /watch no relógio ou noutro aparelho e digite {code}.
        </Text>
      )}

      <Pressable
        onPress={close}
        className="min-h-tap items-center justify-center rounded-large bg-surface"
        style={SOFT}
      >
        <Text className="font-strong text-hint text-dim">Encerrar a sessão</Text>
      </Pressable>
    </View>
  )
}

function DeviceRow({ device, isSelf }: { device: Device; isSelf: boolean }) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-large bg-surface px-4 py-3"
      style={SOFT}
    >
      <Svg viewBox="0 0 24 24" width={20} height={20}>
        <Path
          d={KIND_GLYPH[device.kind]}
          fill="none"
          stroke={color.dim}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <View className="min-w-0 flex-1">
        <Text className="font-strong text-body text-fg" numberOfLines={1}>
          {device.name}
          {isSelf ? '  · este aqui' : ''}
        </Text>
        <Text className={LABEL_CAPS}>{KIND_LABEL[device.kind].toUpperCase()}</Text>
      </View>
      <View className="size-1.5 rounded-full bg-mastery-high" />
    </View>
  )
}
