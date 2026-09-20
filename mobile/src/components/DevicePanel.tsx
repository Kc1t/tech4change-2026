import { useEffect, useState } from 'react'
import { Modal, Pressable, Switch, Text, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import Svg, { Path, Rect } from 'react-native-svg'
import { useApp } from '../store'
import { color, shadow } from '../theme/tokens'
import {
  KIND_GLYPH,
  KIND_LABEL,
  buzzTargets,
  roleOf,
  undiscovered,
  type PairedDevice
} from '../domain/devices'

const SCAN_MS = 1400

const SOFT = { ...shadow.card, shadowOpacity: 0.06 }
const LABEL_CAPS = 'font-strong text-caps text-label'
const HINT = 'font-book text-[12.5px] leading-[18px]'
const DEVICE_ROW = 'flex-row items-center gap-3 rounded-large bg-surface p-3.5'
const DEVICE_ICON = 'size-11 items-center justify-center rounded-full'
const DEVICE_NAME = 'font-strong text-[15.5px] tracking-[-0.4px]'
const DEVICE_META = 'mt-1 flex-row flex-wrap items-center gap-2'

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
    <View className="flex-row items-center gap-1">
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
      <Text className="font-strong text-caps tracking-normal text-faint">{level}%</Text>
    </View>
  )
}

export function BuzzPicker() {
  const paired = useApp(s => s.paired)
  const toggleBuzz = useApp(s => s.toggleBuzz)

  const options = buzzTargets(paired)
  const chosen = options.filter(device => device.buzz)

  return (
    <View className="gap-2.5">
      <View className="flex-row flex-wrap gap-2">
        {options.map(device => (
          <Pressable
            key={device.id}
            accessibilityRole="switch"
            accessibilityState={{ checked: device.buzz }}
            onPress={() => {
              if (!device.buzz) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              toggleBuzz(device.id)
            }}
            className={`min-h-tap flex-row items-center gap-2 rounded-full px-4 ${
              device.buzz ? 'bg-fg' : 'bg-surface'
            }`}
            style={device.buzz ? undefined : SOFT}
          >
            <DeviceGlyph device={device} size={18} tint={device.buzz ? color.ink : color.dim} />
            <Text
              className={`font-strong text-[13.5px] ${device.buzz ? 'text-ink' : 'text-dim'}`}
            >
              {device.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {chosen.length === 0 ? (
        <Text className={`${HINT} text-mastery-low`}>
          Nenhum aparelho vibra agora. A dica vai chegar só por voz ou pela tela.
        </Text>
      ) : (
        <Text className={`${HINT} text-faint`}>
          A vibração marca o tempo em {chosen.map(device => device.name.toLowerCase()).join(' e ')}.
        </Text>
      )}
    </View>
  )
}

export function DeviceList() {
  const paired = useApp(s => s.paired)
  const live = useApp(s => s.devices)
  const selfId = useApp(s => s.deviceId)
  const toggleDevice = useApp(s => s.toggleDevice)
  const unpairDevice = useApp(s => s.unpairDevice)
  const [pairing, setPairing] = useState(false)

  const rows = paired.map(device => {
    const match = live.find(
      entry => entry.kind === device.kind && (device.kind !== 'phone' || entry.id === selfId)
    )
    return {
      ...device,
      battery: match ? match.battery : device.channel === null ? device.battery : null,
      live: match !== undefined
    }
  })

  return (
    <View className="gap-2.5">
      {rows.map(device => (
        <View key={device.id} className={DEVICE_ROW} style={SOFT}>
          <View
            className={`${DEVICE_ICON} ${device.on ? 'bg-brand-soft' : 'bg-surface-2'}`}
          >
            <DeviceGlyph device={device} size={22} tint={device.on ? color.fg : color.faint} />
          </View>

          <View className="min-w-0 flex-1">
            <Text
              className={`${DEVICE_NAME} ${device.on ? 'text-fg' : 'text-faint'}`}
              numberOfLines={1}
            >
              {device.name}
            </Text>

            <View className={DEVICE_META}>
              <Text className={LABEL_CAPS}>{KIND_LABEL[device.kind].toUpperCase()}</Text>
              {device.battery !== null && <Battery level={device.battery} />}
              {device.live && (
                <Text className="overflow-hidden rounded-full bg-brand-soft px-1.5 py-0.5 font-strong text-[8.5px] tracking-[1px] text-brand">
                  NA SESSÃO
                </Text>
              )}
            </View>

            <Text className="mt-1 font-book text-[12.5px] text-dim">{roleOf(device)}</Text>
          </View>

          {device.channel === null && (
            <Pressable
              onPress={() => unpairDevice(device.id)}
              accessibilityLabel={`Remover ${device.name}`}
              hitSlop={8}
              className="size-[30px] items-center justify-center"
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

      <Pressable
        onPress={() => setPairing(true)}
        className="min-h-tap flex-row items-center justify-center gap-2 rounded-large border border-dashed border-line"
      >
        <Svg viewBox="0 0 20 20" width={16} height={16}>
          <Path
            d="M10 4.5v11M4.5 10h11"
            fill="none"
            stroke={color.brand}
            strokeWidth={1.9}
            strokeLinecap="round"
          />
        </Svg>
        <Text className="font-strong text-[13.5px] text-brand">Adicionar aparelho</Text>
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
      <Pressable
        className="absolute inset-0"
        style={{ backgroundColor: '#1b1a2259' }}
        onPress={onClose}
      />

      <View className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-ink px-6 pb-7 pt-3">
        <View className="mb-4 h-1 w-10 self-center rounded-full bg-line" />

        <Text className={LABEL_CAPS}>PAREAR</Text>
        <Text className="mt-1.5 font-mid text-[22px] tracking-[-0.8px] text-fg">
          Aparelhos por perto
        </Text>
        <Text className="mt-1.5 font-book text-hint text-dim">
          Deixe o aparelho perto do celular e ligado. Nesta versão a busca é simulada.
        </Text>

        <View className="mt-4 gap-2.5">
          {scanning && (
            <View
              className="flex-row items-center gap-3 rounded-large bg-surface p-4"
              style={SOFT}
            >
              <View className="size-2.5 rounded-full bg-brand" />
              <Text className="font-strong text-[13.5px] text-dim">Procurando aparelhos…</Text>
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
                className={DEVICE_ROW}
                style={SOFT}
              >
                <View className={`${DEVICE_ICON} bg-surface-2`}>
                  <DeviceGlyph device={device} size={22} tint={color.dim} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className={`${DEVICE_NAME} text-fg`} numberOfLines={1}>
                    {device.name}
                  </Text>
                  <View className={DEVICE_META}>
                    <Text className={LABEL_CAPS}>{KIND_LABEL[device.kind].toUpperCase()}</Text>
                    {device.battery !== null && <Battery level={device.battery} />}
                  </View>
                </View>
                <Text className="font-strong text-hint text-brand">Parear</Text>
              </Pressable>
            ))}

          {!scanning && found.length === 0 && (
            <Text
              className={`${HINT} rounded-large border border-dashed border-line px-4 py-5 text-center text-faint`}
            >
              Nada novo por perto. Todos os aparelhos conhecidos já estão na lista.
            </Text>
          )}
        </View>

        <Pressable
          onPress={onClose}
          className="mt-3 min-h-tap items-center justify-center rounded-large bg-surface"
          style={SOFT}
        >
          <Text className="font-strong text-[13.5px] text-dim">Fechar</Text>
        </Pressable>
      </View>
    </Modal>
  )
}
