function extractRouteExampleSource(source: string) {
  let output = source.replace(/\r\n/g, "\n");

  output = output
    .split("\n")
    .filter((line) => {
      if (line.includes('from "@tanstack/react-router"')) return false;
      if (line.includes('from "../../components/ExamplePage"')) return false;
      if (line.includes('from "../../lib/exampleSource"')) return false;
      if (line.includes('?raw"')) return false;
      if (line.includes("const code = extractRouteExampleSource(rawSource);"))
        return false;
      return true;
    })
    .join("\n");

  output = output.replace(
    /export const Route = createFileRoute\([^]*?\);\n\n/,
    "",
  );

  output = output.replace(/\nfunction \w+Page\(\) \{[^]*$/, "\n");

  return output.trim();
}

export { extractRouteExampleSource };
