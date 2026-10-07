import { getStore, isResponseId } from "@/lib/store";
import { validatePost } from "@/lib/validation";

/** Adds the after-answers to an existing response. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/responses/[id]">) {
  const { id } = await ctx.params;
  if (!isResponseId(id)) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  const post = validatePost(body?.post);
  if (!post.ok) return Response.json({ errors: post.errors }, { status: 400 });

  const saved = await getStore().addPost(id, post.value);
  if (!saved) return Response.json({ error: "Not found or already answered" }, { status: 409 });
  return Response.json({ ok: true });
}
