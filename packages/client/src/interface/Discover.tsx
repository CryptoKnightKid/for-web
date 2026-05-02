import { For, Show, createMemo } from "solid-js";

import { css } from "styled-system/css";
import { styled } from "styled-system/jsx";

import { useClient } from "@revolt/client";
import { useNavigate } from "@revolt/routing";
import { Button, Header, Row, iconSize, typography } from "@revolt/ui";

import MdAdminPanelSettings from "@material-design-icons/svg/filled/admin_panel_settings.svg?component-solid";
import MdAutoAwesome from "@material-design-icons/svg/filled/auto_awesome.svg?component-solid";
import MdGroups3 from "@material-design-icons/svg/filled/groups_3.svg?component-solid";
import MdLiveTv from "@material-design-icons/svg/filled/live_tv.svg?component-solid";
import MdPlayCircle from "@material-design-icons/svg/filled/play_circle.svg?component-solid";
import MdWorkspacePremium from "@material-design-icons/svg/filled/workspace_premium.svg?component-solid";

import {
  fortunaBadges,
  fortunaChannels,
  fortunaContent,
  fortunaPods,
  fortunaTiers,
} from "../fortuna/data";

import { HeaderIcon } from "./common/CommonHeader";

export function Discover() {
  const client = useClient();
  const navigate = useNavigate();
  const fortunaServer = createMemo(() =>
    [...client().servers.values()].find((server) => server.name === "Fortuna One"),
  );

  const openFortuna = () => {
    const server = fortunaServer();
    if (server) navigate(`/server/${server.id}`);
  };

  return (
    <Shell>
      <Header placement="primary">
        <HeaderIcon>
          <MdWorkspacePremium {...iconSize(22)} />
        </HeaderIcon>
        Fortuna One
      </Header>

      <div use:scrollable={{ class: pageScroll }}>
        <Hero>
          <HeroCopy>
            <Kicker>Member network operating layer</Kicker>
            <Title>Fortuna One Command Center</Title>
            <Lead>
              The dedicated Fortuna app now has the real Stoat community core
              underneath it: live rooms, member channels, roles, presence,
              messaging, media services, and the Fortuna room structure.
            </Lead>
            <Actions>
              <Button onPress={openFortuna} isDisabled={!fortunaServer()}>
                Open Fortuna room
              </Button>
              <Button
                variant="tonal"
                onPress={() => window.open("https://limitlessx.com", "_blank")}
              >
                LimitlessX pathway
              </Button>
            </Actions>
            <Show when={!fortunaServer()}>
              <SmallNote>
                The seed tool is ready. Run it from the fork to create the
                Fortuna server in this account.
              </SmallNote>
            </Show>
          </HeroCopy>
          <StatusPanel>
            <Metric>
              <strong>10</strong>
              <span>core spaces</span>
            </Metric>
            <Metric>
              <strong>41</strong>
              <span>seeded channels</span>
            </Metric>
            <Metric>
              <strong>6</strong>
              <span>member tiers</span>
            </Metric>
          </StatusPanel>
        </Hero>

        <Section>
          <SectionHeading>
            <MdGroups3 {...iconSize(22)} />
            Room Structure
          </SectionHeading>
          <ChannelGrid>
            <For each={fortunaChannels}>
              {(channel) => <ChannelTile>{channel}</ChannelTile>}
            </For>
          </ChannelGrid>
        </Section>

        <Section>
          <SectionHeading>
            <MdWorkspacePremium {...iconSize(22)} />
            Tiers and Profile Covers
          </SectionHeading>
          <TierGrid>
            <For each={fortunaTiers}>
              {(tier) => (
                <TierCard style={{ "--tier": tier.colour }}>
                  <TierRing>
                    <span>{tier.name.slice(0, 1)}</span>
                  </TierRing>
                  <TierContent>
                    <h3>{tier.name}</h3>
                    <p>{tier.access}</p>
                    <small>{tier.badge}</small>
                  </TierContent>
                </TierCard>
              )}
            </For>
          </TierGrid>
        </Section>

        <Split>
          <ProductPanel>
            <SectionHeading>
              <MdAutoAwesome {...iconSize(22)} />
              Badge System
            </SectionHeading>
            <For each={fortunaBadges}>
              {([name, detail]) => <ListItem title={name} detail={detail} />}
            </For>
          </ProductPanel>

          <ProductPanel>
            <SectionHeading>
              <MdGroups3 {...iconSize(22)} />
              Pods
            </SectionHeading>
            <For each={fortunaPods}>
              {([name, detail]) => <ListItem title={name} detail={detail} />}
            </For>
          </ProductPanel>
        </Split>

        <Split>
          <ProductPanel>
            <SectionHeading>
              <MdPlayCircle {...iconSize(22)} />
              Content Library
            </SectionHeading>
            <For each={fortunaContent}>
              {([name, detail]) => <ListItem title={name} detail={detail} />}
            </For>
          </ProductPanel>

          <ProductPanel>
            <SectionHeading>
              <MdAdminPanelSettings {...iconSize(22)} />
              Admin Milestones
            </SectionHeading>
            <Roadmap>
              <span>Access and roles</span>
              <span>Events and content</span>
              <span>Badges and overrides</span>
              <span>Pods and matching</span>
              <span>Moderation and analytics</span>
            </Roadmap>
          </ProductPanel>
        </Split>

        <LiveStrip>
          <MdLiveTv {...iconSize(24)} />
          <div>
            <strong>Live events layer</strong>
            <span>
              Stoat voice/video is enabled for the room; Zoom SDK and Mux become
              the production event and replay providers when credentials are
              ready.
            </span>
          </div>
        </LiveStrip>
      </div>
    </Shell>
  );
}

