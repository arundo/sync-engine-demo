// replace with something like postgres database
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';

export const createClient = (context) => {
  console.log('=== creating..', process.env.SUPABASE_URL);

  return createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return parseCookieHeader(context.req.headers.cookie ?? '');
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          context.res.appendHeader('Set-Cookie', serializeCookieHeader(name, value, options)),
        );
      },
    },
  });
};
