import rawSchema from '@/data/clangFormatSchema.json'

export interface JsonSchemaNode {
  $comment?: string
  $id?: string
  $ref?: string
  $schema?: string
  additionalProperties?: boolean | JsonSchemaNode
  allOf?: JsonSchemaNode[]
  anyOf?: JsonSchemaNode[]
  contains?: JsonSchemaNode
  default?: unknown
  description?: string
  enum?: unknown[]
  items?: JsonSchemaNode
  maximum?: number
  minimum?: number
  oneOf?: JsonSchemaNode[]
  pattern?: string
  patternProperties?: Record<string, JsonSchemaNode>
  properties?: Record<string, JsonSchemaNode>
  required?: string[]
  title?: string
  type?: string | string[]
}

export interface CompletionField {
  key: string
  description?: string
  values: string[]
  acceptsBoolean: boolean
  acceptsInteger: boolean
  acceptsNumber: boolean
  acceptsObject: boolean
}

function isSchemaObject(value: unknown): value is JsonSchemaNode {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isEmptySchemaObject(value: unknown): value is JsonSchemaNode {
  return isSchemaObject(value) && Object.keys(value).length === 0
}

function normalizeSchemaNode(node: JsonSchemaNode): JsonSchemaNode {
  const normalized: JsonSchemaNode = { ...node }

  if (node.properties) {
    normalized.properties = Object.fromEntries(
      Object.entries(node.properties).map(([key, value]) => [key, normalizeSchemaNode(value)]),
    )
  }

  if (node.patternProperties) {
    normalized.patternProperties = Object.fromEntries(
      Object.entries(node.patternProperties).map(([key, value]) => [key, normalizeSchemaNode(value)]),
    )
  }

  if (node.items) {
    normalized.items = normalizeSchemaNode(node.items)
  }

  if (node.oneOf) {
    normalized.oneOf = node.oneOf.map(normalizeSchemaNode)
  }

  if (node.anyOf) {
    normalized.anyOf = node.anyOf.map(normalizeSchemaNode)
  }

  if (node.allOf) {
    normalized.allOf = node.allOf.map(normalizeSchemaNode)
  }

  if (isSchemaObject(node.additionalProperties)) {
    normalized.additionalProperties = normalizeSchemaNode(node.additionalProperties)
  }

  const isObjectLike = normalized.type === 'object'
    || (Array.isArray(normalized.type) && normalized.type.includes('object'))
    || Boolean(normalized.properties)
    || Boolean(normalized.patternProperties)

  if (isObjectLike && (normalized.additionalProperties === undefined || isEmptySchemaObject(normalized.additionalProperties))) {
    normalized.additionalProperties = false
  }

  return normalized
}

function withLegacyAlternatives(schema: JsonSchemaNode | undefined, legacy: JsonSchemaNode) {
  if (!schema) {
    return legacy
  }

  return {
    description: schema.description,
    oneOf: [schema, legacy],
  } satisfies JsonSchemaNode
}

const rawRootSchema = rawSchema as JsonSchemaNode
const rawRootProperties = rawRootSchema.properties ?? {}

export const clangFormatSchema = normalizeSchemaNode({
  ...rawRootSchema,
  properties: {
    ...rawRootProperties,
    BinPackParameters: withLegacyAlternatives(rawRootProperties.BinPackParameters, {
      description: 'Legacy boolean form accepted by older clang-format versions.',
      type: 'boolean',
    }),
    Cpp11BracedListStyle: withLegacyAlternatives(rawRootProperties.Cpp11BracedListStyle, {
      description: 'Legacy enum form accepted by older clang-format versions.',
      type: 'string',
      enum: ['Block', 'FunctionCall', 'AlignFirstComment'],
    }),
    ReflowComments: withLegacyAlternatives(rawRootProperties.ReflowComments, {
      description: 'Legacy boolean form accepted by older clang-format versions.',
      type: 'boolean',
    }),
    SortIncludes: withLegacyAlternatives(rawRootProperties.SortIncludes, {
      description: 'Legacy string form accepted by clang-format before 21.x.',
      type: 'string',
      enum: ['CaseSensitive', 'CaseInsensitive', 'Never'],
    }),
    SortUsingDeclarations: withLegacyAlternatives(rawRootProperties.SortUsingDeclarations, {
      description: 'Legacy boolean form accepted by older clang-format versions.',
      type: 'boolean',
    }),
  },
})

function decodeJsonPointerSegment(segment: string) {
  return segment.replace(/~1/g, '/').replace(/~0/g, '~')
}

function mergeSchemas(base: JsonSchemaNode, extension: JsonSchemaNode) {
  const merged: JsonSchemaNode = { ...base, ...extension }

  if (base.properties || extension.properties) {
    merged.properties = {
      ...(base.properties ?? {}),
      ...(extension.properties ?? {}),
    }
  }

  if (base.patternProperties || extension.patternProperties) {
    merged.patternProperties = {
      ...(base.patternProperties ?? {}),
      ...(extension.patternProperties ?? {}),
    }
  }

  if (extension.additionalProperties === undefined) {
    merged.additionalProperties = base.additionalProperties
  }

  return merged
}

function resolveJsonPointer(ref: string) {
  if (!ref.startsWith('#/')) {
    return null
  }

  const segments = ref.slice(2).split('/').map(decodeJsonPointerSegment)
  let current: unknown = clangFormatSchema

  for (const segment of segments) {
    if (!isSchemaObject(current)) {
      return null
    }

    current = (current as Record<string, unknown>)[segment]
  }

  return isSchemaObject(current) ? current : null
}

function resolveSchemaNode(schema: JsonSchemaNode | null | undefined): JsonSchemaNode | null {
  if (!schema) {
    return null
  }

  let current: JsonSchemaNode | null = schema
  const seenRefs = new Set<string>()

  while (current?.$ref) {
    if (seenRefs.has(current.$ref)) {
      break
    }

    seenRefs.add(current.$ref)
    current = resolveJsonPointer(current.$ref)
  }

  if (current?.allOf?.length) {
    return current.allOf.reduce(
      (merged, part) => mergeSchemas(merged, resolveSchemaNode(part) ?? part),
      { ...current, allOf: undefined },
    )
  }

  return current
}

function getSchemaAlternatives(schema: JsonSchemaNode | null | undefined): JsonSchemaNode[] {
  const resolved = resolveSchemaNode(schema)
  if (!resolved) {
    return []
  }

  if (resolved.oneOf?.length) {
    return resolved.oneOf.flatMap(getSchemaAlternatives)
  }

  if (resolved.anyOf?.length) {
    return resolved.anyOf.flatMap(getSchemaAlternatives)
  }

  return [resolved]
}

function schemaHasType(schema: JsonSchemaNode, targetType: string) {
  if (Array.isArray(schema.type)) {
    return schema.type.includes(targetType)
  }

  return schema.type === targetType
}

function getObjectProperties(schema: JsonSchemaNode | null | undefined) {
  const properties: Record<string, JsonSchemaNode> = {}

  for (const candidate of getSchemaAlternatives(schema)) {
    const isObjectLike = schemaHasType(candidate, 'object') || Boolean(candidate.properties)
    if (!isObjectLike || !candidate.properties) {
      continue
    }

    for (const [key, value] of Object.entries(candidate.properties)) {
      properties[key] = value
    }
  }

  return properties
}

function collectEnumValues(schema: JsonSchemaNode | null | undefined) {
  const values = new Set<string>()

  for (const candidate of getSchemaAlternatives(schema)) {
    if (!candidate.enum) {
      continue
    }

    for (const value of candidate.enum) {
      if (typeof value === 'string') {
        values.add(value)
      }
    }
  }

  return Array.from(values)
}

function acceptsType(schema: JsonSchemaNode | null | undefined, targetType: string) {
  return getSchemaAlternatives(schema).some(candidate => schemaHasType(candidate, targetType))
}

export function getSchemaNodeForPath(path: readonly (string | number)[]) {
  let current: JsonSchemaNode | null = clangFormatSchema

  for (const segment of path) {
    if (typeof segment === 'number') {
      const collectionSchema: JsonSchemaNode | undefined = getSchemaAlternatives(current)
        .find(candidate => schemaHasType(candidate, 'array') && candidate.items)
      current = collectionSchema?.items ? resolveSchemaNode(collectionSchema.items) : null
      continue
    }

    let next: JsonSchemaNode | null = null
    for (const candidate of getSchemaAlternatives(current)) {
      if (candidate.properties?.[segment]) {
        next = candidate.properties[segment]
        break
      }

      if (candidate.patternProperties) {
        const patternEntry = Object.entries(candidate.patternProperties).find(([pattern]) => {
          try {
            return new RegExp(pattern).test(segment)
          } catch {
            return false
          }
        })

        if (patternEntry) {
          next = patternEntry[1]
          break
        }
      }

      if (isSchemaObject(candidate.additionalProperties)) {
        next = candidate.additionalProperties
        break
      }
    }

    current = resolveSchemaNode(next)
    if (!current) {
      return null
    }
  }

  return resolveSchemaNode(current)
}

export function getSchemaValueMeta(path: readonly string[]) {
  const schema = getSchemaNodeForPath(path)

  return {
    acceptsBoolean: acceptsType(schema, 'boolean'),
    acceptsInteger: acceptsType(schema, 'integer'),
    acceptsNumber: acceptsType(schema, 'number'),
    acceptsObject: getSchemaAlternatives(schema).some(candidate => schemaHasType(candidate, 'object') || Boolean(candidate.properties)),
    description: schema?.description,
    values: collectEnumValues(schema),
  }
}

export function getCompletionFieldsForPath(path: readonly string[] = []): CompletionField[] {
  const targetSchema = path.length > 0 ? getSchemaNodeForPath(path) : clangFormatSchema
  const properties = getObjectProperties(targetSchema)

  return Object.entries(properties)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, schema]) => {
      const meta = getSchemaValueMeta([...path, key])

      return {
        key,
        description: schema.description,
        values: meta.values,
        acceptsBoolean: meta.acceptsBoolean,
        acceptsInteger: meta.acceptsInteger,
        acceptsNumber: meta.acceptsNumber,
        acceptsObject: meta.acceptsObject,
      }
    })
}

export const clangFormatFields = getCompletionFieldsForPath()