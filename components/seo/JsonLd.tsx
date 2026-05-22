interface JsonLdProps {
  data: object | object[]
}

// Renders a schema.org JSON-LD payload. The content is the output of
// JSON.stringify on a server-built object, so it is guaranteed to be valid
// JSON with no executable HTML — safe inside <script type="application/ld+json">.
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
