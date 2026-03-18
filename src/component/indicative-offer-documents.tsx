import { forwardRef, useEffect, useRef, useState } from "react";

import {
  IconCheck16Line,
  IconInfoCircle16Line,
  IconMoreVert16Line,
  IconSearch16Line,
  IconXmark16Line,
  IconBell20Line,
  IconChatBubbleEmpty20Line,
} from "../Icons";

import { Badge } from "../flyui/Badge";
import { Button, } from "../flyui/Button";
import { Flex } from "../flyui/Flex";
import { Heading } from "../flyui/Heading";
import { Icon } from "../flyui/Icon";
import { Link } from "../flyui/Link";
import { Logo } from "../flyui/Logo";
import { Text } from "../flyui/Text";
import { UploadArea } from "../flyui/UploadArea";
import { IconButton } from "../flyui/IconButton";

import styles from "./indicative-offer-documents.module.css";

// Static asset paths (served from /public)
const uploadIllustration = "/upload-illustration.svg";
const arrowRightSvg = "/arrow-right.svg";
const warningCircleSvg = "/warning-circle.svg";
const multiplePagesSvg = "/multiple-pages-empty.svg";

// Adapter so the custom SVG URL satisfies the icon contract
const ArrowRightIcon = forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>(
  (_props, _ref) => <img src={arrowRightSvg} alt="" width={24} height={24} />,
) as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>;

// ─── Types ────────────────────────────────────────────────

export type DocumentRow = {
  id: string;
  name: string;
  status: "awaiting" | "uploaded" | "processing" | "awaiting-connection" | "not-applicable";
  fileName?: string;
  hasMenu?: boolean;
  connectionSubtext?: string;
};

type UncategorizedFile = {
  id: string;
  fileName: string;
  assignedCategory?: string;
};

type Toast = { type: "error" | "success"; message: string };

type Status = "neutral" | "positive" | "info" | "warning" | "critical";

export type IndicativeOfferDocumentsProps = {
  companyName?: string;
  onNavigateToApplications?: () => void;
  onNavigateToCompany?: () => void;
  onConfirm?: () => void;
  onFilesAdded?: (files: File[]) => void;
  onSimulateRefresh?: () => void;
  documents?: DocumentRow[];
  userInitials?: string;
};

// ─── Constants ────────────────────────────────────────────

const TOTAL_DURATION_MS = 10_000;
const TICK_MS = 50;

type UploadPhase = "uploading" | "verifying" | "categorising" | "matching";

const PHASE_LABEL: Record<UploadPhase, string> = {
  uploading: "Uploading...",
  verifying: "Verifying...",
  categorising: "Categorising...",
  matching: "Matching...",
};

const BADGE_STATUS: Record<DocumentRow["status"], Status> = {
  awaiting: "neutral",
  uploaded: "positive",
  processing: "info",
  "awaiting-connection": "info",
  "not-applicable": "neutral",
};

const BADGE_LABEL: Record<DocumentRow["status"], string> = {
  awaiting: "Awaiting upload",
  uploaded: "Uploaded",
  processing: "Processing",
  "awaiting-connection": "Client to connect",
  "not-applicable": "Not applicable",
};

const ASSIGN_OPTIONS = [
  "12 months P&L and Balance Sheet",
  "AR/AP Report",
  "Bank statement",
  "Debt Agreements",
  "IRS Form 8821 (Wet Signed)",
  "Other",
  "Personal Financial Statement",
  "Tax returns",
];

const BROKER_ROW_IDS = new Set(["1", "4", "5"]);

const OPTION_TO_DOC_ID: Partial<Record<string, string>> = {
  "12 months P&L and Balance Sheet": "6",
  "Tax returns": "1",
  "IRS Form 8821 (Wet Signed)": "2",
  "AR/AP Report": "4",
  "Debt Agreements": "5",
};

const DOC_ID_TO_OPTION: Record<string, string> = Object.fromEntries(
  Object.entries(OPTION_TO_DOC_ID).map(([opt, id]) => [id!, opt])
);

const defaultDocuments: DocumentRow[] = [
  { id: "1", name: "Tax returns", status: "awaiting" },
  { id: "4", name: "AR/AP Report (required if trades on terms)", status: "awaiting", hasMenu: true },
  { id: "5", name: "Debt Agreements (required if existing debt)", status: "awaiting", hasMenu: true },
  {
    id: "6",
    name: "Accounting platform",
    status: "awaiting-connection",
    hasMenu: true,
    connectionSubtext: "your client connects their platform",
  },
  {
    id: "7",
    name: "Bank account connection (Plaid)",
    status: "awaiting-connection",
    hasMenu: false,
    connectionSubtext: "your client connects bank",
  },
];

// ─── Component ────────────────────────────────────────────

