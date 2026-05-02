import { For, Match, Show, Switch, createSignal } from "solid-js";

import type { Channel } from "stoat.js";
import { styled } from "styled-system/jsx";

import { Header, main, typography } from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import {
  FortunaLayerMeta,
  encodeLayerMeta,
  parseLayerMeta,
} from "../../fortuna/layers";

import { ChannelHeader } from "./ChannelHeader";
import { TextChannel } from "./text/TextChannel";

export function FortunaLayerPage(props: { channel: Channel }) {
  const [meta, setMeta] = createSignal(parseLayerMeta(props.channel.description)!);

  if (meta().type === "feed") {
    return <TextChannel channel={props.channel} />;
  }

  async function update(next: FortunaLayerMeta) {
    await props.channel.edit({ description: encodeLayerMeta(next) });
    setMeta(next);
  }

  function editBody() {
    const next = window.prompt("Layer text", meta().body ?? "");
    if (next === null) return;
    update({ ...meta(), body: next });
  }

  function editUrl() {
    const next = window.prompt("Layer URL", meta().url ?? "");
    if (next === null) return;
    update({ ...meta(), url: next });
  }

  function addItem() {
    const title = window.prompt("Item title");
    if (!title) return;
    const url = window.prompt("Item URL") ?? "";
    const detail = window.prompt("Item detail") ?? "";
    update({
      ...meta(),
      items: [...(meta().items ?? []), { title, detail, url }],
    });
  }

  return (
    <>
      <Header placement="primary">
        <ChannelHeader channel={props.channel} />
      </Header>
      <LayerMain class={main()}>
        <LayerHero>
          <LayerIcon>
            <Symbol size={30}>{iconFor(meta().type)}</Symbol>
          </LayerIcon>
          <div>
            <Kicker>{meta().type} layer</Kicker>
            <Title>{meta().title}</Title>
            <BodyText>{meta().body}</BodyText>
          </div>
        </LayerHero>

        <Switch>
          <Match when={meta().type === "page"}>
            <Panel>
              <PanelTitle>Page Content</PanelTitle>
              <Show when={meta().image}>
                <LayerImage src={meta().image} alt="" />
              </Show>
              <BodyText>{meta().body}</BodyText>
              <ActionRow>
                <ActionButton onClick={editBody}>Edit text</ActionButton>
                <ActionButton
                  onClick={() => {
                    const image = window.prompt("Image URL", meta().image ?? "");
                    if (image !== null) update({ ...meta(), image });
                  }}
                >
                  Set image
                </ActionButton>
              </ActionRow>
            </Panel>
          </Match>

          <Match when={meta().type === "product"}>
            <Panel>
              <PanelTitle>Product</PanelTitle>
              <BodyText>{meta().body}</BodyText>
              <Show when={meta().url}>
                <PrimaryLink href={meta().url} target="_blank" rel="noreferrer">
                  Open product
                </PrimaryLink>
              </Show>
              <ActionRow>
                <ActionButton onClick={editBody}>Edit product details</ActionButton>
                <ActionButton onClick={editUrl}>Set product URL</ActionButton>
              </ActionRow>
            </Panel>
          </Match>

          <Match when={meta().type === "collection"}>
            <Panel>
              <PanelTitle>Collection</PanelTitle>
              <CollectionGrid>
                <For each={meta().items ?? []}>
                  {(item) => (
                    <CollectionItem>
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                      <Show when={item.url}>
                        <a href={item.url} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      </Show>
                    </CollectionItem>
                  )}
                </For>
              </CollectionGrid>
              <ActionRow>
                <ActionButton onClick={addItem}>Add item</ActionButton>
                <ActionButton onClick={editBody}>Edit collection note</ActionButton>
              </ActionRow>
            </Panel>
          </Match>

          <Match when={meta().type === "link"}>
            <Panel>
              <PanelTitle>Link</PanelTitle>
              <BodyText>{meta().body}</BodyText>
              <Show when={meta().url}>
                <PrimaryLink href={meta().url} target="_blank" rel="noreferrer">
                  {meta().url}
                </PrimaryLink>
              </Show>
              <ActionRow>
                <ActionButton onClick={editBody}>Edit context</ActionButton>
                <ActionButton onClick={editUrl}>Set URL</ActionButton>
              </ActionRow>
            </Panel>
          </Match>
        </Switch>
      </LayerMain>
    </>
  );
}

function iconFor(type: FortunaLayerMeta["type"]) {
  return (
    {
      page: "draft",
      feed: "dynamic_feed",
      product: "deployed_code",
      collection: "grid_view",
      link: "north_east",
      channel: "tag",
    } satisfies Record<FortunaLayerMeta["type"], string>
  )[type];
}

const LayerMain = styled("main", {
  base: {
    gap: "18px",
    padding: "24px",
    background:
      "linear-gradient(135deg, rgba(5,5,5,1), rgba(15,13,10,1) 48%, rgba(17,22,26,1))",
  },
});

const LayerHero = styled("section", {
  base: {
    display: "flex",
    gap: "18px",
    alignItems: "center",
    padding: "22px",
    border: "1px solid rgba(242, 213, 138, 0.18)",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.045)",
  },
});

const LayerIcon = styled("div", {
  base: {
    width: "64px",
    height: "64px",
    display: "grid",
    placeItems: "center",
    flex: "0 0 64px",
    borderRadius: "8px",
    color: "var(--fortuna-gold-bright)",
    background: "rgba(201, 164, 71, 0.12)",
    border: "1px solid rgba(201, 164, 71, 0.24)",
  },
});

const Kicker = styled("p", {
  base: {
    ...typography.raw({ class: "label", size: "small" }),
    color: "var(--fortuna-gold-bright)",
    textTransform: "uppercase",
  },
});

const Title = styled("h1", {
  base: {
    fontSize: "30px",
    fontWeight: 800,
  },
});

const BodyText = styled("p", {
  base: {
    maxWidth: "760px",
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.6,
  },
});

const Panel = styled("section", {
  base: {
    display: "grid",
    gap: "14px",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
  },
});

const PanelTitle = styled("h2", {
  base: {
    fontSize: "18px",
    fontWeight: 700,
  },
});

const LayerImage = styled("img", {
  base: {
    width: "100%",
    maxHeight: "360px",
    objectFit: "cover",
    borderRadius: "8px",
  },
});

const ActionRow = styled("div", {
  base: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
});

const ActionButton = styled("button", {
  base: {
    padding: "10px 12px",
    borderRadius: "8px",
    border: "1px solid rgba(201, 164, 71, 0.26)",
    color: "var(--fortuna-gold-bright)",
    background: "rgba(201, 164, 71, 0.08)",
    cursor: "pointer",
  },
});

const PrimaryLink = styled("a", {
  base: {
    color: "var(--fortuna-gold-bright)",
    textDecoration: "underline",
  },
});

const CollectionGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "12px",
  },
});

const CollectionItem = styled("article", {
  base: {
    display: "grid",
    gap: "6px",
    padding: "14px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.2)",
    "& span": {
      color: "rgba(255,255,255,0.62)",
    },
    "& a": {
      color: "var(--fortuna-gold-bright)",
    },
  },
});
