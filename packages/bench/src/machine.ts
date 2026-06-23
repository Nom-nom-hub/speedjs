import { execSync } from 'child_process'
import { cpus, totalmem, platform } from 'os'
import type { MachineInfo } from './types'

export function getMachineInfo(): MachineInfo {
  const cpu = cpus()[0]?.model || 'unknown'
  const cores = cpus().length
  const memGb = (totalmem() / (1024 * 1024 * 1024)).toFixed(1)

  return {
    platform: platform(),
    cpu: cpu.trim(),
    cores,
    memory: `${memGb}GB`,
    node: safeExec('node --version'),
    bun: safeExec('bun --version') || 'not installed',
    pnpm: safeExec('pnpm --version'),
  }
}

export function getGitInfo(): { commit: string; branch: string } {
  let commit = 'unknown'
  let branch = 'unknown'
  try {
    commit = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim()
    branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim()
  } catch {}
  return { commit, branch }
}

function safeExec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8' }).trim()
  } catch {
    return ''
  }
}