export const IndicativeOfferDocuments = ({
  companyName = "Electrolites Inc.",
  onNavigateToApplications,
  onNavigateToCompany,
  onConfirm,
  onFilesAdded,
  onSimulateRefresh,
  documents: documentsProp = defaultDocuments,
  userInitials = "WD",
}: IndicativeOfferDocumentsProps) => {
  const [docs, setDocs] = useState<DocumentRow[]>(documentsProp);

  const [uploadPhase, setUploadPhase] = useState<UploadPhase | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [uncategorizedFiles, setUncategorizedFiles] = useState<UncategorizedFile[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownQuery, setDropdownQuery] = useState("");

  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showRequirementsError, setShowRequirementsError] = useState(false);
  const [showOtherError, setShowOtherError] = useState(false);
  const requirementsErrorRef = useRef<HTMLDivElement>(null);
  const otherErrorRef = useRef<HTMLDivElement>(null);

  const otherSectionRef = useRef<HTMLElement>(null);
  const brokerSectionRef = useRef<HTMLElement>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounterRef = useRef(0);
  const uploadSectionRef = useRef<HTMLElement>(null);

  // Scroll the inner content container directly — avoids browser picking window as scroll target
  const scrollToSection = (sectionRef: React.RefObject<HTMLElement | null>) => {
    const container = contentScrollRef.current;
    const section = sectionRef.current;
    if (!container || !section) return;
    const containerRect = container.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const scrollTop = container.scrollTop + sectionRect.top - containerRect.top - 8;
    container.scrollTo({ top: scrollTop, behavior: "smooth" });
  };

  useEffect(() => {
    if (toast?.type !== "success") return;
    toastTimerRef.current = setTimeout(() => {
      setToast((prev) => {
        if (prev?.type !== "success") return prev;
        const unassigned = uncategorizedFiles.filter((f) => !f.assignedCategory);
        if (unassigned.length === 0) return null;
        const n = unassigned.length;
        return {
          type: "error",
          message: `${n} file${n > 1 ? "s are" : " is"} missing a category. Please assign them to continue.`,
        };
      });
    }, 4000);
    return () => {
      if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current);
    };
  }, [toast, uncategorizedFiles]);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
      if (toastTimerRef.current !== null) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const startBatchSimulation = (fileNames: string[]) => {
    // Capture at drop time — determines which Balance_Sheet scenario applies
    const isManualPnLAtStart = isManualPnL;

    setUploadProgress(0);
    setUploadPhase("uploading");

    const startTime = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / TOTAL_DURATION_MS) * 100, 100);

      setUploadProgress(progress);

      if (elapsed < 2_000) {
        setUploadPhase("uploading");
      } else if (elapsed < 5_000) {
        setUploadPhase("verifying");
      } else if (elapsed < 8_000) {
        setUploadPhase("categorising");
      } else {
        setUploadPhase("matching");
      }

      if (elapsed >= TOTAL_DURATION_MS) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setUploadPhase(null);
        setUploadProgress(0);

        const ocrFiles = fileNames.filter((f) => f === "Unknown.pdf" || f === "PFSPhoto.pdf");
        const balanceSheetFile = fileNames.find((f) => f === "Balance_Sheet.xlsx") ?? null;
        const processableFiles = fileNames.filter((f) => f !== "Unknown.pdf" && f !== "PFSPhoto.pdf" && f !== "Balance_Sheet.xlsx");
        let lastTargetId: string | null = null;

        setDocs((prev) => {
          let next = [...prev];

          // Determine which doc row a filename should match
          const getTargetRowName = (fileName: string): string | null => {
            const lower = fileName.toLowerCase();
            if (lower.includes("tax return")) return "Tax returns";
            if (lower.includes("debt agreement")) return "Debt Agreements (required if existing debt)";
            if (lower.includes("ar_ap") || lower.includes("ar/ap") || lower.includes("arap") || lower === "scan.pdf") return "AR/AP Report (required if trades on terms)";
            return null;
          };

          processableFiles.forEach((fileName, fileIdx) => {
            const targetRowName = getTargetRowName(fileName);

            if (targetRowName) {
              // Try to find an awaiting row with that exact name
              const awaitingIdx = next.findIndex((d) => d.name === targetRowName && d.status === "awaiting");
              if (awaitingIdx !== -1) {
                lastTargetId = next[awaitingIdx].id;
                const tid = lastTargetId;
                next = next.map((d) => (d.id === tid ? { ...d, status: "uploaded" as const, fileName } : d));
              } else {
                // Row already uploaded — insert a duplicate after the last matching row
                let lastMatchIdx = -1;
                next.forEach((d, i) => { if (d.name === targetRowName) lastMatchIdx = i; });
                if (lastMatchIdx !== -1) {
                  const newId = `dup-${Date.now()}-${fileIdx}`;
                  lastTargetId = newId;
                  const clone: DocumentRow = { ...next[lastMatchIdx], id: newId, status: "uploaded" as const, fileName };
                  next = [...next.slice(0, lastMatchIdx + 1), clone, ...next.slice(lastMatchIdx + 1)];
                }
              }
            } else {
              // Fallback: fill first available awaiting slot
              const idx = next.findIndex((d) => d.status === "awaiting");
              if (idx !== -1) {
                lastTargetId = next[idx].id;
                next = next.map((d, i) =>
                  i === idx ? { ...d, status: "uploaded" as const, fileName } : (d as DocumentRow)
                );
              }
            }
          });
          return next;
        });

        ocrFiles.forEach((fileName, ocrIdx) => {
          const newId = `u-${Date.now()}-${ocrIdx}`;
          setUncategorizedFiles((prev) => [...prev, { id: newId, fileName }]);
          setOpenDropdownId(newId);
          setDropdownQuery("");
          setTimeout(() => {
            scrollToSection(otherSectionRef);
            setHighlightedId(newId);
            setTimeout(() => setHighlightedId(null), 1500);
          }, 50);
        });

        if (balanceSheetFile) {
          if (!isManualPnLAtStart) {
            // Scenario 1: client connection mode → switch to manual and upload
            setIsManualPnL(true);
            setDocs((prev) =>
              prev.map((d) =>
                d.id === "6"
                  ? { ...d, status: "uploaded" as const, fileName: balanceSheetFile }
                  : d
              )
            );
            setToast({
              type: "success",
              message: "12-month P&L recognised. Client accounting connection is no longer required.",
            });
          } else {
            // Scenario 2: already manual mode → just upload
            setDocs((prev) =>
              prev.map((d) =>
                d.id === "6"
                  ? { ...d, status: "uploaded" as const, fileName: balanceSheetFile }
                  : d
              )
            );
          }
        }

        onFilesAdded?.(fileNames.map((name) => new File([], name)));

        if (lastTargetId && ocrFiles.length === 0) {
          setHighlightedId(lastTargetId);
          setTimeout(() => setHighlightedId(null), 1500);
        }
        if (ocrFiles.length === 0) {
          setTimeout(() => scrollToSection(brokerSectionRef), 100);
        }
      }
    }, TICK_MS);
  };

  useEffect(() => {
    const onDragEnter = (e: DragEvent) => {
      if (!e.dataTransfer?.types.includes("Files")) return;
      e.preventDefault();
      dragCounterRef.current++;
      setIsDraggingOver(true);
    };
    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current--;
      if (dragCounterRef.current <= 0) {
        dragCounterRef.current = 0;
        setIsDraggingOver(false);
      }
    };
    const onDragOver = (e: DragEvent) => e.preventDefault();
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length === 0 || timerRef.current !== null) return;
      startBatchSimulation(files.map((f) => f.name));
      setTimeout(() => scrollToSection(uploadSectionRef), 50);
    };

    window.addEventListener("dragenter", onDragEnter);
    window.addEventListener("dragleave", onDragLeave);
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onDragEnter);
      window.removeEventListener("dragleave", onDragLeave);
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilesAdded = (files: File[]) => {
    if (files.length === 0 || uploadPhase !== null) return;
    startBatchSimulation(files.map((f) => f.name));
  };

  const assignCategory = (fileId: string, fileName: string, category: string) => {
    const docId = OPTION_TO_DOC_ID[category];

    if (docId) {
      setDocs((prev) => prev.map((d) => (d.id === docId ? { ...d, status: "uploaded" as const, fileName } : d)));
      setUncategorizedFiles((prev) => {
        const next = prev.filter((f) => f.id !== fileId);
        const nextUnassigned = next.find((f) => !f.assignedCategory);
        setOpenDropdownId(nextUnassigned?.id ?? null);
        return next;
      });
    } else {
      setUncategorizedFiles((prev) => {
        const next = prev.map((f) => (f.id === fileId ? { ...f, assignedCategory: category } : f));
        const nextUnassigned = next.find((f) => !f.assignedCategory);
        setOpenDropdownId(nextUnassigned?.id ?? null);
        return next;
      });
    }

    setDropdownQuery("");
    setToast({ type: "success", message: `"${fileName}" has been successfully assigned.` });
  };

  const [activeModalType, setActiveModalType] = useState<"connection" | "manual" | "bank" | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isManualPnL, setIsManualPnL] = useState(false);

  const switchToManual = () => {
    setIsManualPnL(true);
    setOpenMenuId(null);
    setDocs((prev) => prev.map((d) => (d.id === "6" ? { ...d, status: "awaiting" as const } : d)));
  };

  const switchToConnection = () => {
    setIsManualPnL(false);
    setActiveModalType(null);
    setOpenMenuId(null);
    setDocs((prev) =>
      prev.map((d) => (d.id === "6" ? { ...d, status: "awaiting-connection" as const, fileName: undefined } : d))
    );
  };

  const [reassigningRowId, setReassigningRowId] = useState<string | null>(null);
  const [reassignQuery, setReassignQuery] = useState("");

  const deleteFile = (id: string) => {
    const doc = docs.find((d) => d.id === id);
    const isTaxReturns = doc?.name === "Tax returns";
    const taxReturnCount = isTaxReturns ? docs.filter((d) => d.name === "Tax returns").length : 0;
    const isDupRow = id.startsWith("dup-");

    if ((isTaxReturns && taxReturnCount > 1) || isDupRow) {
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } else {
      setDocs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "awaiting" as const, fileName: undefined } : d))
      );
    }
    setOpenMenuId(null);
    if (doc?.fileName) {
      setToast({ type: "success", message: `"${doc.fileName}" has been deleted.` });
    }
  };

  const startReassign = (id: string) => {
    setOpenMenuId(null);
    setReassigningRowId(id);
    setReassignQuery("");
  };

  const reassignCategory = (rowId: string, fileName: string, category: string) => {
    const rowDoc = docs.find((d) => d.id === rowId);
    const isTaxClone = rowDoc?.name === "Tax returns" && docs.filter((d) => d.name === "Tax returns").length > 1;
    const isDupRow = rowId.startsWith("dup-");
    const docId = OPTION_TO_DOC_ID[category];

    if (isTaxClone || isDupRow) {
      if (docId) {
        setDocs((prev) =>
          prev
            .filter((d) => d.id !== rowId)
            .map((d) => (d.id === docId ? { ...d, status: "uploaded" as const, fileName } : d))
        );
      } else {
        setDocs((prev) => prev.filter((d) => d.id !== rowId));
        const newId = `u-${Date.now()}`;
        setUncategorizedFiles((prev) => [...prev, { id: newId, fileName, assignedCategory: category }]);
      }
    } else if (docId) {
      setDocs((prev) =>
        prev.map((d) => {
          if (d.id === rowId) return { ...d, status: "awaiting" as const, fileName: undefined };
          if (d.id === docId) return { ...d, status: "uploaded" as const, fileName };
          return d;
        })
      );
    } else {
      setDocs((prev) =>
        prev.map((d) => (d.id === rowId ? { ...d, status: "awaiting" as const, fileName: undefined } : d))
      );
      const newId = `u-${Date.now()}`;
      setUncategorizedFiles((prev) => [...prev, { id: newId, fileName, assignedCategory: category }]);
    }

    setReassigningRowId(null);
    setReassignQuery("");
  };

  const markAsNotApplicable = (id: string) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, status: "not-applicable" as const } : d)));
    setOpenMenuId(null);
  };

  const markAsRequired = (id: string) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, status: "awaiting" as const } : d)));
    setOpenMenuId(null);
  };

  const sortedDocs = [
    ...docs.filter((d) => d.status !== "not-applicable"),
    ...docs.filter((d) => d.status === "not-applicable"),
  ];

  const brokerDocs = sortedDocs.filter(
    (d) => BROKER_ROW_IDS.has(d.id) || d.id.startsWith("tr-") || d.id.startsWith("dup-") || (d.id === "6" && isManualPnL)
  );
  const clientDocs = sortedDocs.filter((d) => d.id === "7" || (d.id === "6" && !isManualPnL));

  const isLoading = uploadPhase !== null;
  const brokerRequiredDocs = brokerDocs.filter((d) => d.status !== "not-applicable");
  const brokerUploadedCount = brokerRequiredDocs.filter((d) => d.status === "uploaded").length;
  const brokerTotalCount = brokerRequiredDocs.length;

  const hasOtherFiles = uncategorizedFiles.length > 0;

  useEffect(() => {
    if (!showRequirementsError) return;
    const hasBlocking = docs.some((d) => d.status === "awaiting");
    if (!hasBlocking) setShowRequirementsError(false);
  }, [docs, showRequirementsError]);

  useEffect(() => {
    if (!showOtherError) return;
    const hasUnassigned = uncategorizedFiles.some((f) => !f.assignedCategory);
    if (!hasUnassigned) setShowOtherError(false);
  }, [uncategorizedFiles, showOtherError]);

  const handleConfirm = () => {
    const hasBlockingRows = docs.some((d) => d.status === "awaiting");
    const hasUnassignedFiles = uncategorizedFiles.some((f) => !f.assignedCategory);

    if (hasBlockingRows) setShowRequirementsError(true);
    if (hasUnassignedFiles) {
      setShowOtherError(true);
      setOpenDropdownId(null);
    }

    if (hasBlockingRows || hasUnassignedFiles) {
      setTimeout(() => {
        const container = contentScrollRef.current;
        const target = hasOtherFiles && hasUnassignedFiles ? otherErrorRef.current : requirementsErrorRef.current;
        if (container && target) {
          const containerRect = container.getBoundingClientRect();
          const targetRect = target.getBoundingClientRect();
          container.scrollTo({ top: container.scrollTop + targetRect.top - containerRect.top - 100, behavior: "smooth" });
        }
      }, 0);
      return;
    }

    onConfirm?.();
  };

  return (
    <div
      className={reassigningRowId ? `${styles.page} ${styles.pageReassigning}` : styles.page}
      onClick={() => {
        setOpenMenuId(null);
        setOpenDropdownId(null);
        setReassigningRowId(null);
      }}
    >
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoWrapper}>
            <Logo type="app" />
          </div>
        </div>
        <nav className={styles.sidebarMenu}>
          <div className={`${styles.navItem} ${styles.navItemActive}`}>
            <img src={multiplePagesSvg} alt="" width={20} height={20} className={styles.navItemIcon} />
            <Text size="sm" fontWeight="medium" className={styles.navItemText}>
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
            <button onClick={onSimulateRefresh} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0 12px", height: 32, border: "1px solid var(--palette-border-neutral-subtle)", borderRadius: 9999, background: "transparent", fontSize: "var(--typography-fontSize-xs)", fontWeight: 500, color: "var(--palette-content-neutral-subtle)", cursor: "pointer", whiteSpace: "nowrap" }}>
              🔄 Simulate Refresh
            </button>
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
          <Flex gap="2" align="center">
            <Link onClick={onNavigateToApplications}>
              <Text size="2xl" fontWeight="semiBold" color="placeholder" lineHeight="none">
                Applications
              </Text>
            </Link>
            <Text size="2xl" color="placeholder" element="span" lineHeight="none">
              /
            </Text>
            <Link onClick={onNavigateToCompany}>
              <Text size="2xl" fontWeight="semiBold" color="placeholder" lineHeight="none">
                {companyName}
              </Text>
            </Link>
            <Text size="2xl" color="placeholder" element="span" lineHeight="none">
              /
            </Text>
            <Text size="2xl" fontWeight="semiBold" lineHeight="none">
              Application requirements
            </Text>
          </Flex>
        </div>

        {/* Scrollable content */}
        <div ref={contentScrollRef} className={styles.contentScroll}>
          <div className={styles.contentInner}>

            {/* Other triage section */}
            {hasOtherFiles && (
              <section ref={otherSectionRef} className={styles.tableSection}>
                <Heading size="base">Other</Heading>

                <div className={styles.tableHeader} role="row">
                  <Text size="sm" fontWeight="medium">Type</Text>
                  <Text size="sm" fontWeight="medium">Status</Text>
                  <Text size="sm" fontWeight="medium">File</Text>
                  <div />
                </div>

                {uncategorizedFiles.map((file) => {
                  const isCategorized = Boolean(file.assignedCategory);
                  const isDropdownOpen = openDropdownId === file.id;
                  const filtered = ASSIGN_OPTIONS.filter((opt) =>
                    opt.toLowerCase().includes(dropdownQuery.toLowerCase())
                  );

                  return (
                    <div
                      key={file.id}
                      className={
                        highlightedId === file.id ? `${styles.tableRow} ${styles.tableRowHighlighted}` : styles.tableRow
                      }
                      role="row"
                    >
                      <div className={styles.typeCell} onClick={(e) => e.stopPropagation()}>
                        {isCategorized ? (
                          <Text size="sm">{file.assignedCategory}</Text>
                        ) : (
                          <div className={styles.assignInputWrapper}>
                            <span className={styles.assignInputIcon}>
                              <Icon size={16} color="placeholder">
                                <IconSearch16Line />
                              </Icon>
                            </span>
                            <input
                              className={styles.assignInput}
                              placeholder="Assign document type"
                              value={dropdownQuery}
                              autoFocus={isDropdownOpen}
                              onFocus={() => {
                                setOpenDropdownId(file.id);
                                setDropdownQuery("");
                              }}
                              onChange={(e) => {
                                setOpenDropdownId(file.id);
                                setDropdownQuery(e.target.value);
                              }}
                            />
                            {isDropdownOpen && (
                              <div className={styles.assignDropdown} role="listbox">
                                {filtered.map((opt) => (
                                  <button
                                    key={opt}
                                    className={styles.assignDropdownItem}
                                    role="option"
                                    aria-selected={false}
                                    onClick={() => assignCategory(file.id, file.fileName, opt)}
                                  >
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <Badge
                          content={isCategorized ? "Uploaded" : "Needs review"}
                          status={isCategorized ? "positive" : "warning"}
                          hideDot
                        />
                      </div>

                      <Text size="sm">{file.fileName}</Text>

                      <div className={styles.menuCell}>
                        <div className={styles.menuCellRelative} onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            variant="Tertiary"
                            size="auto"
                            Icon={IconMoreVert16Line}
                            accessibilityLabel="More options"
                            onClick={() => setOpenMenuId(openMenuId === file.id ? null : file.id)}
                          />
                          {openMenuId === file.id && (
                            <div className={styles.popover} role="menu">
                              <button
                                className={styles.popoverItem}
                                role="menuitem"
                                onClick={() => {
                                  setUncategorizedFiles((prev) =>
                                    prev.map((f) => (f.id === file.id ? { ...f, assignedCategory: undefined } : f))
                                  );
                                  setOpenDropdownId(file.id);
                                  setDropdownQuery("");
                                  setOpenMenuId(null);
                                }}
                              >
                                Reassign document type
                              </button>
                              <button
                                className={`${styles.popoverItem} ${styles.popoverItemDanger}`}
                                role="menuitem"
                                onClick={() => {
                                  setUncategorizedFiles((prev) => prev.filter((f) => f.id !== file.id));
                                  setOpenMenuId(null);
                                  setToast({ type: "success", message: `"${file.fileName}" has been deleted.` });
                                }}
                              >
                                Delete file
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {showOtherError && (
                  <div ref={otherErrorRef} className={styles.validationError}>
                    <img src={warningCircleSvg} alt="" width={12} height={12} className={styles.validationErrorIcon} />
                    <span className={styles.validationErrorText}>
                      Please assign a category to these documents in order to proceed with the application.
                    </span>
                  </div>
                )}
              </section>
            )}

            {/* Table 1: Required from you */}
            <section ref={brokerSectionRef} className={styles.tableSection}>
              <Heading size="base">Required from you</Heading>

              <div className={styles.tableHeader} role="row">
                <Text size="sm" fontWeight="medium">Type</Text>
                <Text size="sm" fontWeight="medium">Status</Text>
                <Text size="sm" fontWeight="medium">File</Text>
                <div />
              </div>

              {brokerDocs.map((doc) => {
                const isNA = doc.status === "not-applicable";
                const isReassigning = reassigningRowId === doc.id;
                const showMenuForUploaded = doc.status === "uploaded" && doc.id !== "6";
                const showMenuForOtherStates = doc.hasMenu && doc.id !== "6" && (doc.status === "awaiting" || isNA);
                const showMenuForPnLManual = doc.id === "6" && isManualPnL;
                const showPopover = showMenuForUploaded || showMenuForOtherStates || showMenuForPnLManual;
                const displayStatus = doc.id === "6" && isManualPnL && doc.status !== "uploaded" ? ("awaiting" as const) : doc.status;
                const reassignFiltered = ASSIGN_OPTIONS.filter((opt) =>
                  opt.toLowerCase().includes(reassignQuery.toLowerCase())
                );

                return (
                  <div
                    key={doc.id}
                    className={[
                      styles.tableRow,
                      isReassigning ? styles.tableRowReassigning : "",
                      highlightedId === doc.id ? styles.tableRowHighlighted : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    role="row"
                  >
                    <div
                      className={isNA ? styles.typeCellMuted : styles.typeCell}
                      onClick={isReassigning ? (e) => e.stopPropagation() : undefined}
                    >
                      {isReassigning ? (
                        <div className={`${styles.assignInputWrapper} ${styles.reassignInputWrapper}`}>
                          <span className={styles.assignInputIcon}>
                            <Icon size={16} color="placeholder">
                              <IconSearch16Line />
                            </Icon>
                          </span>
                          <input
                            className={styles.assignInput}
                            placeholder="Reassign document type"
                            value={reassignQuery}
                            autoFocus
                            onChange={(e) => setReassignQuery(e.target.value)}
                          />
                          <div className={styles.assignDropdown} role="listbox">
                            {reassignFiltered.map((opt) => {
                              const isCurrentCategory = DOC_ID_TO_OPTION[doc.id] === opt;
                              return (
                                <button
                                  key={opt}
                                  className={styles.assignDropdownItem}
                                  role="option"
                                  aria-selected={isCurrentCategory}
                                  onClick={() => reassignCategory(doc.id, doc.fileName!, opt)}
                                >
                                  {opt}
                                  {isCurrentCategory && (
                                    <span className={styles.dropdownItemCheck}>
                                      <Icon size={16} color="default">
                                        <IconCheck16Line />
                                      </Icon>
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <>
                          <Text size="sm">
                            {doc.id === "6" && isManualPnL
                              ? "12 months P&L and balance sheet (Excel)"
                              : doc.name}
                          </Text>
                          {doc.id === "6" && isManualPnL && (
                            <p className={styles.typeSubtext}>
                              <Link className={styles.typeSubtextLink} onClick={() => setActiveModalType("manual")}>
                                Learn how
                              </Link>
                              <span className={styles.typeSubtextGrey}> to get a faster underwriting result</span>
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div>
                      <Badge content={BADGE_LABEL[displayStatus]} status={BADGE_STATUS[displayStatus]} hideDot />
                    </div>
                    <Text size="sm" color={doc.fileName ? "default" : "placeholder"}>
                      {doc.fileName ?? "-"}
                    </Text>
                    <div className={styles.menuCell}>
                      {showPopover && (
                        <div className={styles.menuCellRelative} onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            variant="Tertiary"
                            size="auto"
                            Icon={IconMoreVert16Line}
                            accessibilityLabel="More options"
                            onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                          />
                          {openMenuId === doc.id && (
                            <div className={styles.popover} role="menu">
                              {showMenuForPnLManual && doc.status === "uploaded" ? (
                                <>
                                  <button
                                    className={styles.popoverItem}
                                    role="menuitem"
                                    onClick={() => startReassign(doc.id)}
                                  >
                                    Reassign document type
                                  </button>
                                  <button className={styles.popoverItem} role="menuitem" onClick={switchToConnection}>
                                    Client to connect
                                  </button>
                                  <button
                                    className={`${styles.popoverItem} ${styles.popoverItemDanger}`}
                                    role="menuitem"
                                    onClick={() => deleteFile(doc.id)}
                                  >
                                    Delete file
                                  </button>
                                </>
                              ) : showMenuForPnLManual ? (
                                <button className={styles.popoverItem} role="menuitem" onClick={switchToConnection}>
                                  Client to connect
                                </button>
                              ) : doc.status === "uploaded" ? (
                                <>
                                  <button
                                    className={styles.popoverItem}
                                    role="menuitem"
                                    onClick={() => startReassign(doc.id)}
                                  >
                                    Reassign document type
                                  </button>
                                  <button
                                    className={styles.popoverItem}
                                    role="menuitem"
                                    onClick={() => {
                                      setDocs((prev) => prev.map((d) => d.id === doc.id ? { ...d, status: "not-applicable" as const, fileName: undefined } : d));
                                      setOpenMenuId(null);
                                    }}
                                  >
                                    Mark as not applicable
                                  </button>
                                  <button
                                    className={`${styles.popoverItem} ${styles.popoverItemDanger}`}
                                    role="menuitem"
                                    onClick={() => deleteFile(doc.id)}
                                  >
                                    Delete file
                                  </button>
                                </>
                              ) : (
                                <button
                                  className={styles.popoverItem}
                                  role="menuitem"
                                  onClick={() => (isNA ? markAsRequired(doc.id) : markAsNotApplicable(doc.id))}
                                >
                                  {isNA ? "Mark as required" : "Mark as not applicable"}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {showRequirementsError && (
                <div ref={requirementsErrorRef} className={styles.validationError}>
                  <img src={warningCircleSvg} alt="" width={12} height={12} className={styles.validationErrorIcon} />
                  <span className={styles.validationErrorText}>
                    Please upload all required documents in order to proceed with the application.
                  </span>
                </div>
              )}
            </section>

            {/* Table 2: Required from your client */}
            <section className={styles.tableSection}>
              <Heading size="base">Required from your client</Heading>

              <div className={styles.tableHeader} role="row">
                <Text size="sm" fontWeight="medium">Type</Text>
                <Text size="sm" fontWeight="medium">Status</Text>
                <div />
                <div />
              </div>

              {clientDocs.map((doc) => {
                const showMenuForPnLConnection = doc.id === "6" && doc.status === "awaiting-connection";
                const showPopover = showMenuForPnLConnection;
                // Never show "uploaded" in the client section — if the row is being moved to broker
                // section the state update will handle it, but guard defensively here too
                const clientDisplayStatus = doc.status === "uploaded" ? ("awaiting-connection" as const) : doc.status;

                return (
                  <div
                    key={doc.id}
                    className={[styles.tableRow, highlightedId === doc.id ? styles.tableRowHighlighted : ""]
                      .filter(Boolean)
                      .join(" ")}
                    role="row"
                  >
                    <div className={styles.typeCell}>
                      <Text size="sm">{doc.name}</Text>
                      {doc.connectionSubtext && (
                        <p className={styles.typeSubtext}>
                          <Link
                            className={styles.typeSubtextLink}
                            onClick={
                              doc.id === "6" ? () => setActiveModalType("connection") : () => setActiveModalType("bank")
                            }
                          >
                            Learn how
                          </Link>
                          <span className={styles.typeSubtextGrey}>{` ${doc.connectionSubtext}`}</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <Badge content={BADGE_LABEL[clientDisplayStatus]} status={BADGE_STATUS[clientDisplayStatus]} hideDot />
                    </div>
                    <div />
                    <div className={styles.menuCell}>
                      {showPopover && (
                        <div className={styles.menuCellRelative} onClick={(e) => e.stopPropagation()}>
                          <IconButton
                            variant="Tertiary"
                            size="auto"
                            Icon={IconMoreVert16Line}
                            accessibilityLabel="More options"
                            onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                          />
                          {openMenuId === doc.id && (
                            <div className={styles.popover} role="menu">
                              <button className={styles.popoverItem} role="menuitem" onClick={switchToManual}>
                                Upload file manually
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* File upload */}
            <section ref={uploadSectionRef} className={styles.uploadSection}>
              <div>
                <Heading size="base">File upload</Heading>
                <Text size="sm" color="placeholder">
                  Max file size is 10MB and supports .pdf and .xlsx.
                </Text>
              </div>

              {isLoading ? (
                <div className={styles.loadingDropZone} aria-live="polite">
                  <div className={styles.progressBarContainer}>
                    <div className={styles.progressBarPill}>
                      <div className={styles.progressBarTrack}>
                        <div
                          className={styles.progressBarFill}
                          style={{ width: `${uploadProgress}%` }}
                          role="progressbar"
                          aria-valuenow={Math.round(uploadProgress)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                    <Text size="sm" color="placeholder" align="center">
                      {PHASE_LABEL[uploadPhase!]}
                    </Text>
                  </div>
                </div>
              ) : (
                <UploadArea
                  onFilesAdded={handleFilesAdded}
                  acceptedFileTypes={{
                    "application/pdf": [".pdf"],
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
                  }}
                  sizeLimitMB={10}
                />
              )}
            </section>
          </div>
        </div>

        {/* Action bar */}
        <div className={styles.actionBar}>
          <Text size="base" color="default">
            {brokerUploadedCount} of {brokerTotalCount} broker requirements met
          </Text>
          <Button variant="Primary" onClick={handleConfirm} iconRight={ArrowRightIcon}>
            Confirm documents
          </Button>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={toast.type === "error" ? styles.toastError : styles.toastSuccess}
            role="status"
            aria-live="polite"
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.toastIcon}>
              <Icon size={16} color="onDark">
                <IconInfoCircle16Line />
              </Icon>
            </span>
            <Text size="sm" color="onDark" lineHeight="normal">
              {toast.message}
            </Text>
            <button className={styles.toastDismiss} aria-label="Dismiss notification" onClick={() => setToast(null)}>
              <Icon size={16} color="onDark">
                <IconXmark16Line />
              </Icon>
            </button>
          </div>
        )}
      </main>

      {/* P&L modal */}
      {(activeModalType === "connection" || activeModalType === "manual") && (
        <div
          className={styles.modalOverlay}
          onClick={() => setActiveModalType(null)}
          aria-modal="true"
          role="dialog"
          aria-labelledby="pnl-modal-title"
        >
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <Text id="pnl-modal-title" size="lg" fontWeight="semiBold" lineHeight="tight">
                {activeModalType === "manual"
                  ? "A quicker way to share your client\u2019s financials"
                  : "Accounting platform"}
              </Text>
              <IconButton
                variant="Secondary"
                size="auto"
                Icon={IconXmark16Line}
                accessibilityLabel="Close"
                onClick={() => setActiveModalType(null)}
              />
            </div>

            {activeModalType === "connection" ? (
              <>
                <div className={styles.modalContent}>
                  <div className={styles.modalSection}>
                    <Text size="base" fontWeight="semiBold">How &ldquo;client to connect&rdquo; works</Text>
                    <Text size="sm" color="placeholder" lineHeight="normal">
                      When your client signs in to Wayflyer via the invite link you share, they&rsquo;ll be prompted to
                      connect their accounting software (e.g., QuickBooks, Xero). No files to upload on your end.
                    </Text>
                  </div>
                  <div className={styles.modalSection}>
                    <Text size="base" fontWeight="semiBold">Why this is the best way to share financial statements</Text>
                    <Text size="sm" color="placeholder" lineHeight="normal">
                      Direct connections give us real time data, so underwriting is faster and you get to a final offer sooner.
                    </Text>
                  </div>
                  <div className={styles.modalSection}>
                    <Text size="base" fontWeight="semiBold">Prefer to upload files yourself?</Text>
                    <Text size="sm" color="placeholder" lineHeight="normal">
                      Select Upload file manually from the menu (&#8942;). Note that manual uploads add 24&ndash;48 hours to underwriting.
                    </Text>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <Button variant="Primary" onClick={() => setActiveModalType(null)}>Got it</Button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.modalContent}>
                  <div className={styles.modalSection}>
                    <Text size="sm" color="placeholder" lineHeight="normal">
                      You&rsquo;ve chosen to upload financial statements manually on your client&rsquo;s behalf.
                      Processing manually uploaded statements adds 24-48 hours to underwriting time.
                    </Text>
                  </div>
                  <div className={styles.modalSection}>
                    <Text size="base" fontWeight="semiBold">Ask your client to connect their accounting platform instead</Text>
                    <Text size="sm" color="placeholder" lineHeight="normal">
                      The invite link you share will prompt your client to connect their accounting platform alongside
                      their bank account. No separate outreach from Wayflyer, and it speeds up underwriting.
                    </Text>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <Button variant="Secondary" onClick={() => setActiveModalType(null)}>Continue with manual</Button>
                  <Button variant="Primary" onClick={switchToConnection}>Ask client to connect</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bank modal */}
      {activeModalType === "bank" && (
        <div
          className={styles.modalOverlay}
          onClick={() => setActiveModalType(null)}
          aria-modal="true"
          role="dialog"
          aria-labelledby="bank-modal-title"
        >
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <Text id="bank-modal-title" size="lg" fontWeight="semiBold" lineHeight="tight">
                Bank account connection (Plaid)
              </Text>
              <IconButton
                variant="Secondary"
                size="auto"
                Icon={IconXmark16Line}
                accessibilityLabel="Close"
                onClick={() => setActiveModalType(null)}
              />
            </div>
            <div className={styles.modalContent}>
              <div className={styles.modalSection}>
                <Text size="base" fontWeight="semiBold">How bank connection works</Text>
                <Text size="sm" color="placeholder" lineHeight="normal">
                  Your client connects their business bank account through open banking via the invite link you share.
                </Text>
              </div>
              <div className={styles.modalSection}>
                <Text size="base" fontWeight="semiBold">Why this is the default:</Text>
                <Text size="sm" color="placeholder" lineHeight="normal">
                  Plaid pulls bank data directly so we can underwrite faster and get you a final offer sooner.
                  Wayflyer never sees or stores your client&rsquo;s bank login details.
                </Text>
              </div>
              <div className={styles.modalSection}>
                <Text size="base" fontWeight="semiBold">How to get the link?</Text>
                <Text size="sm" color="placeholder" lineHeight="normal">
                  After you accept the Indicative Offer on the next page, we&rsquo;ll generate a secure link for you to
                  share with your client.
                </Text>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <Button variant="Primary" onClick={() => setActiveModalType(null)}>Got it</Button>
            </div>
          </div>
        </div>
      )}

      {/* Drag overlay */}
      {isDraggingOver && (
        <div className={styles.dragOverlay} aria-hidden="true">
          <div className={styles.dragCard}>
            <div className={styles.dragCardIllustration}>
              <img src={uploadIllustration} alt="" width="250" height="150" />
            </div>
            <div className={styles.dragCardBody}>
              <Heading size="sm">Upload to Broker Portal</Heading>
              <Text size="sm" align="center" lineHeight="normal" color="placeholder">
                Drag and drop your client&rsquo;s files here. We&rsquo;ll sort them for you.
              </Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
