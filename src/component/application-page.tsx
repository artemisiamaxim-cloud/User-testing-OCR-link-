import { Button } from "../flyui/Button";
import { Flex } from "../flyui/Flex";
import { Heading } from "../flyui/Heading";
import { Icon } from "../flyui/Icon";
import { IconButton } from "../flyui/IconButton";
import { Link } from "../flyui/Link";
import { Logo } from "../flyui/Logo";
import { Text } from "../flyui/Text";
import {
  IconBell20Line,
  IconChatBubbleEmpty20Line,
  IconInfoCircle16Line,
  IconMoreVert16Line,
} from "../Icons";
import styles from "./application-page.module.css";

const multiplePagesSvg = "/multiple-pages-empty.svg";

// Inline SVG icons not in Icons.tsx
const IconChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconFileDoc = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M9.5 2H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5.5L9.5 2z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.5 2v3.5H13" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconMonitor = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="2.5" width="13" height="9" rx="1" stroke="currentColor" strokeWidth="1.25" />
    <path d="M5.5 13.5h5M8 11.5v2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

const IconBank = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 6h12M8 2l6 4H2l6-4zM4 6v6m3-6v6m3-6v6M2 12h12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconExternalLink = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7M7.5 1H11m0 0v3.5M11 1 5.5 6.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type ApplicationPageProps = {
  onUpload?: () => void;
  onNavigateToApplications?: () => void;
  userInitials?: string;
};

