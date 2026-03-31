import Ajv, { type ErrorObject } from 'ajv'
import { LineCounter, isMap, isPair, isScalar, isSeq, parseDocument } from 'yaml'
import { clangFormatSchema } from '@/lib/clangFormatSchema'

export interface ClangFormatValidationDiagnostic {
  from: number
  message: string
  severity: 'error'
  source: 'schema' | 'yaml'
  to: number
}

export interface ClangFormatValidationResult {
  config: Record<string, unknown> | null
  diagnostics: ClangFormatValidationDiagnostic[]
  valid: boolean
}

const ajv = new Ajv({
  allErrors: true,
  allowUnionTypes: true,
  strict: false,
  validateFormats: false,
})

const validateSchema = ajv.compile(clangFormatSchema)

type PathSegment = string | number

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function decodeJsonPointerSegment(segment: string) {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~')
}

function pointerToPath(pointer: string): PathSegment[] {
  if (!pointer) {
    return []
  }

  return pointer
    .slice(1)
    .split('/')
    .map(decodeJsonPointerSegment)
    .map(segment => /^\d+$/.test(segment) ? Number(segment) : segment)
}

function createRange(from: number, to: number) {
  const safeFrom = Math.max(0, from)
  const safeTo = Math.max(safeFrom + 1, to)

  return {
    from: safeFrom,
    to: safeTo,
  }
}

function rangeFromNode(node: unknown) {
  if (!node || typeof node !== 'object' || !('range' in node)) {
    return null
  }

  const range = (node as { range?: [number, number, number] | null }).range
  if (!range) {
    return null
  }

  return createRange(range[0], range[1])
}

function getNodeAtPath(document: ReturnType<typeof parseDocument>, path: PathSegment[]) {
  if (path.length === 0) {
    return document.contents ?? null
  }

  return document.getIn(path, true) ?? null
}

function getScalarValue(value: unknown) {
  return isScalar(value) ? value.value : value
}

function getPairForPath(document: ReturnType<typeof parseDocument>, path: PathSegment[]) {
  if (path.length === 0) {
    return null
  }

  const parentPath = path.slice(0, -1)
  const lastSegment = path[path.length - 1]
  const parent = parentPath.length === 0 ? document.contents : document.getIn(parentPath, true)

  if (typeof lastSegment === 'number') {
    if (isSeq(parent)) {
      return parent.items[lastSegment] ?? null
    }

    return null
  }

  if (!isMap(parent)) {
    return null
  }

  return parent.items.find(pair => isPair(pair) && getScalarValue(pair.key) === lastSegment) ?? null
}

function getPathRange(document: ReturnType<typeof parseDocument>, path: PathSegment[], preference: 'key' | 'value' = 'value') {
  const pairOrNode = getPairForPath(document, path)

  if (pairOrNode && isPair(pairOrNode)) {
    if (preference === 'key') {
      return rangeFromNode(pairOrNode.key) ?? rangeFromNode(pairOrNode.value)
    }

    return rangeFromNode(pairOrNode.value) ?? rangeFromNode(pairOrNode.key)
  }

  return rangeFromNode(getNodeAtPath(document, path))
}

function getRootRange(document: ReturnType<typeof parseDocument>, source: string) {
  return rangeFromNode(document.contents) ?? createRange(0, Math.max(1, source.length))
}

function describeJsonType(type: string) {
  switch (type) {
    case 'array':
      return 'an array'
    case 'boolean':
      return 'true or false'
    case 'integer':
      return 'an integer'
    case 'number':
      return 'a number'
    case 'object':
      return 'an object'
    case 'string':
      return 'a string'
    default:
      return type
  }
}

function formatPath(path: PathSegment[]) {
  return path.length > 0 ? path.join('.') : 'Document'
}

