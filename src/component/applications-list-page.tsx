import { useState } from "react";
import { Logo } from "../flyui/Logo";
import { Text } from "../flyui/Text";
import styles from "./applications-list-page.module.css";

type StatusType = "warning" | "info" | "critical" | "closed" | "neutral";

type Deal = {
  date: string;
  isNew?: boolean;
  business: string;
  amount: string;
  stage: string;
  status: string;
  statusType: StatusType;
};

const deals: Deal[] = [
  { date: "March 10", isNew: true, business: "Electrolites Inc", amount: "£550,000", stage: "Indicative offer", status: "Waiting on broker", statusType: "warning" },
  { date: "March 8", business: "McBrewer", amount: "£150,000", stage: "Indicative offer", status: "In progress", statusType: "info" },
  { date: "March 5", business: "Epic Sounds", amount: "£150,000", stage: "Indicative offer", status: "Waiting on client", statusType: "warning" },
  { date: "March 1", business: "TeddyCore AI", amount: "Pending", stage: "Underwriting", status: "Waiting on client", statusType: "warning" },
  { date: "Feb 23", business: "Villa Estrella", amount: "£240,000", stage: "Business Verification", status: "Failed", statusType: "critical" },
  { date: "Feb 10", business: "House Of Ollie", amount: "Pending", stage: "Underwriting", status: "Waiting on client", statusType: "warning" },
  { date: "Feb 5", business: "Whipped & Folded", amount: "£800,000", stage: "Business Verification", status: "Waiting on client", statusType: "warning" },
  { date: "Jan 28", business: "Wooden Toy Co.", amount: "£450,000", stage: "Contracts", status: "In progress", statusType: "info" },
  { date: "Jan 22", business: "Printwork Co.", amount: "£80,000", stage: "Funding", status: "In progress", statusType: "info" },
  { date: "Jan 19", business: "Club Pro Sports", amount: "£40,000", stage: "Funding", status: "In progress", statusType: "info" },
  { date: "Dec 12, 2024", business: "Elite Travel", amount: "£80,000", stage: "Indicative offer", status: "Closed", statusType: "closed" },
];

const statusDotColor: Record<StatusType, string> = {
  warning: "var(--palette-content-status-warning)",
  info: "var(--palette-content-status-info)",
  critical: "var(--palette-content-status-critical)",
  closed: "var(--palette-content-neutral-subtle)",
  neutral: "var(--palette-content-neutral-subtle)",
};

const IconSortUpDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.8, flexShrink: 0 }}>
    <path d="M4 5l2-2 2 2M4 7l2 2 2-2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconFilter = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M1.5 3h11M3.5 7h7M5.5 11h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M6 11A5 5 0 1 0 6 1a5 5 0 0 0 0 10zM13 13l-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const IconMoreVert = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="4" r="1.2" fill="currentColor" />
    <circle cx="9" cy="9" r="1.2" fill="currentColor" />
    <circle cx="9" cy="14" r="1.2" fill="currentColor" />
  </svg>
);

const IconInfo = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.25" />
    <path d="M6 5.5v3M6 3.5h.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

const IconDollar = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1v12M4.5 3.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconDocument = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M8.5 1.5H3.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V5l-3-3.5z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 1.5V5H12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconLink = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5.5 8.5a3 3 0 0 0 4.243.0l1.414-1.414a3 3 0 0 0-4.243-4.243L6 3.757" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M8.5 5.5a3 3 0 0 0-4.243 0L2.843 6.914a3 3 0 0 0 4.243 4.243L8 10.243" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type ApplicationsListPageProps = {
  onSelectDeal?: () => void;
};