export const ApplicationPage = ({
  onUpload,
  onNavigateToApplications,
  userInitials = "WD",
}: ApplicationPageProps) => {
  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoWrapper}>
            <Logo type="app" />
          </div>
        </div>
        <nav className={styles.sidebarMenu}>
          <div
            className={`${styles.navItem} ${styles.navItemActive}`}
            onClick={onNavigateToApplications}
            style={{ cursor: "pointer" }}
          >
            <img src={multiplePagesSvg} alt="" width={20} height={20} className={styles.navItemIcon} />
            <Text fontWeight="medium" className={styles.navItemText}>
              Applications
            </Text>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div />
          <div className={styles.topBarRight}>
            <IconButton
              variant="Tertiary"
              size="auto"
              Icon={IconChatBubbleEmpty20Line}
              iconSize={20}
              accessibilityLabel="Chat"
            />
            <div className={styles.notificationWrapper}>
              <IconButton
                variant="Tertiary"
                size="auto"
                Icon={IconBell20Line}
                iconSize={20}
                accessibilityLabel="Notifications"
              />
              <span className={styles.notificationDot} aria-hidden="true" />
            </div>
            <div className={styles.avatar}>
              <Text size="xs" fontWeight="medium" lineHeight="none">
                {userInitials}
              </Text>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className={styles.pageHeader}>
          <Flex gap="2" align="center" style={{ flex: 1 }}>
            <Link onClick={onNavigateToApplications}>
              <Text size="2xl" fontWeight="semiBold" color="placeholder" lineHeight="none">
                Applications
              </Text>
            </Link>
            <Text size="2xl" color="placeholder" element="span" lineHeight="none">/</Text>
            <Text size="2xl" fontWeight="semiBold" lineHeight="none">
              Electrolites Inc.
            </Text>
          </Flex>
          <IconButton
            variant="Tertiary"
            size="auto"
            Icon={IconMoreVert16Line}
            accessibilityLabel="More options"
          />
        </div>

        {/* Scrollable content */}
        <div className={styles.contentScroll}>
          <div className={styles.contentLayout}>

            {/* ── Left column ── */}
            <div className={styles.leftColumn}>

              {/* Page title */}
              <div className={styles.pageTitle}>
                <Heading size="xl">Electrolites Inc.</Heading>
                <Text color="placeholder">Created March 10</Text>
              </div>

              {/* Offer card */}
              <div className={styles.offerCard}>
                <div>
                  <p className={styles.offerAmountLabel}>Amount · Indicative</p>
                  <p className={styles.offerAmount}>£550,000</p>
                </div>
                <p className={styles.offerSubject}>
                  <Icon size={16} color="placeholder">
                    <IconInfoCircle16Line />
                  </Icon>
                  <Text color="placeholder">Subject to a full underwriting review.</Text>
                </p>

                <div className={styles.offerTermsGrid}>
                  <div className={styles.offerTermItem}>
                    <Text size="xs" color="placeholder">Term</Text>
                    <Text fontWeight="medium">9 months</Text>
                  </div>
                  <div className={styles.offerTermItem}>
                    <Text size="xs" color="placeholder">Wayflyer fee</Text>
                    <Text fontWeight="medium">19%</Text>
                  </div>
                  <div className={styles.offerTermItem}>
                    <Text size="xs" color="placeholder">Broker commission</Text>
                    <Text fontWeight="medium">-</Text>
                  </div>
                  <div className={styles.offerTermItem}>
                    <Text size="xs" color="placeholder">Total client fee</Text>
                    <Text fontWeight="medium">-</Text>
                  </div>
                </div>

                <hr className={styles.offerDivider} />

                <Text fontWeight="medium">View requirements</Text>

                <div className={styles.requirementsBox}>
                  <div className={styles.requirementsGroup}>
                    <Text fontWeight="semiBold">Required from you</Text>
                    {[
                      "Tax returns",
                      "AR / AP report (required if trades on terms)",
                      "Debt Agreements (required if existing debt)",
                    ].map((item) => (
                      <div key={item} className={styles.requirementItem}>
                        <Icon size={16} color="placeholder">
                          <IconFileDoc />
                        </Icon>
                        <Text size="sm">{item}</Text>
                      </div>
                    ))}
                  </div>
                  <div className={styles.requirementsGroup}>
                    <Text fontWeight="semiBold">Required from your client</Text>
                    <div className={styles.requirementItem}>
                      <Icon size={16} color="placeholder">
                        <IconMonitor />
                      </Icon>
                      <Text size="sm">Accounting platform</Text>
                    </div>
                    <div className={styles.requirementItem}>
                      <Icon size={16} color="placeholder">
                        <IconBank />
                      </Icon>
                      <Text size="sm">Bank account connection(s) — via Open Banking</Text>
                    </div>
                  </div>
                </div>
              </div>

              {/* Please complete section */}
              <div>
                <Text fontWeight="medium" className={styles.sectionLabel}>
                  Please complete the following items:
                </Text>
              </div>

              <div className={styles.actionItems}>
                {/* Customise indicative offer */}
                <div className={styles.actionCard}>
                  <Text fontWeight="medium">Customise indicative offer</Text>
                  <Button variant="Secondary">Configure</Button>
                </div>

                {/* Upload requirements */}
                <div className={styles.actionCard}>
                  <Text fontWeight="medium">Upload requirements</Text>
                  <Button variant="Secondary" onClick={onUpload}>Upload</Button>
                </div>

                {/* Generate secure invite link */}
                <div className={styles.inviteCard}>
                  <div>
                    <Text fontWeight="medium">Generate secure invite link</Text>
                    <Text color="placeholder" lineHeight="normal">
                      We need your client's email address so they can securely connect their bank account(s).
                      You'll get a shareable link on the next screen. We won't contact them directly about this deal.
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" fontWeight="medium">Their email address</Text>
                    <div style={{ marginTop: 6 }}>
                      <div className={styles.emailInputWrapper}>
                        <input
                          className={styles.emailInput}
                          type="email"
                          placeholder="Janedoe@gmail.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal checkbox */}
              <div className={styles.legalRow}>
                <input type="checkbox" className={styles.legalCheckbox} id="legal-accept" />
                <label htmlFor="legal-accept">
                  <Text size="xs" color="placeholder" lineHeight="normal">
                    By accepting, I acknowledge this offer and terms (including the proposed sell rate) are indicative
                    only and are not a binding commitment. All pricing, terms and sell rates are subject to full
                    underwriting, our internal policy limits and applicable regulatory requirements, and may change as a
                    result. I confirm I will share any outstanding required documents directly with my Wayflyer
                    relationship manager.
                  </Text>
                </label>
              </div>
            </div>

            {/* ── Right column ── */}
            <div className={styles.rightColumn}>
              {/* Application status */}
              <div className={styles.statusCard}>
                <div className={styles.statusCardHeader}>
                  <Text fontWeight="medium">Application status</Text>
                  <Icon size={16} color="placeholder">
                    <IconChevronRight />
                  </Icon>
                </div>
              </div>

              {/* Unable to provide documents */}
              <div className={styles.statusCard}>
                <div className={styles.statusCardBody}>
                  <Text fontWeight="semiBold">Unable to provide documents?</Text>
                  <Text color="placeholder" lineHeight="normal">
                    If you're missing or unable to provide any required documents, please get in touch with your
                    relationship manager or email us at:
                  </Text>
                  <Flex align="center" gap="1">
                    <Link>
                      <Text size="sm">brokersupport@wayflyer.com</Text>
                    </Link>
                    <Icon size={12} color="accent">
                      <IconExternalLink />
                    </Icon>
                  </Flex>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className={styles.actionBar}>
          <Button variant="Secondary">Back</Button>
          <Button variant="Primary">
            <Flex align="center" gap="2">
              Accept offer
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Flex>
          </Button>
        </div>
      </main>
    </div>
  );
};
