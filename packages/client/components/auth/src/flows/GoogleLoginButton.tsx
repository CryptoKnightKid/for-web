import { CONFIGURATION } from "@revolt/common";
import { Button, Column } from "@revolt/ui";

import { Show } from "solid-js";

function googleAuthUrl() {
  if (!CONFIGURATION.GOOGLE_AUTH_URL) return;

  const url = new URL(`${CONFIGURATION.GOOGLE_AUTH_URL}/auth/google/start`);
  url.searchParams.set(
    "return_to",
    `${window.location.origin}/login/google/callback`,
  );
  return url.toString();
}

export function GoogleLoginButton() {
  return (
    <Show when={googleAuthUrl()}>
      {(href) => (
        <a href={href()}>
          <Column>
            <Button>Continue with Google</Button>
          </Column>
        </a>
      )}
    </Show>
  );
}

export function hasGoogleLogin() {
  return !!googleAuthUrl();
}
