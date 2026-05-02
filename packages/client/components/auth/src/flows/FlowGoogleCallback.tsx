import { Trans } from "@lingui-solid/solid/macro";

import { useClientLifecycle } from "@revolt/client";
import { TransitionType } from "@revolt/client/Controller";
import { useNavigate } from "@revolt/routing";
import { useState } from "@revolt/state";
import { Button, Column, Text } from "@revolt/ui";

import { createSignal, onMount } from "solid-js";
import { FlowTitle } from "./Flow";

type GoogleSession = {
  _id: string;
  token: string;
  userId: string;
  valid: boolean;
};

function readSessionFromHash() {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const encoded = hash.get("session");
  if (!encoded) throw new Error("Google did not return a session.");

  const session = JSON.parse(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")));
  if (
    typeof session?._id !== "string" ||
    typeof session?.token !== "string" ||
    typeof session?.userId !== "string"
  ) {
    throw new Error("Google returned an invalid session.");
  }

  return { ...session, valid: true } as GoogleSession;
}

/**
 * Accept a session from the Fortuna Google auth bridge.
 */
export default function FlowGoogleCallback() {
  const state = useState();
  const navigate = useNavigate();
  const { lifecycle } = useClientLifecycle();
  const [error, setError] = createSignal<string>();

  onMount(() => {
    try {
      const session = readSessionFromHash();
      state.auth.setSession(session);
      lifecycle.transition({
        type: TransitionType.LoginUncached,
        session,
      });
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google login failed.");
    }
  });

  return (
    <Column gap="lg">
      <FlowTitle subtitle={<Trans>Google sign in</Trans>} emoji="wave">
        <Trans>Connecting...</Trans>
      </FlowTitle>
      <Text>{error() ?? <Trans>Taking you into Fortuna One.</Trans>}</Text>
      {error() && (
        <a href="/login">
          <Button>
            <Trans>Back to login</Trans>
          </Button>
        </a>
      )}
    </Column>
  );
}
