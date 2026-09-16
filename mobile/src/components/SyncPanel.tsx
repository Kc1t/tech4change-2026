import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useSyncChannel } from '../hooks/useSyncChannel'
import { apiBase, type Device, type DeviceKind } from '../sync/client'
import { color, font, radius, shadow, tap } from '../theme/tokens'

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
    return (
      <View style={styles.block}>
        <Pressable onPress={handleOpen} disabled={busy} style={[styles.primary, busy && styles.dim]}>
          {busy ? (
            <ActivityIndicator color={color.ink} />
          ) : (
            <Text style={styles.primaryText}>Abrir uma sessão</Text>
          )}
        </Pressable>

        <View style={styles.joinRow}>
          <TextInput
            keyboardType="number-pad"
            maxLength={4}
            value={typed}
            onChangeText={text => setTyped(text.replace(/\D/g, '').slice(0, 4))}
            placeholder="0000"
            placeholderTextColor={color.faint}
            accessibilityLabel="Código da sessão"
            style={styles.input}
          />
          <Pressable
            onPress={handleJoin}
            disabled={busy || typed.length !== 4}
            style={[styles.join, (busy || typed.length !== 4) && styles.dim]}
          >
            <Text style={styles.joinText}>Entrar</Text>
          </Pressable>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Text style={styles.note}>
          Abra a sessão aqui e digite o código no relógio. A ponte leva identificador, degrau e
          aresta — nunca a palavra.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.block}>
      <View style={styles.codeCard}>
        <View style={styles.codeBody}>
          <Text style={styles.labelCaps}>CÓDIGO DA SESSÃO</Text>
          <Text style={styles.code}>{code}</Text>
        </View>
        <View style={styles.live}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>no ar</Text>
        </View>
      </View>

      {devices.map(device => (
        <DeviceRow key={device.id} device={device} isSelf={device.id === deviceId} />
      ))}

      {devices.length < 2 && (
        <Text style={styles.waiting}>
          Esperando o segundo aparelho. Abra /watch no relógio ou noutro aparelho e digite {code}.
        </Text>
      )}

      <Pressable onPress={close} style={styles.close}>
        <Text style={styles.closeText}>Encerrar a sessão</Text>
      </Pressable>
    </View>
  )
}

function DeviceRow({ device, isSelf }: { device: Device; isSelf: boolean }) {
  return (
    <View style={styles.deviceRow}>
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
      <View style={styles.deviceBody}>
        <Text style={styles.deviceName} numberOfLines={1}>
          {device.name}
          {isSelf ? '  · este aqui' : ''}
        </Text>
        <Text style={styles.labelCaps}>{KIND_LABEL[device.kind].toUpperCase()}</Text>
      </View>
      <View style={styles.liveDot} />
    </View>
  )
}

const styles = StyleSheet.create({
  block: { gap: 10 },
  dim: { opacity: 0.45 },
  primary: {
    minHeight: tap.min,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.fg,
    borderRadius: radius.large
  },
  primaryText: { fontFamily: font.semibold, fontSize: 14, color: color.ink },
  joinRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    minHeight: tap.min,
    borderRadius: radius.large,
    backgroundColor: color.surface,
    textAlign: 'center',
    fontFamily: font.medium,
    fontSize: 20,
    letterSpacing: 6,
    color: color.fg,
    ...shadow.card,
    shadowOpacity: 0.06
  },
  join: {
    minHeight: tap.min,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.large,
    ...shadow.card,
    shadowOpacity: 0.06
  },
  joinText: { fontFamily: font.semibold, fontSize: 14, color: color.fg },
  error: { fontFamily: font.medium, fontSize: 12, color: color.masteryLow },
  note: { fontFamily: font.regular, fontSize: 11.5, lineHeight: 17, color: color.faint },

  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.large,
    padding: 16,
    ...shadow.card,
    shadowOpacity: 0.06
  },
  codeBody: { flex: 1 },
  code: {
    fontFamily: font.medium,
    fontSize: 28,
    letterSpacing: 5,
    color: color.fg,
    marginTop: 4
  },
  live: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: color.masteryHigh },
  liveText: { fontFamily: font.semibold, fontSize: 11.5, color: color.masteryHigh },

  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.surface,
    borderRadius: radius.large,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...shadow.card,
    shadowOpacity: 0.06
  },
  deviceBody: { flex: 1, minWidth: 0 },
  deviceName: { fontFamily: font.semibold, fontSize: 14, color: color.fg },
  labelCaps: { fontFamily: font.semibold, fontSize: 10.5, letterSpacing: 1.3, color: color.label },
  waiting: {
    fontFamily: font.regular,
    fontSize: 12,
    lineHeight: 18,
    color: color.faint,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: color.line,
    borderRadius: radius.large,
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  close: {
    minHeight: tap.min,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.large,
    ...shadow.card,
    shadowOpacity: 0.06
  },
  closeText: { fontFamily: font.semibold, fontSize: 13, color: color.dim }
})
