import { describe, expect, it } from 'vitest'
import { parseMarkup, plain } from '../src/slideMarkup'

describe('parseMarkup', () => {
  it('returns plain text when there are no markers', () => {
    expect(parseMarkup('hello world')).toEqual([{ kind: 'text', text: 'hello world' }])
  })

  it('parses code, emphasis, and bold as pieces', () => {
    expect(parseMarkup('The `agent` is *chase* and **bold**.')).toEqual([
      { kind: 'text', text: 'The ' },
      { kind: 'code', text: 'agent' },
      { kind: 'text', text: ' is ' },
      { kind: 'em', text: 'chase' },
      { kind: 'text', text: ' and ' },
      { kind: 'em', text: 'bold' },
      { kind: 'text', text: '.' },
    ])
  })

  it('strips markers via plain()', () => {
    expect(plain('The `agent` is *chase*.')).toBe('The agent is chase.')
  })

  it('handles empty input', () => {
    expect(parseMarkup('')).toEqual([])
    expect(plain('')).toBe('')
  })
})
