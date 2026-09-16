import { useEffect, useState } from 'react'
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import Svg, { Path, Rect } from 'react-native-svg'
import { useApp } from '../store'
import { color, font, radius, shadow, tap } from '../theme/tokens'
import {
  KIND_GLYPH,
  KIND_LABEL,
  buzzTargets,
  roleOf,
  undiscovered,
  type PairedDevice
} from '../domain/devices'

const SCAN_MS = 1400

function DeviceGlyph({ device, size, tint }: { device: PairedDevice; size: number; tint: string }) {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size}>
      <Path
        d={KIND_GLYPH[device.kind]}
        fill="none"
        stroke={tint}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

function Battery({ level }: { level: number }) {
  return (
    <View style={styles.battery}>
      <Svg viewBox="0 0 24 12" width={20} height={10}>
        <Rect
          x={0.8}
          y={0.8}
          width={19}
          height={10.4}
          rx={3}
          fill="none"
          stroke={color.faint}
          strokeWidth={1.4}
        />
        <Rect
          x={2.6}
          y={2.6}
          width={Math.max(2, 15.4 * (level / 100))}
          height={6.8}
          rx={1.6}
          fill={color.faint}
        />
        <Path d="M21.6 4.2v3.6" stroke={color.faint} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
      <Text style={styles.batteryText}>{level}%</Text>
    </View>
  )
}

export function BuzzPicker() {
  const paired = useApp(s => s.paired)
  const toggleBuzz = useApp(s => s.toggleBuzz)

  const options = buzzTargets(paired)
  const chosen = options.filter(device => device.buzz)

  return (
    <View style={styles.block}>
      <View style={styles.chips}>
        {options.map(device => (
          <Pressable
            key={device.id}
            accessibilityRole="switch"
            accessibilityState={{ checked: device.buzz }}
            onPress={() => {
              if (!device.buzz) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              toggleBuzz(device.id)
            }}
            style={[styles.chip, device.buzz ? styles.chipOn : styles.chipOff]}
          >
            <DeviceGlyph device={device} size={18} tint={device.buzz ? color.ink : color.dim} />
            <Text style={[styles.chipText, device.buzz && styles.chipTextOn]}>{device.name}</Text>
          </Pressable>
        ))}
      </View>

      {chosen.length === 0 ? (
        <Text style={[styles.hint, { color: color.masteryLow }]}>
          Nenhum aparelho vibra agora. A dica vai chegar só por voz ou pela tela.
        </Text>
      ) : (
        <Text style={styles.hint}>
          A vibração marca o tempo em {chosen.map(device => device.name.toLowerCase()).join(' e ')}.
        </Text>
      )}
    </View>
  )
}

export function DeviceList() {
  const paired = useApp(s => s.paired)
  const toggleDevice = useApp(s => s.toggleDevice)
  const unpairDevice = useApp(s => s.unpairDevice)
  const [pairing, setPairing] = useState(false)

  return (
    <View style={styles.block}>
      {paired.map(device => (
        <View key={device.id} style={styles.device}>
          <View
            style={[
              styles.deviceIcon,
              { backgroundColor: device.on ? color.brandSoft : color.surface2 }
            ]}
          >
            <DeviceGlyph device={device} size={22} tint={device.on ? color.fg : color.faint} />
          </View>

          <View style={styles.deviceBody}>
            <Text
              style={[styles.deviceName, !device.on && { color: color.faint }]}
              numberOfLines={1}
            >
              {device.name}
            </Text>

            <View style={styles.deviceMeta}>
              <Text style={styles.labelCaps}>{KIND_LABEL[device.kind].toUpperCase()}</Text>
              {device.battery !== null && <Battery level={device.battery} />}
              {device.channel === null && <Text style={styles.tag}>SIMULADO</Text>}
            </View>

            <Text style={styles.deviceRole}>{roleOf(device)}</Text>
          </View>

          {device.channel === null && (
            <Pressable
              onPress={() => unpairDevice(device.id)}
              accessibilityLabel={`Remover ${device.name}`}
              hitSlop={8}
              style={styles.remove}
            >
              <Svg viewBox="0 0 20 20" width={15} height={15}>
                <Path
                  d="m5.5 5.5 9 9M14.5 5.5l-9 9"
                  fill="none"
                  stroke={color.faint}
                  strokeWidth={1.8}
                  strokeLinecap="round"
                />
              </Svg>
            </Pressable>
          )}

          <Switch
            value={device.on}
            disabled={device.id === 'phone'}
            onValueChange={() => toggleDevice(device.id)}
            trackColor={{ false: color.surface2, true: color.brand }}
            thumbColor={color.surface}
          />
        </View>
      ))}

      <Pressable onPress={() => setPairing(true)} style={styles.add}>
        <Svg viewBox="0 0 20 20" width={16} height={16}>
          <Path
            d="M10 4.5v11M4.5 10h11"
            fill="none"
            stroke={color.brand}
            strokeWidth={1.9}
            strokeLinecap="round"
          />
        </Svg>
        <Text style={styles.addText}>Adicionar aparelho</Text>
      </Pressable>

      {pairing && <PairSheet onClose={() => setPairing(false)} />}
    </View>
  )
}

