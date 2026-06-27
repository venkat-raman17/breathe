/**
 * Ambient declarations for CSS imports used by the Expo template (web styling via
 * react-native-css / global.css). Metro resolves these at runtime; this keeps `tsc` happy.
 */
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css';
