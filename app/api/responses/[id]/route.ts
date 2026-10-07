import { findMatches } from "@/lib/matching";
import { SAMPLE_PROFILES } from "@/lib/profiles";
import { getStore, isResponseId } from "@/lib/store";
import { validateDetails, validatePost } from "@/lib/validation";

const notFound = () => Response.json({ error: "Not found or already answered" }, { status: 409 });

/** Retry after "no match": replaces the details on the same response and returns new suggestions. */
export async function PUT(request: Request, ctx: RouteContext<"/api/responses/[id]">) {
  const { id } = await ctx.params;
  if (!isResponseId(id)) return notFound();

  const body = await request.json().catch(() => null);
  const details = validateDetails(body?.details);
  if (!details.ok) return Response.json({ errors: details.errors }, { status: 400 });

  const matches = findMatches(details.value, SAMPLE_PROFILES);
  const saved = await getStore().updateDetails(id, details.value, matches.length);
  if (!saved) return notFound();
  return Response.json({ id, matches });
}

/** Adds the after-answers to an existing response. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/responses/[id]">) {
  const { id } = await ctx.params;
  if (!isResponseId(id)) return notFound();

  const body = await request.json().catch(() => null);
  const post = validatePost(body?.post);
  if (!post.ok) return Response.json({ errors: post.errors }, { status: 400 });

  const saved = await getStore().addPost(id, post.value);
  if (!saved) return notFound();
  return Response.json({ ok: true });
}
