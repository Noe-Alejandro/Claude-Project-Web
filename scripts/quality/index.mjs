#!/usr/bin/env node

import { runQualityChecks } from './orchestrator.mjs'
import { printHeader } from './utils/logger.mjs'

printHeader()

const result = await runQualityChecks()

process.exit(result.ok ? 0 : 1)