function PairSheet({ onClose }: { onClose: () => void }) {
  const paired = useApp(s => s.paired)
  const pairDevice = useApp(s => s.pairDevice)
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setScanning(false), SCAN_MS)
    return () => clearTimeout(timer)
  }, [])

  const found = undiscovered(paired)

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.grabber} />

        <Text style={styles.labelCaps}>PAREAR</Text>
        <Text style={styles.sheetTitle}>Aparelhos por perto</Text>
        <Text style={styles.sheetSub}>
          Deixe o aparelho perto do celular e ligado. Nesta versão a busca é simulada.
        </Text>

        <View style={styles.sheetList}>
          {scanning && (
            <View style={styles.scanning}>
              <View style={styles.scanDot} />
              <Text style={styles.scanText}>Procurando aparelhos…</Text>
            </View>
          )}

          {!scanning &&
            found.map(device => (
              <Pressable
                key={device.id}
                onPress={() => {
                  void Haptics.selectionAsync()
                  pairDevice(device.id)
                  onClose()
                }}
                style={styles.device}
              >
                <View style={[styles.deviceIcon, { backgroundColor: color.surface2 }]}>
                  <DeviceGlyph device={device} size={22} tint={color.dim} />
                </View>
                <View style={styles.deviceBody}>
                  <Text style={styles.deviceName} numberOfLines={1}>
                    {device.name}
                  </Text>
                  <View style={styles.deviceMeta}>
                    <Text style={styles.labelCaps}>{KIND_LABEL[device.kind].toUpperCase()}</Text>
                    {device.battery !== null && <Battery level={device.battery} />}
                  </View>
                </View>
                <Text style={styles.pair}>Parear</Text>
              </Pressable>
            ))}

          {!scanning && found.length === 0 && (
            <Text style={styles.empty}>
              Nada novo por perto. Todos os aparelhos conhecidos já estão na lista.
            </Text>
          )}
        </View>

        <Pressable onPress={onClose} style={styles.close}>
          <Text style={styles.closeText}>Fechar</Text>
        </Pressable>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  block: { gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: tap.min,
    paddingHorizontal: 16,
    borderRadius: radius.pill
  },
  chipOn: { backgroundColor: color.fg },
  chipOff: { backgroundColor: color.surface, ...shadow.card, shadowOpacity: 0.06 },
  chipText: { fontFamily: font.semibold, fontSize: 13.5, color: color.dim },
  chipTextOn: { color: color.ink },
  hint: { fontFamily: font.regular, fontSize: 12.5, lineHeight: 18, color: color.faint },

  device: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.surface,
    borderRadius: radius.large,
    padding: 14,
    minHeight: 0,
    ...shadow.card,
    shadowOpacity: 0.06
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  deviceBody: { flex: 1, minWidth: 0 },
  deviceName: { fontFamily: font.semibold, fontSize: 15.5, letterSpacing: -0.4, color: color.fg },
  deviceMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginTop: 4
  },
  deviceRole: { fontFamily: font.regular, fontSize: 12.5, color: color.dim, marginTop: 4 },
  tag: {
    fontFamily: font.semibold,
    fontSize: 8.5,
    letterSpacing: 1,
    color: color.faint,
    backgroundColor: color.surface2,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
    overflow: 'hidden'
  },
  labelCaps: { fontFamily: font.semibold, fontSize: 10.5, letterSpacing: 1.3, color: color.label },
  battery: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  batteryText: { fontFamily: font.semibold, fontSize: 10.5, color: color.faint },
  remove: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },

  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: tap.min,
    borderRadius: radius.large,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: color.line
  },
  addText: { fontFamily: font.semibold, fontSize: 13.5, color: color.brand },

  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#16161659' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: color.ink,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: color.line,
    marginBottom: 16
  },
  sheetTitle: {
    fontFamily: font.medium,
    fontSize: 22,
    letterSpacing: -0.8,
    color: color.fg,
    marginTop: 6
  },
  sheetSub: {
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 19,
    color: color.dim,
    marginTop: 6
  },
  sheetList: { gap: 10, marginTop: 16 },
  scanning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.surface,
    borderRadius: radius.large,
    padding: 16,
    ...shadow.card,
    shadowOpacity: 0.06
  },
  scanDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: color.brand },
  scanText: { fontFamily: font.semibold, fontSize: 13.5, color: color.dim },
  pair: { fontFamily: font.semibold, fontSize: 13, color: color.brand },
  empty: {
    fontFamily: font.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: color.faint,
    textAlign: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: color.line,
    borderRadius: radius.large,
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  close: {
    minHeight: tap.min,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.large,
    marginTop: 12,
    ...shadow.card,
    shadowOpacity: 0.06
  },
  closeText: { fontFamily: font.semibold, fontSize: 13.5, color: color.dim }
})
