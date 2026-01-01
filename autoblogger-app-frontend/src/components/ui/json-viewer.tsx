"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./button";

interface JsonViewerProps {
  data: any;
  className?: string;
  defaultExpanded?: boolean;
}

interface JsonNodeProps {
  value: any;
  keyName?: string;
  level?: number;
  isLast?: boolean;
  defaultExpanded?: boolean;
}

function JsonNode({
  value,
  keyName,
  level = 0,
  isLast = true,
  defaultExpanded = false,
}: JsonNodeProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || level < 2);

  const indent = "  ".repeat(level);

  if (value === null) {
    return (
      <div className="font-mono text-sm">
        {keyName && (
          <>
            <span className="text-blue-600 dark:text-blue-400">
              &quot;{keyName}&quot;
            </span>
            <span className="text-gray-500">: </span>
          </>
        )}
        <span className="text-gray-500 italic">null</span>
        {!isLast && <span className="text-gray-500">,</span>}
      </div>
    );
  }

  if (value === undefined) {
    return (
      <div className="font-mono text-sm">
        {keyName && (
          <>
            <span className="text-blue-600 dark:text-blue-400">
              &quot;{keyName}&quot;
            </span>
            <span className="text-gray-500">: </span>
          </>
        )}
        <span className="text-gray-500 italic">undefined</span>
        {!isLast && <span className="text-gray-500">,</span>}
      </div>
    );
  }

  if (typeof value === "boolean") {
    return (
      <div className="font-mono text-sm">
        {keyName && (
          <>
            <span className="text-blue-600 dark:text-blue-400">
              &quot;{keyName}&quot;
            </span>
            <span className="text-gray-500">: </span>
          </>
        )}
        <span className="text-purple-600 dark:text-purple-400">
          {value.toString()}
        </span>
        {!isLast && <span className="text-gray-500">,</span>}
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className="font-mono text-sm">
        {keyName && (
          <>
            <span className="text-blue-600 dark:text-blue-400">
              &quot;{keyName}&quot;
            </span>
            <span className="text-gray-500">: </span>
          </>
        )}
        <span className="text-green-600 dark:text-green-400">{value}</span>
        {!isLast && <span className="text-gray-500">,</span>}
      </div>
    );
  }

  if (typeof value === "string") {
    return (
      <div className="font-mono text-sm">
        {keyName && (
          <>
            <span className="text-blue-600 dark:text-blue-400">
              &quot;{keyName}&quot;
            </span>
            <span className="text-gray-500">: </span>
          </>
        )}
        <span className="text-orange-600 dark:text-orange-400">
          &quot;{value}&quot;
        </span>
        {!isLast && <span className="text-gray-500">,</span>}
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="font-mono text-sm">
          {keyName && (
            <>
              <span className="text-blue-600 dark:text-blue-400">
                &quot;{keyName}&quot;
              </span>
              <span className="text-gray-500">: </span>
            </>
          )}
          <span className="text-gray-500">[]</span>
          {!isLast && <span className="text-gray-500">,</span>}
        </div>
      );
    }

    return (
      <div className="font-mono text-sm">
        {keyName && (
          <div className="flex items-center group">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mr-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-500" />
              )}
            </button>
            <span className="text-blue-600 dark:text-blue-400">
              &quot;{keyName}&quot;
            </span>
            <span className="text-gray-500">: </span>
            <span className="text-gray-500">[</span>
            {!isExpanded && (
              <span className="text-gray-400 ml-1">
                {value.length} {value.length === 1 ? "item" : "items"}
              </span>
            )}
          </div>
        )}
        {isExpanded && (
          <div className="ml-4 border-l border-gray-300 dark:border-gray-700 pl-2">
            {value.map((item, index) => (
              <JsonNode
                key={index}
                value={item}
                level={level + 1}
                isLast={index === value.length - 1}
                defaultExpanded={defaultExpanded}
              />
            ))}
          </div>
        )}
        <div>
          <span className="text-gray-500">]</span>
          {!isLast && <span className="text-gray-500">,</span>}
        </div>
      </div>
    );
  }

  if (typeof value === "object") {
    // Get all enumerable properties, including inherited ones if needed
    const keys = Object.keys(value);
    const ownKeys = Object.getOwnPropertyNames(value);
    const allKeys = Array.from(new Set([...keys, ...ownKeys]));

    // Filter out internal properties and sort
    const filteredKeys = allKeys
      .filter((key) => !key.startsWith("_") || keys.includes(key))
      .sort();

    if (filteredKeys.length === 0) {
      return (
        <div className="font-mono text-sm">
          {keyName && (
            <>
              <span className="text-blue-600 dark:text-blue-400">
                &quot;{keyName}&quot;
              </span>
              <span className="text-gray-500">: </span>
            </>
          )}
          <span className="text-gray-500">{"{}"}</span>
          {!isLast && <span className="text-gray-500">,</span>}
        </div>
      );
    }

    return (
      <div className="font-mono text-sm">
        {keyName ? (
          <div className="flex items-center group">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mr-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-500" />
              )}
            </button>
            <span className="text-blue-600 dark:text-blue-400">
              &quot;{keyName}&quot;
            </span>
            <span className="text-gray-500">: </span>
            <span className="text-gray-500">{"{"}</span>
            {!isExpanded && (
              <span className="text-gray-400 ml-1">
                {filteredKeys.length}{" "}
                {filteredKeys.length === 1 ? "key" : "keys"}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center group">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mr-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-gray-500" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-500" />
              )}
            </button>
            <span className="text-gray-500">{"{"}</span>
            {!isExpanded && (
              <span className="text-gray-400 ml-1">
                {filteredKeys.length}{" "}
                {filteredKeys.length === 1 ? "key" : "keys"}
              </span>
            )}
          </div>
        )}
        {isExpanded && (
          <div
            className={
              keyName
                ? "ml-4 border-l border-gray-300 dark:border-gray-700 pl-2"
                : "ml-4"
            }
          >
            {filteredKeys.map((key, index) => (
              <JsonNode
                key={key}
                keyName={key}
                value={value[key]}
                level={level + 1}
                isLast={index === filteredKeys.length - 1}
                defaultExpanded={defaultExpanded}
              />
            ))}
          </div>
        )}
        <div>
          <span className="text-gray-500">{"}"}</span>
          {!isLast && <span className="text-gray-500">,</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="font-mono text-sm text-gray-500">
      {keyName && <span>&quot;{keyName}&quot;: </span>}
      <span>{String(value)}</span>
      {!isLast && <span>,</span>}
    </div>
  );
}

export function JsonViewer({
  data,
  className,
  defaultExpanded = false,
}: JsonViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      toast.success("JSON copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy JSON");
    }
  };

  if (!data) {
    return (
      <div className="text-muted-foreground italic text-sm">
        No data to display
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="absolute right-0 top-0 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          <Copy className="h-3 w-3" />
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <div className="bg-muted/50 p-4 rounded-lg overflow-x-auto">
        <JsonNode value={data} defaultExpanded={defaultExpanded} />
      </div>
    </div>
  );
}