function ListItem(props: { title: string; detail: string }) {
  return (
    <Item>
      <strong>{props.title}</strong>
      <span>{props.detail}</span>
    </Item>
  );
}

const pageScroll = css({
  flex: 1,
  minWidth: 0,
  padding: "24px",
});

const Shell = styled("div", {
  base: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    color: "var(--md-sys-color-on-surface)",
    background:
      "linear-gradient(140deg, #050505 0%, #0d0b08 42%, #11161a 100%)",
  },
});

const Hero = styled("section", {
  base: {
    display: "grid",
    gap: "24px",
    alignItems: "stretch",
    gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, 0.65fr)",
    padding: "28px",
    border: "1px solid rgba(242, 213, 138, 0.18)",
    borderRadius: "8px",
    background:
      "linear-gradient(135deg, rgba(201, 164, 71, 0.13), rgba(122, 17, 24, 0.1) 45%, rgba(217, 231, 245, 0.06))",
    boxShadow: "0 24px 70px rgba(0, 0, 0, 0.35)",
    mdDown: {
      gridTemplateColumns: "1fr",
      padding: "20px",
    },
  },
});

const HeroCopy = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    justifyContent: "center",
  },
});

const Kicker = styled("p", {
  base: {
    ...typography.raw({ class: "label", size: "small" }),
    color: "var(--fortuna-gold-bright)",
    textTransform: "uppercase",
    letterSpacing: "0",
  },
});

const Title = styled("h1", {
  base: {
    fontSize: "44px",
    lineHeight: 1,
    fontWeight: 700,
    letterSpacing: "0",
    mdDown: {
      fontSize: "34px",
    },
  },
});

const Lead = styled("p", {
  base: {
    maxWidth: "760px",
    color: "rgba(255, 249, 235, 0.78)",
    fontSize: "16px",
    lineHeight: 1.65,
  },
});

const Actions = styled(Row, {
  base: {
    gap: "10px",
    flexWrap: "wrap",
  },
});

const SmallNote = styled("p", {
  base: {
    color: "rgba(255,255,255,0.58)",
    fontSize: "13px",
  },
});

const StatusPanel = styled("div", {
  base: {
    display: "grid",
    gap: "10px",
  },
});

const Metric = styled("div", {
  base: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    padding: "18px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "8px",
    background: "rgba(5, 5, 5, 0.48)",
    "& strong": {
      fontSize: "36px",
      color: "var(--fortuna-gold-bright)",
    },
    "& span": {
      color: "rgba(255,255,255,0.68)",
    },
  },
});

const Section = styled("section", {
  base: {
    marginTop: "24px",
  },
});

const SectionHeading = styled("h2", {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
    fontSize: "18px",
    fontWeight: 700,
  },
});

const ChannelGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "10px",
  },
});

const ChannelTile = styled("div", {
  base: {
    minHeight: "58px",
    display: "flex",
    alignItems: "center",
    padding: "14px",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.045)",
    color: "rgba(255,255,255,0.84)",
  },
});

const TierGrid = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "12px",
  },
});

const TierCard = styled("article", {
  base: {
    display: "flex",
    gap: "14px",
    padding: "16px",
    minHeight: "142px",
    border: "1px solid color-mix(in srgb, var(--tier) 42%, transparent)",
    borderRadius: "8px",
    background:
      "linear-gradient(135deg, color-mix(in srgb, var(--tier) 18%, transparent), rgba(255,255,255,0.035))",
  },
});

const TierRing = styled("div", {
  base: {
    width: "68px",
    height: "68px",
    flex: "0 0 68px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    border: "3px solid var(--tier)",
    boxShadow: "0 0 26px color-mix(in srgb, var(--tier) 45%, transparent)",
    "& span": {
      width: "44px",
      height: "44px",
      display: "grid",
      placeItems: "center",
      borderRadius: "50%",
      color: "#050505",
      background: "var(--tier)",
      fontWeight: 800,
    },
  },
});

const TierContent = styled("div", {
  base: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    "& h3": {
      fontSize: "18px",
      fontWeight: 700,
    },
    "& p": {
      color: "rgba(255,255,255,0.72)",
      lineHeight: 1.45,
    },
    "& small": {
      color: "var(--fortuna-gold-bright)",
    },
  },
});

const Split = styled("div", {
  base: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    marginTop: "24px",
    mdDown: {
      gridTemplateColumns: "1fr",
    },
  },
});

const ProductPanel = styled("section", {
  base: {
    padding: "18px",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.04)",
  },
});

const Item = styled("div", {
  base: {
    display: "grid",
    gap: "4px",
    padding: "12px 0",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    "& strong": {
      color: "rgba(255,255,255,0.92)",
    },
    "& span": {
      color: "rgba(255,255,255,0.64)",
      lineHeight: 1.45,
    },
  },
});

const Roadmap = styled("div", {
  base: {
    display: "grid",
    gap: "10px",
    "& span": {
      padding: "12px",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "8px",
      background: "rgba(255,255,255,0.035)",
    },
  },
});

const LiveStrip = styled("section", {
  base: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    marginTop: "24px",
    padding: "18px",
    borderRadius: "8px",
    border: "1px solid rgba(201, 164, 71, 0.24)",
    background: "rgba(201, 164, 71, 0.08)",
    "& div": {
      display: "grid",
      gap: "4px",
    },
    "& span": {
      color: "rgba(255,255,255,0.68)",
      lineHeight: 1.45,
    },
  },
});