export const ApplicationsListPage = ({ onSelectDeal }: ApplicationsListPageProps) => {
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Logo type="app" />
        </div>
        <nav className={styles.sidebarMenu}>
          <div className={`${styles.navItem} ${styles.navItemActive}`}>
            <img src="/multiple-pages-empty.svg" alt="" width={20} height={20} className={styles.navItemIcon} />
            <span style={{ fontSize: "var(--typography-fontSize-sm)", fontWeight: 500, color: "inherit" }}>Applications</span>
          </div>
        </nav>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        {/* Top bar */}
        <div className={styles.topBar}>
          <div />
          <div className={styles.topBarRight}>
            <button className={styles.iconBtn} aria-label="Chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2.5 21.5l4.5-.838A9.96 9.96 0 0 0 12 22" />
              </svg>
            </button>
            <div className={styles.notificationWrapper}>
              <button className={styles.iconBtn} aria-label="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8.4c0-1.697-.632-3.325-1.757-4.525S13.59 2 12 2s-3.117.674-4.243 1.875C6.632 5.075 6 6.703 6 8.4 6 15.867 3 18 3 18h18s-3-2.133-3-9.6M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>
              <span className={styles.notificationDot} aria-hidden="true" />
            </div>
            <div className={styles.avatar}>
              <Text size="xs" fontWeight="medium" lineHeight="none">WD</Text>
            </div>
          </div>
        </div>

        {/* Content area with optional side panel */}
        <div className={styles.contentArea}>
          {/* Scrollable table content */}
          <div className={styles.container}>
            {/* Page heading */}
            <div className={styles.pageHeading}>
              <h1 className={styles.pageTitle}>Applications</h1>
              <button className={styles.startButton}>
                <IconPlus />
                Start an application
              </button>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <div className={`${styles.tab} ${styles.tabActive}`}>Active deals</div>
              <div className={styles.tab}>
                Review offers
                <span className={styles.tabCount}>1</span>
              </div>
              <div className={styles.tab}>
                Drafts
                <span className={styles.tabCount}>3</span>
              </div>
              <div className={styles.tab}>Inactive</div>
            </div>

            {/* Filter bar */}
            <div className={styles.filterBar}>
              <button className={styles.filtersBtn}>
                <IconFilter />
                Filters
                <span className={styles.filterCount}>3</span>
              </button>
              <div className={styles.searchWrapper}>
                <IconSearch />
                <input className={styles.searchInput} type="search" placeholder="Search business" />
              </div>
            </div>

            {/* Table */}
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <div className={`${styles.col} ${styles.colDate}`}>
                  <span>Created</span><IconSortUpDown />
                </div>
                <div className={`${styles.col} ${styles.colBusiness}`}>
                  <span>Business</span><IconSortUpDown />
                </div>
                <div className={`${styles.col} ${styles.colAmount} ${styles.colRight}`}>
                  <span>Amount</span><IconSortUpDown />
                </div>
                <div className={`${styles.col} ${styles.colStage}`}>
                  <span>Stage</span><IconSortUpDown />
                </div>
                <div className={`${styles.col} ${styles.colStatus}`}>
                  <span>Status</span><IconSortUpDown />
                </div>
              </div>

              {deals.map((deal) => {
                const isElectrolites = deal.business === "Electrolites Inc";
                const isSelected = isElectrolites && panelOpen;
                return (
                  <div
                    key={deal.business}
                    className={`${styles.tableRow} ${isSelected ? styles.tableRowSelected : ""}`}
                    onClick={() => isElectrolites && setPanelOpen(true)}
                    style={{ cursor: isElectrolites ? "pointer" : "default" }}
                  >
                    <div className={`${styles.col} ${styles.colDate}`}>
                      <span className={styles.cellText}>{deal.date}</span>
                      {deal.isNew && <span className={styles.newBadge}>New</span>}
                    </div>
                    <div className={`${styles.col} ${styles.colBusiness}`}>
                      <span className={styles.cellText}>{deal.business}</span>
                    </div>
                    <div className={`${styles.col} ${styles.colAmount} ${styles.colRight}`}>
                      <span className={styles.cellText}>{deal.amount}</span>
                    </div>
                    <div className={`${styles.col} ${styles.colStage}`}>
                      <span className={styles.cellText}>{deal.stage}</span>
                    </div>
                    <div className={`${styles.col} ${styles.colStatus}`}>
                      {deal.statusType === "critical" && deal.status === "Failed" ? (
                        <span className={styles.failedBadge}>{deal.status}</span>
                      ) : (
                        <span className={styles.statusBadge}>
                          <span className={styles.statusDot} style={{ backgroundColor: statusDotColor[deal.statusType] }} />
                          <span className={styles.cellText}>{deal.status}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side panel */}
          {panelOpen && (
            <aside className={styles.sidePanel}>
              {/* Panel header */}
              <div className={styles.panelHeader}>
                <button className={styles.panelIconBtn} onClick={() => setPanelOpen(false)} aria-label="Close">
                  <IconX />
                </button>
                <div className={styles.panelTitleBlock}>
                  <div className={styles.panelTitleRow}>
                    <span className={styles.panelTitle}>ElectroLites Inc.</span>
                    <span className={styles.waitingBadge}>
                      <span className={styles.waitingDot} />
                      Waiting on broker
                    </span>
                  </div>
                  <span className={styles.panelSubtitle}>Created March 10 ·</span>
                </div>
                <button className={styles.panelIconBtn} aria-label="More options">
                  <IconMoreVert />
                </button>
              </div>

              {/* Panel body */}
              <div className={styles.panelBody}>
                {/* Offer card */}
                <div className={styles.offerCard}>
                  <div className={styles.offerCardTop}>
                    <span className={styles.offerLabel}>Amount • Indicative</span>
                    <span className={styles.offerAmount}>£550,000</span>
                    <div className={styles.offerNote}>
                      <IconInfo />
                      <span>Subject to a full underwriting review.</span>
                    </div>
                  </div>
                  <div className={styles.offerTerms}>
                    {[
                      { label: "Term", value: "9 months" },
                      { label: "Wayflyer fee", value: "19%" },
                      { label: "Broker commission", value: "−" },
                      { label: "Total client fee", value: "−" },
                    ].map((item) => (
                      <div key={item.label} className={styles.offerTermItem}>
                        <span className={styles.offerTermLabel}>{item.label}</span>
                        <span className={styles.offerTermValue}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What we need */}
                <div className={styles.needsSection}>
                  <span className={styles.needsTitle}>What we need from you:</span>
                  <div className={styles.needsList}>
                    <div className={styles.needsItem}>
                      <IconDollar />
                      <span>Customise the indicative offer</span>
                    </div>
                    <div className={styles.needsItem}>
                      <IconDocument />
                      <span>Upload required documents</span>
                    </div>
                    <div className={styles.needsItem}>
                      <IconLink />
                      <span>Provide your clients email address to connect their bank account(s) &amp; platform(s)</span>
                    </div>
                  </div>
                </div>

                <hr className={styles.panelDivider} />

                {/* Application status */}
                <div className={styles.statusAccordion}>
                  <IconChevronRight />
                  <span className={styles.statusAccordionLabel}>Application status</span>
                </div>
              </div>

              {/* Panel footer */}
              <div className={styles.panelFooter}>
                <button className={styles.ctaButton} onClick={onSelectDeal}>
                  Continue with indicative offer
                </button>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};
