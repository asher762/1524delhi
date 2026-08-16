import React from 'react'

import { EnquiryProvider } from './Enquiry'
import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <EnquiryProvider>{children}</EnquiryProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
