import { BiSolidShield } from "solid-icons/bi";
import { Show } from "solid-js";

import { Trans, useLingui } from "@lingui-solid/solid/macro";
import { User, UserBadges } from "stoat.js";
import { styled } from "styled-system/jsx";

import badgeDiamond from "../../../../../public/assets/badges/fortuna_diamond.svg";
import badgeGarnet from "../../../../../public/assets/badges/fortuna_garnet.svg";
import badgeInnerCircle from "../../../../../public/assets/badges/fortuna_inner_circle.svg";
import badgeRuby from "../../../../../public/assets/badges/fortuna_ruby.svg";
import badgeVip from "../../../../../public/assets/badges/fortuna_vip.svg";
import { Text } from "../../design";

import { ProfileCard } from "./ProfileCard";

export function ProfileBadges(props: { user: User }) {
  const { t } = useLingui();

  return (
    <Show when={props.user.badges}>
      <ProfileCard>
        <Text class="title" size="large">
          <Trans>Badges</Trans>
        </Text>

        <BadgeRow>
          <Show when={props.user.badges & UserBadges.Founder}>
            <img
              use:floating={{
                tooltip: {
                  placement: "top",
                  content: t`Garnet member`,
                },
              }}
              src={badgeGarnet}
            />
          </Show>
          <Show when={props.user.badges & UserBadges.Developer}>
            <img
              use:floating={{
                tooltip: {
                  placement: "top",
                  content: t`Ruby member`,
                },
              }}
              src={badgeRuby}
            />
          </Show>
          <Show when={props.user.badges & UserBadges.Supporter}>
            <img
              use:floating={{
                tooltip: {
                  placement: "top",
                  content: t`VIP member`,
                },
              }}
              src={badgeVip}
            />
          </Show>
          <Show when={props.user.badges & UserBadges.Translator}>
            <img
              use:floating={{
                tooltip: {
                  placement: "top",
                  content: t`Diamond member`,
                },
              }}
              src={badgeDiamond}
            />
          </Show>
          <Show when={props.user.badges & UserBadges.EarlyAdopter}>
            <img
              use:floating={{
                tooltip: {
                  placement: "top",
                  content: t`Inner Circle member`,
                },
              }}
              src={badgeInnerCircle}
            />
          </Show>
          <Show when={props.user.badges & UserBadges.PlatformModeration}>
            <span
              use:floating={{
                tooltip: {
                  placement: "top",
                  content: t`Fortuna concierge`,
                },
              }}
            >
              <img src={badgeVip} />
            </span>
          </Show>
          <Show when={props.user.badges & UserBadges.ResponsibleDisclosure}>
            <span
              use:floating={{
                tooltip: {
                  placement: "top",
                  content: t`Trusted operator`,
                },
              }}
            >
              <BiSolidShield />
            </span>
          </Show>
          <Show when={props.user.badges & UserBadges.Paw}>
            <img
              use:floating={{
                tooltip: {
                  placement: "top",
                  content: t`Meet Tony access`,
                },
              }}
              src={badgeInnerCircle}
            />
          </Show>
        </BadgeRow>
      </ProfileCard>
    </Show>
  );
}

const BadgeRow = styled("div", {
  base: {
    gap: "var(--gap-md)",
    display: "flex",
    flexWrap: "wrap",

    "& img, & svg": {
      width: "28px",
      height: "28px",
      aspectRatio: "1/1",
      filter: "drop-shadow(0 0 8px rgba(201, 164, 71, 0.28))",
    },
  },
});