function formatAjvError(error: ErrorObject) {
  const path = pointerToPath(error.instancePath)
  const label = formatPath(path)

  switch (error.keyword) {
    case 'additionalProperties': {
      const additionalProperty = (error.params as { additionalProperty: string }).additionalProperty
      return `Unknown clang-format field "${additionalProperty}".`
    }
    case 'const': {
      const allowedValue = (error.params as { allowedValue: unknown }).allowedValue
      return `${label} must be ${JSON.stringify(allowedValue)}.`
    }
    case 'enum': {
      const allowedValues = (error.params as { allowedValues: unknown[] }).allowedValues
      const allowedText = allowedValues.map(value => JSON.stringify(value)).join(', ')
      return `${label} has an invalid value. Allowed values: ${allowedText}.`
    }
    case 'maximum': {
      const limit = (error.params as { limit: number }).limit
      return `${label} must be <= ${limit}.`
    }
    case 'minimum': {
      const limit = (error.params as { limit: number }).limit
      return `${label} must be >= ${limit}.`
    }
    case 'pattern':
      return `${label} does not match the required pattern.`
    case 'required': {
      const missingProperty = (error.params as { missingProperty: string }).missingProperty
      return `${label} is missing required field "${missingProperty}".`
    }
    case 'type': {
      const type = (error.params as { type: string }).type
      return `${label} must be ${describeJsonType(type)}.`
    }
    default:
      return `${label} ${error.message ?? 'is invalid'}.`
  }
}

function filterAjvErrors(errors: ErrorObject[]) {
  const filtered = errors.filter((error) => {
    if (error.keyword === 'oneOf' || error.keyword === 'anyOf' || error.keyword === 'allOf') {
      return false
    }

    if (error.keyword !== 'type') {
      return true
    }

    return !errors.some(other => other !== error
      && other.instancePath === error.instancePath
      && ['additionalProperties', 'const', 'enum', 'maximum', 'minimum', 'pattern', 'required'].includes(other.keyword))
  })

  const seen = new Set<string>()
  return filtered.filter((error) => {
    const key = `${error.keyword}|${error.instancePath}|${error.schemaPath}|${JSON.stringify(error.params)}`
    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

function getAjvErrorRange(document: ReturnType<typeof parseDocument>, error: ErrorObject, source: string) {
  const path = pointerToPath(error.instancePath)

  if (error.keyword === 'additionalProperties') {
    const additionalProperty = (error.params as { additionalProperty: string }).additionalProperty
    return getPathRange(document, [...path, additionalProperty], 'key') ?? getRootRange(document, source)
  }

  if (error.keyword === 'required') {
    return getPathRange(document, path, 'value') ?? getRootRange(document, source)
  }

  return getPathRange(document, path, 'value')
    ?? getPathRange(document, path, 'key')
    ?? getRootRange(document, source)
}

function normalizeParsedConfig(value: unknown) {
  if (value === null || value === undefined) {
    return {}
  }

  return value
}

export function buildClangFormatStyle(config: Record<string, unknown>) {
  return JSON.stringify(config)
}

export function validateClangFormatYaml(source: string): ClangFormatValidationResult {
  const lineCounter = new LineCounter()
  const document = parseDocument(source, {
    lineCounter,
    prettyErrors: false,
    strict: true,
  })

  const diagnostics: ClangFormatValidationDiagnostic[] = []

  for (const issue of [...document.errors, ...document.warnings]) {
    const range = createRange(issue.pos[0], issue.pos[1])
    diagnostics.push({
      ...range,
      message: issue.message,
      severity: 'error',
      source: 'yaml',
    })
  }

  if (diagnostics.length > 0) {
    return {
      config: null,
      diagnostics,
      valid: false,
    }
  }

  const parsedValue = normalizeParsedConfig(document.toJS({ mapAsMap: false }))
  const valid = validateSchema(parsedValue)

  if (!valid && validateSchema.errors) {
    for (const error of filterAjvErrors(validateSchema.errors)) {
      const range = getAjvErrorRange(document, error, source)
      diagnostics.push({
        ...range,
        message: formatAjvError(error),
        severity: 'error',
        source: 'schema',
      })
    }
  }

  return {
    config: isPlainObject(parsedValue) ? parsedValue : null,
    diagnostics,
    valid: diagnostics.length === 0,
  }
}