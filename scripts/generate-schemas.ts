import { parse } from "yaml";
import { readFile, writeFile, mkdir } from "fs/promises";

async function main() {
  // OpenAPI定義を読み込む
  const openApiContent = await readFile("./openapi.yml", "utf8");
  const openApiDoc = parse(openApiContent);

  // スキーマを格納するディレクトリを作成
  await mkdir("./packages/shared/src/schemas", { recursive: true });

  // コンポーネントスキーマのZodを生成
  const schemas = openApiDoc.components.schemas;
  let zodSchemaContent = `import { z } from 'zod';\n\n`;

  // 各スキーマに対してzodスキーマを生成
  for (const [schemaName, schemaObj] of Object.entries(schemas)) {
    zodSchemaContent += `export const ${schemaName}Schema = ${generateZodSchema(
      schemaObj,
      schemaName
    )};\n\n`;
    zodSchemaContent += `export type ${schemaName} = z.infer<typeof ${schemaName}Schema>;\n\n`;
  }

  // zod-openapi用のエクスポートを追加
  zodSchemaContent += `export const schemas = {\n`;
  for (const schemaName of Object.keys(schemas)) {
    zodSchemaContent += `  ${schemaName}: ${schemaName}Schema,\n`;
  }
  zodSchemaContent += `};\n`;

  // ファイルに書き込む
  await writeFile("./packages/shared/src/schemas/index.ts", zodSchemaContent);

  // リクエスト/レスポンススキーマを生成
  await generateApiSchemas(openApiDoc);

  console.log("スキーマ生成完了");
}

// Zodスキーマ生成のヘルパー関数
function generateZodSchema(schema, schemaName) {
  if (schema.type === "object") {
    let objectSchema = `z.object({\n`;

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const isRequired =
          schema.required && schema.required.includes(propName);
        let propZodSchema = propertyToZod(propSchema, propName);

        if (!isRequired) {
          propZodSchema = `${propZodSchema}.optional()`;
        }

        objectSchema += `  ${propName}: ${propZodSchema},\n`;
      }
    }

    objectSchema += `})`;

    // allOf処理
    if (schema.allOf) {
      for (const item of schema.allOf) {
        if (item.$ref) {
          const refName = item.$ref.split("/").pop();
          objectSchema = `${objectSchema}.merge(${refName}Schema)`;
        } else {
          objectSchema = `${objectSchema}.merge(${generateZodSchema(
            item,
            `${schemaName}Part`
          )})`;
        }
      }
    }

    return objectSchema;
  }

  if (schema.type === "array") {
    const itemsSchema = propertyToZod(schema.items);
    return `z.array(${itemsSchema})`;
  }

  return propertyToZod(schema);
}

function propertyToZod(schema, propName = "") {
  if (schema.$ref) {
    const refName = schema.$ref.split("/").pop();
    return `${refName}Schema`;
  }

  switch (schema.type) {
    case "string":
      if (schema.format === "email") {
        return "z.string().email()";
      } else if (schema.format === "date-time") {
        return "z.string().datetime()";
      } else if (schema.format === "date") {
        return "z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/)";
      } else if (schema.format === "password") {
        return "z.string().min(8)";
      }
      return "z.string()";
    case "integer":
      return "z.number().int()";
    case "number":
      return "z.number()";
    case "boolean":
      return "z.boolean()";
    case "object":
      return generateZodSchema(schema, propName);
    case "array":
      const itemsSchema = propertyToZod(schema.items);
      return `z.array(${itemsSchema})`;
    default:
      return "z.any()";
  }
}

async function generateApiSchemas(openApiDoc) {
  const apiDir = "./packages/shared/src/schemas/api";
  await mkdir(apiDir, { recursive: true });

  // ルートのインデックスファイル
  let indexContent = `// 自動生成されたAPIスキーマのインデックス\n\n`;

  // パスごとにスキーマを生成
  for (const [path, methods] of Object.entries(openApiDoc.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      // タグがない場合はスキップ
      if (!operation.tags || operation.tags.length === 0) continue;

      const tag = operation.tags[0];
      const opId = operation.operationId;

      if (!opId) continue;

      let schemaContent = `import { z } from 'zod';\nimport { schemas } from '../index';\n\n`;

      // リクエストボディのスキーマを生成
      if (operation.requestBody?.content?.["application/json"]?.schema) {
        const schema = operation.requestBody.content["application/json"].schema;

        if (schema.$ref) {
          const refName = schema.$ref.split("/").pop();
          schemaContent += `export const ${opId}RequestSchema = schemas.${refName};\n\n`;
        } else {
          schemaContent += `export const ${opId}RequestSchema = ${generateZodSchema(
            schema,
            `${opId}Request`
          )};\n\n`;
        }

        schemaContent += `export type ${opId}Request = z.infer<typeof ${opId}RequestSchema>;\n\n`;
      }

      // レスポンススキーマを生成
      if (operation.responses) {
        for (const [statusCode, response] of Object.entries(
          operation.responses
        )) {
          if (
            statusCode.startsWith("2") &&
            response.content?.["application/json"]?.schema
          ) {
            const schema = response.content["application/json"].schema;

            if (schema.$ref) {
              const refName = schema.$ref.split("/").pop();
              schemaContent += `export const ${opId}ResponseSchema = schemas.${refName};\n\n`;
            } else {
              schemaContent += `export const ${opId}ResponseSchema = ${generateZodSchema(
                schema,
                `${opId}Response`
              )};\n\n`;
            }

            schemaContent += `export type ${opId}Response = z.infer<typeof ${opId}ResponseSchema>;\n\n`;
            break; // 成功レスポンスは一つだけ処理
          }
        }
      }

      // パラメータスキーマを生成
      if (operation.parameters && operation.parameters.length > 0) {
        const pathParams = operation.parameters.filter((p) => p.in === "path");
        const queryParams = operation.parameters.filter(
          (p) => p.in === "query"
        );

        if (pathParams.length > 0) {
          schemaContent += `export const ${opId}PathParamsSchema = z.object({\n`;
          for (const param of pathParams) {
            const paramSchema = propertyToZod({ type: param.schema.type });
            schemaContent += `  ${param.name}: ${paramSchema},\n`;
          }
          schemaContent += `});\n\n`;
          schemaContent += `export type ${opId}PathParams = z.infer<typeof ${opId}PathParamsSchema>;\n\n`;
        }

        if (queryParams.length > 0) {
          schemaContent += `export const ${opId}QueryParamsSchema = z.object({\n`;
          for (const param of queryParams) {
            let paramSchema = propertyToZod(param.schema);
            if (!param.required) {
              paramSchema += ".optional()";
            }
            schemaContent += `  ${param.name}: ${paramSchema},\n`;
          }
          schemaContent += `});\n\n`;
          schemaContent += `export type ${opId}QueryParams = z.infer<typeof ${opId}QueryParamsSchema>;\n\n`;
        }
      }

      // ファイルに書き込む
      if (
        schemaContent !==
        `import { z } from 'zod';\nimport { schemas } from '../index';\n\n`
      ) {
        const filePath = `${apiDir}/${opId}.ts`;
        await writeFile(filePath, schemaContent);
        indexContent += `export * from './${opId}';\n`;
      }
    }
  }

  // インデックスファイルを書き込む
  await writeFile(`${apiDir}/index.ts`, indexContent);
}

main().catch(console.error);
