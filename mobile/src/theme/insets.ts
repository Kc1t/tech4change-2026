import { Platform, StatusBar } from 'react-native'

export const TOP_INSET = Platform.OS === 'android' ? 30 : 26
export const BAR_INSET = Platform.OS === 'android' ? 30 : 22
export const ANDROID_STATUS = StatusBar.currentHeight ?? 0
