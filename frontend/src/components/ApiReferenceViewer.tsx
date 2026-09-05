import { useEffect, useState } from "react";
import { ChevronRight, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "#components/ui/collapsible";
import { Skeleton } from "#components/ui/skeleton";
import {
  getOpenApiDocument,
  type HttpMethod,
  type OpenApiDocument,
  type OpenApiOperation,
  type OpenApiSchema,
} from "#api/openapi";
import { cn } from "#lib/utils";

const HTTP_METHODS: HttpMethod[] = ["get", "post", "put", "patch", "delete"];
const MAX_SCHEMA_DEPTH = 3;

const METHOD_STYLES: Record<HttpMethod, string> = {
  get: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  post: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  put: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  patch: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  delete: "bg-red-500/15 text-red-600 dark:text-red-400",
};

interface RouteEntry {
  method: HttpMethod;
  path: string;
  operation: OpenApiOperation;
}

function resolveRef(
  schema: OpenApiSchema | undefined,
  schemas: Record<string, OpenApiSchema>,
): OpenApiSchema | undefined {
  if (!schema) return undefined;
  if (!schema.$ref) return schema;
  return schemas[schema.$ref.replace("#/components/schemas/", "")];
}

function schemaTypeLabel(schema: OpenApiSchema | undefined): string {
  if (!schema) return "unknown";
  if (schema.$ref) return schema.$ref.replace("#/components/schemas/", "");
  if (schema.enum) return schema.enum.join(" | ");
  if (schema.type === "array") return `${schemaTypeLabel(schema.items)}[]`;
  const type = schema.type ?? "object";
  return schema.nullable ? `${type} | null` : type;
}

function groupByTag(paths: OpenApiDocument["paths"], t: TFunction): [string, RouteEntry[]][] {
  const groups = new Map<string, RouteEntry[]>();
  for (const [path, methods] of Object.entries(paths)) {
    for (const method of HTTP_METHODS) {
      const operation = methods[method];
      if (!operation) continue;
      const tag = operation.tags?.[0] ?? t("apiReference.other");
      const entries = groups.get(tag) ?? [];
      entries.push({ method, path, operation });
      groups.set(tag, entries);
    }
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

interface SchemaFieldsProps {
  schema: OpenApiSchema | undefined;
  schemas: Record<string, OpenApiSchema>;
  depth?: number;
}

function SchemaFields({ schema, schemas, depth = 0 }: SchemaFieldsProps) {
  const { t } = useTranslation();
  const resolved = resolveRef(schema, schemas);
  if (!resolved?.properties) return null;

  return (
    <div className="space-y-1 border-l border-border pl-3">
      {Object.entries(resolved.properties).map(([name, propSchema]) => {
        const propResolved = resolveRef(propSchema, schemas);
        const canExpand =
          depth < MAX_SCHEMA_DEPTH && Boolean(propResolved?.properties);

        return (
          <div key={name}>
            <div className="flex items-baseline gap-2 text-xs">
              <span className="font-mono font-medium">{name}</span>
              <span className="font-mono text-muted-foreground">
                {schemaTypeLabel(propSchema)}
              </span>
              {resolved.required?.includes(name) && (
                <span className="text-[10px] tracking-wide text-muted-foreground/70 uppercase">
                  {t("apiReference.required")}
                </span>
              )}
            </div>
            {canExpand && (
              <SchemaFields
                schema={propSchema}
                schemas={schemas}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface OperationRowProps {
  method: HttpMethod;
  path: string;
  operation: OpenApiOperation;
  schemas: Record<string, OpenApiSchema>;
}

function OperationRow({ method, path, operation, schemas }: OperationRowProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const requestSchema =
    operation.requestBody?.content?.["application/json"]?.schema;
  const parameters = operation.parameters ?? [];
  const responseEntries = Object.entries(operation.responses);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-muted">
        <ChevronRight
          className={cn(
            "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-90",
          )}
        />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium">
              {operation.summary ?? path}
            </span>
            {operation.security && operation.security.length > 0 && (
              <Lock className="size-3.5 shrink-0 text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase",
                METHOD_STYLES[method],
              )}
            >
              {method}
            </span>
            <span className="truncate font-mono text-xs text-muted-foreground">
              {path}
            </span>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 px-3 pt-1 pb-4 pl-10">
        {parameters.length > 0 && (
          <div>
            <h4 className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t("apiReference.parameters")}
            </h4>
            <div className="space-y-1">
              {parameters.map((parameter) => (
                <div
                  key={`${parameter.in}-${parameter.name}`}
                  className="flex items-baseline gap-2 text-xs"
                >
                  <span className="font-mono font-medium">
                    {parameter.name}
                  </span>
                  <span className="text-[10px] tracking-wide text-muted-foreground/70 uppercase">
                    {parameter.in}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {schemaTypeLabel(parameter.schema)}
                  </span>
                  {parameter.required && (
                    <span className="text-[10px] tracking-wide text-muted-foreground/70 uppercase">
                      requis
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {requestSchema && (
          <div>
            <h4 className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t("apiReference.requestBody")}
            </h4>
            <SchemaFields schema={requestSchema} schemas={schemas} />
          </div>
        )}
        <div>
          <h4 className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {t("apiReference.responses")}
          </h4>
          <div className="space-y-2">
            {responseEntries.map(([status, response]) => (
              <div key={status}>
                <span className="font-mono text-xs font-semibold">
                  {status}
                </span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {response.description || ""}
                </span>
                <SchemaFields
                  schema={response.content?.["application/json"]?.schema}
                  schemas={schemas}
                />
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ApiReferenceViewer() {
  const { t } = useTranslation();
  const [openApiDoc, setOpenApiDoc] = useState<OpenApiDocument | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getOpenApiDocument()
      .then((doc) => {
        if (!cancelled) setOpenApiDoc(doc);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {t("apiReference.loadError")}
      </p>
    );
  }

  if (!openApiDoc) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const schemas = openApiDoc.components?.schemas ?? {};
  const groups = groupByTag(openApiDoc.paths, t);

  return (
    <div className="space-y-6">
      {groups.map(([tag, entries]) => (
        <div key={tag}>
          <h3 className="mb-2 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
            {tag}
          </h3>
          <div className="divide-y divide-border rounded-md border border-border">
            {entries.map(({ method, path, operation }) => (
              <OperationRow
                key={`${method}-${path}`}
                method={method}
                path={path}
                operation={operation}
                schemas={schemas}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
