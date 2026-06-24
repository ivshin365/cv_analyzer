/**
 * AI model configuration.
 *
 * Models are resolved through the Vercel AI Gateway. When `AI_GATEWAY_API_KEY`
 * is set in the environment, passing a plain `"creator/model"` string as the
 * `model` to the AI SDK routes the request through the gateway automatically —
 * no provider-specific package required.
 *
 * The model slug can be overridden with the `AI_MODEL` env var if the default
 * is unavailable in your gateway.
 */
export const AI_MODEL = process.env.AI_MODEL ?? "anthropic/claude-sonnet-4.5";
