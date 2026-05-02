import { Component, Match, Switch, createMemo } from "solid-js";

import { Channel } from "stoat.js";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { Navigate, useParams } from "@revolt/routing";

import { parseLayerMeta } from "../../fortuna/layers";
import { AgeGate } from "./AgeGate";
import { FortunaLayerPage } from "./FortunaLayerPage";
import { TextChannel } from "./text/TextChannel";

/**
 * Channel layout
 */
const Base = styled("div", {
  base: {
    minWidth: 0,
    flexGrow: 1,
    display: "flex",
    position: "relative",
    flexDirection: "column",
  },
});

export interface ChannelPageProps {
  channel: Channel;
}

const TEXT_CHANNEL_TYPES: Channel["type"][] = [
  "TextChannel",
  "DirectMessage",
  "Group",
  "SavedMessages",
];

/**
 * Channel component
 */
export const ChannelPage: Component = () => {
  const params = useParams();
  const client = useClient();
  const channel = createMemo(() => client()!.channels.get(params.channel)!);

  return (
    <Base>
      <Switch fallback="Unknown channel type!">
        <Match when={!channel()}>
          <Navigate href={"../.."} />
        </Match>
        <Match when={TEXT_CHANNEL_TYPES.includes(channel()!.type)}>
          <AgeGate
            enabled={channel().mature}
            contentId={channel().id}
            contentName={"#" + channel().name}
            contentType="channel"
          >
            <ShowLayerOrChannel channel={channel()} />
          </AgeGate>
        </Match>
        {/* <Match when={channel()!.type === "VoiceChannel"}>
            <Header placement="primary">
              <ChannelHeader channel={channel()} />
            </Header>
          </Match> */}
      </Switch>
    </Base>
  );
};

function ShowLayerOrChannel(props: { channel: Channel }) {
  const layer = createMemo(() => parseLayerMeta(props.channel.description));
  const shouldRenderFortunaLayer = () => {
    const type = layer()?.type;
    return !!type && type !== "channel" && type !== "feed";
  };

  return (
    <Switch fallback={<TextChannel channel={props.channel} />}>
      <Match when={shouldRenderFortunaLayer()}>
        <FortunaLayerPage channel={props.channel} />
      </Match>
    </Switch>
  );
}
