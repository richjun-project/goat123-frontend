import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css');
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  :root {
    /* Modern Color Palette */
    --color-primary: #8B5CF6;
    --color-primary-light: #A78BFA;
    --color-primary-dark: #7C3AED;
    
    --color-secondary: #EC4899;
    --color-secondary-light: #F472B6;
    --color-secondary-dark: #DB2777;
    
    --color-accent: #06B6D4;
    --color-accent-light: #22D3EE;
    --color-accent-dark: #0891B2;
    
    /* Gradients */
    --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --gradient-aurora: linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #06B6D4 100%);
    --gradient-sunset: linear-gradient(135deg, #FA709A 0%, #FEE140 100%);
    --gradient-ocean: linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%);
    
    /* Glass Effect Colors */
    --glass-background: rgba(255, 255, 255, 0.1);
    --glass-border: rgba(255, 255, 255, 0.2);
    --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
    
    /* Dark Mode Colors */
    --dark-background: #0F0F0F;
    --dark-surface: #1A1A1A;
    --dark-surface-light: #242424;
    --dark-border: #2A2A2A;
    
    /* Typography Scale */
    --font-primary: 'Pretendard Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-display: 'Inter', sans-serif;
    
    /* Fluid Typography */
    --step--2: clamp(0.7813rem, 0.7747rem + 0.0326vw, 0.8rem);
    --step--1: clamp(0.9375rem, 0.9158rem + 0.1087vw, 1rem);
    --step-0: clamp(1.125rem, 1.0815rem + 0.2174vw, 1.25rem);
    --step-1: clamp(1.35rem, 1.2761rem + 0.3696vw, 1.5625rem);
    --step-2: clamp(1.62rem, 1.5041rem + 0.5793vw, 1.9531rem);
    --step-3: clamp(1.944rem, 1.771rem + 0.8651vw, 2.4414rem);
    --step-4: clamp(2.3328rem, 2.0827rem + 1.2504vw, 3.0518rem);
    --step-5: clamp(2.7994rem, 2.4462rem + 1.7658vw, 3.8147rem);
    
    /* Spacing Scale */
    --space-3xs: clamp(0.25rem, 0.25rem + 0vw, 0.25rem);
    --space-2xs: clamp(0.5625rem, 0.5408rem + 0.1087vw, 0.625rem);
    --space-xs: clamp(0.8125rem, 0.7908rem + 0.1087vw, 0.875rem);
    --space-s: clamp(1.125rem, 1.0815rem + 0.2174vw, 1.25rem);
    --space-m: clamp(1.6875rem, 1.6223rem + 0.3261vw, 1.875rem);
    --space-l: clamp(2.25rem, 2.163rem + 0.4348vw, 2.5rem);
    --space-xl: clamp(3.375rem, 3.2446rem + 0.6522vw, 3.75rem);
    --space-2xl: clamp(4.5rem, 4.3261rem + 0.8696vw, 5rem);
    --space-3xl: clamp(6.75rem, 6.4891rem + 1.3043vw, 7.5rem);
    
    /* Animation Timing */
    --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
    --ease-in-out-expo: cubic-bezier(0.87, 0, 0.13, 1);
    --spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
    --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
    --shadow-glow: 0 0 50px rgba(139, 92, 246, 0.3);
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: var(--font-primary);
    font-size: var(--step-0);
    line-height: 1.6;
    color: #1a1a1a;
    background: #fafafa;
    font-feature-settings: 'liga' 1, 'kern' 1;
    
    &.dark {
      color: #f0f0f0;
      background: var(--dark-background);
    }
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  h1 { font-size: var(--step-5); }
  h2 { font-size: var(--step-4); }
  h3 { font-size: var(--step-3); }
  h4 { font-size: var(--step-2); }
  h5 { font-size: var(--step-1); }
  h6 { font-size: var(--step-0); }

  /* Selection Style */
  ::selection {
    background: var(--color-primary-light);
    color: white;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, var(--color-primary), var(--color-secondary));
    border-radius: 100px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, var(--color-primary-dark), var(--color-secondary-dark));
    background-clip: padding-box;
  }

  /* Focus Styles */
  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* Animations */
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes glow {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  @keyframes pulse-ring {
    0% {
      transform: scale(0.33);
    }
    40%, 50% {
      opacity: 0;
    }
    100% {
      opacity: 0;
    }
  }

  /* Utility Classes */
  .glass {
    background: var(--glass-background);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    box-shadow: var(--glass-shadow);
  }

  .gradient-text {
    background: var(--gradient-aurora);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .shimmer {
    animation: shimmer 2s infinite;
    background: linear-gradient(90deg, #f0f0f0 0%, #fff 50%, #f0f0f0 100%);
    background-size: 1000px 100%;
  }

  .no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
`