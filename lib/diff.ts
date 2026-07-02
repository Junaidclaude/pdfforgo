// Word-level diff via the standard LCS (longest common subsequence) dynamic
// program. Intended for per-page text (a few hundred to low-thousands of
// tokens), where an O(n*m) table is fast; callers should diff page-by-page
// rather than whole-document to keep both dimensions small.

export type DiffOp = { type: 'equal' | 'insert' | 'delete'; text: string }

function tokenize(s: string): string[] {
  return s.match(/\s+|\S+/g) ?? []
}

export function diffWords(a: string, b: string): DiffOp[] {
  const ta = tokenize(a)
  const tb = tokenize(b)
  const n = ta.length
  const m = tb.length

  // dp[i][j] = length of LCS of ta[i:] and tb[j:]
  const dp: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = ta[i] === tb[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const ops: DiffOp[] = []
  const push = (type: DiffOp['type'], text: string) => {
    const last = ops[ops.length - 1]
    if (last && last.type === type) last.text += text
    else ops.push({ type, text })
  }

  let i = 0, j = 0
  while (i < n && j < m) {
    if (ta[i] === tb[j]) {
      push('equal', ta[i]); i++; j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push('delete', ta[i]); i++
    } else {
      push('insert', tb[j]); j++
    }
  }
  while (i < n) { push('delete', ta[i]); i++ }
  while (j < m) { push('insert', tb[j]); j++ }

  return ops
}

export function diffStats(ops: DiffOp[]): { additions: number; deletions: number } {
  const countWords = (s: string) => (s.match(/\S+/g) ?? []).length
  let additions = 0, deletions = 0
  for (const op of ops) {
    if (op.type === 'insert') additions += countWords(op.text)
    if (op.type === 'delete') deletions += countWords(op.text)
  }
  return { additions, deletions }
}
