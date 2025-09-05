import type { ThemeConfig } from 'antd';

// Updated brand colors - Onelab rebrand
const colors = {
  primary: '#078586', // Dark cyan - main brand color
  primaryLight: '#0a9fa0', // Lighter cyan for hover states
  primaryDark: '#065859', // Darker cyan for active states
  foreground: '#282F3B', // Dark, desaturated blue - main text
  background: '#ffffff', // White background
  surface: '#f8fafc', // Light surface
  surfaceHover: '#f1f5f9', // Hover surface
  border: '#e2e8f0', // Border color
  muted: '#64748b', // Muted text
  success: '#059669', // Success green
  warning: '#f59e0b', // Warning orange
  error: '#dc2626', // Error red
};

export const antdTheme: ThemeConfig = {
  token: {
    // Primary colors - using your teal brand color
    colorPrimary: colors.primary,
    colorPrimaryHover: colors.primaryLight,
    colorPrimaryActive: colors.primaryDark,
    
    // Background colors
    colorBgContainer: colors.background,
    colorBgElevated: colors.background,
    colorBgLayout: colors.surface,
    colorBgMask: 'rgba(0, 0, 0, 0.45)',
    
    // Text colors
    colorText: colors.foreground,
    colorTextSecondary: colors.muted,
    colorTextTertiary: colors.muted,
    colorTextQuaternary: colors.muted,
    
    // Border colors
    colorBorder: colors.border,
    colorBorderSecondary: colors.border,
    
    // Status colors
    colorSuccess: colors.success,
    colorWarning: colors.warning,
    colorError: colors.error,
    
    // Layout
    borderRadius: 8,
    wireframe: false,
    
    // Typography
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Spacing
    padding: 16,
    margin: 16,
    
    // Shadows - matching your design system
    boxShadow: '0 4px 6px -1px rgba(30, 41, 59, 0.1), 0 2px 4px -1px rgba(30, 41, 59, 0.06)',
    boxShadowSecondary: '0 1px 2px 0 rgba(30, 41, 59, 0.05)',
    boxShadowTertiary: '0 10px 15px -3px rgba(30, 41, 59, 0.1), 0 4px 6px -2px rgba(30, 41, 59, 0.05)',
  },
  components: {
    Layout: {
      headerBg: colors.background,
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: colors.background,
      triggerBg: colors.surface,
      triggerColor: colors.foreground,
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: colors.primary,
      itemSelectedColor: colors.background,
      itemHoverBg: colors.surfaceHover,
      itemColor: colors.muted,
      itemActiveBg: colors.primary,
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
      paddingContentHorizontal: 16,
    },
    Card: {
      borderRadius: 8,
      paddingLG: 24,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      paddingContentHorizontal: 12,
    },
    Table: {
      borderRadius: 8,
      headerBg: colors.surface,
    },
    Dropdown: {
      borderRadius: 8,
    },
    Avatar: {
      borderRadius: 8,
    },
  },
};