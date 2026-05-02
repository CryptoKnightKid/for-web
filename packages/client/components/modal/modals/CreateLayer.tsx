import { For, createSignal } from "solid-js";

import type { API, Channel, Server } from "stoat.js";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useNavigate } from "@revolt/routing";
import { Button, Dialog, DialogProps, Row, typography } from "@revolt/ui";
import { Symbol } from "@revolt/ui/components/utils/Symbol";

import { useModals } from "..";
import { Modals } from "../types";
import { defaultLayerMeta, encodeLayerMeta } from "../../../src/fortuna/layers";

type LayerType = {
  id: "page" | "feed" | "product" | "collection" | "link" | "channel";
  title: string;
  icon: string;
  description: string;
  channelType: "Text" | "Voice";
  defaultName: string;
  intro: string;
};

const layerTypes: LayerType[] = [
  {
    id: "page",
    title: "Page",
    icon: "draft",
    description: "Add a static page of text, media, links, and more",
    channelType: "Text",
    defaultName: "new-page",
    intro: "Page layer created. Use this space for copy, media, links, and pinned reference material.",
  },
  {
    id: "feed",
    title: "Feed",
    icon: "dynamic_feed",
    description: "Add a feed of posts for updates or discussions",
    channelType: "Text",
    defaultName: "new-feed",
    intro: "Feed layer created. Use this as a stream for updates, prompts, and discussion.",
  },
  {
    id: "product",
    title: "Product",
    icon: "deployed_code",
    description: "Add a product as a dedicated layer",
    channelType: "Text",
    defaultName: "new-product",
    intro: "Product layer created. Add offer details, access notes, links, and fulfilment updates here.",
  },
  {
    id: "collection",
    title: "Collection",
    icon: "grid_view",
    description: "Showcase multiple products in one place",
    channelType: "Text",
    defaultName: "new-collection",
    intro: "Collection layer created. Use this to group products, resources, templates, or perks.",
  },
  {
    id: "link",
    title: "Link",
    icon: "north_east",
    description: "Add a useful link, affiliate offer, or partner perk",
    channelType: "Text",
    defaultName: "new-link",
    intro: "Link layer created. Drop the destination URL and any context members need.",
  },
  {
    id: "channel",
    title: "Channel",
    icon: "tag",
    description: "Add a live chat for conversations and community",
    channelType: "Text",
    defaultName: "new-channel",
    intro: "Channel created. Start the conversation here.",
  },
];

export function CreateLayerModal(
  props: DialogProps & Modals & { type: "create_layer" },
) {
  const client = useClient();
  const navigate = useNavigate();
  const { showError } = useModals();
  const [isCreating, setIsCreating] = createSignal(false);

  async function createLayer(layer: LayerType) {
    if (isCreating()) return;

    const fallbackName = nextAvailableName(
      props.server.channels.map((channel) => channel.name),
      layer.defaultName,
    );
    const name = window.prompt(`Name this ${layer.title.toLowerCase()} layer`, fallbackName);
    if (!name?.trim()) return;

    try {
      setIsCreating(true);
      const channel = await props.server.createChannel({
        type: layer.channelType,
        name: toChannelName(name),
      });
      await channel.edit({
        description: encodeLayerMeta(
          defaultLayerMeta(layer.id, name.trim()),
        ),
      });

      await appendToCategory(props.server, props.categoryId, channel);

      if (layer.channelType === "Text") {
        await client()
          .api.post(`/channels/${channel.id}/messages`, {
            content: layer.intro,
          })
          .catch(() => undefined);
      }

      navigate(`/server/${props.server.id}/channel/${channel.id}`);
      props.onClose();
    } catch (error) {
      showError(error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog
      show={props.show}
      onClose={props.onClose}
      title={<>Add layer to {props.categoryTitle}</>}
      minWidth={520}
      padding={0}
      isDisabled={isCreating()}
    >
      <Shell>
        <Grid>
          <For each={layerTypes}>
            {(layer) => (
              <LayerCard
                type="button"
                disabled={isCreating()}
                onClick={() => createLayer(layer)}
              >
                <IconBox>
                  <Symbol size={22}>{layer.icon}</Symbol>
                </IconBox>
                <LayerTitle>{layer.title}</LayerTitle>
                <LayerDescription>{layer.description}</LayerDescription>
              </LayerCard>
            )}
          </For>
        </Grid>
        <Footer align>
          <Hint>
            Page, product, collection, and link layers open as Fortuna content
            screens. Feed and channel layers use the live Stoat message stream.
          </Hint>
          <Button variant="text" size="small" onPress={props.onClose}>
            Close
          </Button>
        </Footer>
      </Shell>
    </Dialog>
  );
}

async function appendToCategory(
  server: Server,
  categoryId: string,
  channel: Channel,
) {
  const categories = (server.categories ?? []) as API.Category[];

  if (categoryId === "default") return;

  await server.edit({
    categories: categories.map((category) =>
      category.id === categoryId
        ? {
            ...category,
            channels: [...category.channels, channel.id],
          }
        : category,
    ),
  });
}

function toChannelName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

function nextAvailableName(existing: string[], base: string) {
  if (!existing.includes(base)) return base;

  let index = 2;
  while (existing.includes(`${base}-${index}`)) index += 1;
  return `${base}-${index}`;
}

const Shell = styled("div", {
  base: {
    padding: "18px",
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
  },
});

const Grid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "12px",
    smDown: {
      gridTemplateColumns: "1fr",
    },
  },
});

const LayerCard = styled("button", {
  base: {
    minHeight: "120px",
    padding: "16px",
    display: "grid",
    gap: "7px",
    textAlign: "left",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    color: "var(--md-sys-color-on-surface)",
    background: "rgba(255, 255, 255, 0.045)",
    cursor: "pointer",
    transition: "160ms ease border-color, 160ms ease background, 160ms ease transform",
    _hover: {
      transform: "translateY(-1px)",
      borderColor: "rgba(242, 213, 138, 0.38)",
      background: "rgba(201, 164, 71, 0.09)",
    },
    _disabled: {
      cursor: "wait",
      opacity: 0.7,
    },
  },
});

const IconBox = styled("div", {
  base: {
    width: "30px",
    height: "30px",
    display: "grid",
    placeItems: "center",
    borderRadius: "8px",
    color: "var(--fortuna-gold-bright)",
    background: "rgba(255, 255, 255, 0.07)",
  },
});

const LayerTitle = styled("strong", {
  base: {
    ...typography.raw({ class: "label" }),
    color: "var(--md-sys-color-on-surface)",
  },
});

const LayerDescription = styled("span", {
  base: {
    ...typography.raw({ class: "body", size: "small" }),
    color: "rgba(255, 255, 255, 0.62)",
    lineHeight: 1.35,
  },
});

const Footer = styled(Row, {
  base: {
    gap: "12px",
    justifyContent: "space-between",
    marginTop: "16px",
  },
});

const Hint = styled("p", {
  base: {
    ...typography.raw({ class: "label", size: "small" }),
    maxWidth: "360px",
    color: "rgba(255, 255, 255, 0.48)",
  },
});
