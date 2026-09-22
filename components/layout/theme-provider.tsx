'use client';
import { ThemeProvider as NextThemes } from 'next-themes';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <NextThemes attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>{children}</NextThemes>
);
