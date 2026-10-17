// Mock for expo-haptics in Jest
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
}));

// Mock for expo-file-system/legacy in Jest
jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: '/var/mobile/Documents/',
  cacheDirectory: '/var/mobile/Caches/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  readDirectoryAsync: jest.fn().mockResolvedValue([]),
}));

// Mock for expo-sharing in Jest
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock for expo-router in Jest
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => '/',
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: () => true,
  },
  Tabs: Object.assign(({ children }) => children, {
    Screen: ({ children }) => children || null,
  }),
  Stack: Object.assign(({ children }) => children, {
    Screen: ({ children }) => children || null,
  }),
}));

// Mock for react-native-svg in Jest
jest.mock('react-native-svg', () => {
  const React = require('react');
  const createMockComponent = (name) => {
    const Component = (props) => React.createElement(name, props, props.children);
    Component.displayName = name;
    return Component;
  };

  return {
    __esModule: true,
    default: createMockComponent('Svg'),
    Svg: createMockComponent('Svg'),
    Circle: createMockComponent('Circle'),
    Ellipse: createMockComponent('Ellipse'),
    G: createMockComponent('G'),
    Text: createMockComponent('Text'),
    TSpan: createMockComponent('TSpan'),
    TextPath: createMockComponent('TextPath'),
    Path: createMockComponent('Path'),
    Polygon: createMockComponent('Polygon'),
    Polyline: createMockComponent('Polyline'),
    Line: createMockComponent('Line'),
    Rect: createMockComponent('Rect'),
    Use: createMockComponent('Use'),
    Image: createMockComponent('Image'),
    Symbol: createMockComponent('Symbol'),
    Defs: createMockComponent('Defs'),
    LinearGradient: createMockComponent('LinearGradient'),
    RadialGradient: createMockComponent('RadialGradient'),
    Stop: createMockComponent('Stop'),
    ClipPath: createMockComponent('ClipPath'),
    Pattern: createMockComponent('Pattern'),
    Mask: createMockComponent('Mask'),
  };
});

// Mock for react-native-safe-area-context in Jest
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children({ top: 44, bottom: 34, left: 0, right: 0 }),
    SafeAreaView: ({ children, style, ...props }) =>
      React.createElement('SafeAreaView', { style, ...props }, children),
  };
});

// Mock for react-native in Jest
jest.mock('react-native', () => {
  const React = require('react');
  return {
    View: (props) => React.createElement('View', props, props?.children),
    Text: (props) => React.createElement('Text', props, props?.children),
    TextInput: (props) => React.createElement('TextInput', props, props?.children),
    TouchableOpacity: (props) => React.createElement('TouchableOpacity', props, props?.children),
    ScrollView: (props) => React.createElement('ScrollView', props, props?.children),
    Modal: (props) => React.createElement('Modal', props, props?.children),
    KeyboardAvoidingView: (props) => React.createElement('KeyboardAvoidingView', props, props?.children),
    ActivityIndicator: (props) => React.createElement('ActivityIndicator', props),
    Platform: { OS: 'ios', select: (obj) => obj.ios || obj.default },
    Alert: {
      alert: jest.fn(),
    },
    AppState: {
      currentState: 'active',
      addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
    },
    StyleSheet: {
      create: (styles) => styles,
      flatten: (styles) => styles,
    },
    Dimensions: {
      get: () => ({ width: 390, height: 844 }),
      addEventListener: () => ({ remove: () => {} }),
    },
    PixelRatio: {
      get: () => 3,
      getFontScale: () => 1,
    },
  };
});
