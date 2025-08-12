import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../../src/App'

describe('App コンポーネント', () => {
  it('初期状態でカウントが0であることを確認', () => {
    render(<App />)
    expect(screen.getByText('count is 0')).toBeDefined()
  })

  it('ボタンクリックでカウントが増加することを確認', () => {
    render(<App />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(screen.getByText('count is 1')).toBeDefined()
  })

  it('タイトルが正しく表示されることを確認', () => {
    render(<App />)
    expect(screen.getByText('Vite + React')).toBeDefined()
  })

  it('ロゴが表示されることを確認', () => {
    render(<App />)
    const viteLogoLink = screen.getByRole('link', { name: /vite logo/i })
    const reactLogoLink = screen.getByRole('link', { name: /react logo/i })
    
    expect(viteLogoLink).toBeDefined()
    expect(reactLogoLink).toBeDefined()
  })
})