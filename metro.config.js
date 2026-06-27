// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// expo-sqlite's web build imports the wa-sqlite `.wasm` binary as an asset.
// Metro doesn't treat `.wasm` as an asset by default, so register it here.
config.resolver.assetExts.push('wasm');

module.exports = config;
