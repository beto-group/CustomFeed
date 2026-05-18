const { useState, useMemo, useEffect, useRef } = dc;

// Consolidate DOM Utilities inside single index.jsx for maximum safety and path independence
const domUtils = {
  findNearestAncestorWithClass(element, className) {
    if (!element) return null;
    return element.closest('.' + className);
  },
  findDirectChildByClass(parent, className) {
    if (!parent) return null;
    return parent.querySelector(':scope > .' + className);
  }
};

// Standardized safe view-content FullTab reparenting hook
function useFullTab({ isFullTab, containerRef }) {
  const stateRefs = useRef({}).current;
  const componentId = useRef('cf-' + Math.random().toString(36).substr(2, 5)).current;
  const { findNearestAncestorWithClass, findDirectChildByClass } = domUtils;

  useEffect(() => {
    if (!isFullTab) return;

    const container = containerRef.current;
    if (!container) return;

    // Grab nearest Obsidian workspace-leaf container
    const leaf = findNearestAncestorWithClass(container, "workspace-leaf-content");
    if (!leaf) return;

    // Target the view-content sibling of the leaf header to avoid covering headers
    const contentWrapper = findDirectChildByClass(leaf, "view-content") || leaf;
    const currentParent = container.parentNode;
    if (!currentParent) return;

    // Create screen mode placeholder inside Obsidian's original layout flow
    stateRefs.originalParent = currentParent;
    const placeholder = document.createElement("div");
    placeholder.className = "screen-mode-placeholder";
    placeholder.style.display = "none";

    if (container.nextSibling) {
      currentParent.insertBefore(placeholder, container.nextSibling);
    } else {
      currentParent.appendChild(placeholder);
    }
    stateRefs.placeholder = placeholder;

    // Inject global "Impeccable Status" stylesheet to suppress status bars, footers and preserve headers
    const styleId = `cf-immersive-status-${componentId}`;
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.innerHTML = `
        /* Hide global status bar and view footers */
        .status-bar, .view-footer, .workspace-leaf-content-footer { 
            display: none !important; 
        }
        
        /* Ensure leaf content fits edge-to-edge under the preserved header */
        .workspace-leaf-content { 
            padding: 0 !important; 
            margin: 0 !important; 
            border-radius: 0 !important; 
        }
      `;
      document.head.appendChild(styleEl);
    }

    stateRefs.parentPositionInfo = {
      element: contentWrapper,
      originalInlinePosition: contentWrapper.style.position,
    };

    if (window.getComputedStyle(contentWrapper).position === 'static') {
      contentWrapper.style.position = "relative";
    }

    contentWrapper.appendChild(container);

    // Dynamic Edge-to-Edge OLED layout expansion
    requestAnimationFrame(() => {
      Object.assign(contentWrapper.style, {
        padding: "0",
        margin: "0",
        height: "100%",
        width: "100%",
        display: "block",
        overflow: "hidden",
        minHeight: "0"
      });
    });

    Object.assign(container.style, {
      position: "absolute",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      zIndex: "9998",
      overflow: "hidden",
      backgroundColor: "hsl(220, 20%, 4%)",
    });

    // Cleanup and gracefully restore native Obsidian views
    return () => {
      console.log("Datacore: Cleaning up Immersive Full Tab Mode");
      if (stateRefs.placeholder?.parentNode) {
        stateRefs.placeholder.parentNode.replaceChild(container, stateRefs.placeholder);
      } else if (stateRefs.originalParent) {
        stateRefs.originalParent.appendChild(container);
      }

      // Remove the Impeccable global stylesheet
      const el = document.getElementById(styleId);
      if (el) el.remove();

      if (stateRefs.parentPositionInfo?.element) {
        const { element, originalInlinePosition } = stateRefs.parentPositionInfo;
        element.style.position = originalInlinePosition || '';
        element.style.padding = '';
        element.style.margin = '';
        element.style.height = '';
        element.style.width = '';
        element.style.overflow = '';
      }

      container.removeAttribute("style");
    };
  }, [isFullTab]);
}

// Returns guidelines based on the entered URL.
function getIframesGuidelines() {
  return {
    WEBSITES: {
      containerWidth: 640,
      containerHeight: 600,
      iframeWidth: 640,
      iframeHeight: 640,
      iframeScale: 1,
      iframeLeft: 0,
      iframeTop: 0,
      disableIframeInteraction: false
    },
    FACEBOOK: {
      containerWidth: 640,
      containerHeight: 600,
      iframeWidth: 640,
      iframeHeight: 666,
      iframeScale: 1,
      iframeLeft: 0,
      iframeTop: 0,
      disableIframeInteraction: false
    },
    "FACEBOOK.reel": {
      containerWidth: 339,
      containerHeight: 600,
      iframeWidth: 640,
      iframeHeight: 1137,
      iframeScale: 0.526,
      iframeLeft: 1,
      iframeTop: 0,
      disableIframeInteraction: false
    },
    "FACEBOOK.plugins": {
      containerWidth: 629,
      containerHeight: 355,
      iframeWidth: 888,
      iframeHeight: 766,
      iframeScale: 0.705,
      iframeLeft: 0,
      iframeTop: 0,
      disableIframeInteraction: false
    },
    "FACEBOOK.watch": {
      containerWidth: 629,
      containerHeight: 355,
      iframeWidth: 888,
      iframeHeight: 766,
      iframeScale: 0.793,
      iframeLeft: 0,
      iframeTop: -90,
      disableIframeInteraction: false
    },
    WARPCAST: {
      containerWidth: 640,
      containerHeight: 600,
      iframeWidth: 640,
      iframeHeight: 666,
      iframeScale: 1,
      iframeLeft: 0,
      iframeTop: 0,
      disableIframeInteraction: false
    },
    SNAPCHAT: {
      containerWidth: 396,
      containerHeight: 600,
      iframeWidth: 640,
      iframeHeight: 1111,
      iframeScale: 0.615,
      iframeLeft: 0,
      iframeTop: 44,
      disableIframeInteraction: false
    },
    YOUTUBE: {
      containerWidth: 640,
      containerHeight: 367,
      iframeWidth: 1270,
      iframeHeight: 730,
      iframeScale: 0.5,
      iframeLeft: 0,
      iframeTop: 0,
      disableIframeInteraction: false
    },
    TIKTOK: {
      containerWidth: 340,
      containerHeight: 600,
      iframeWidth: 640,
      iframeHeight: 666,
      iframeScale: 0.92,
      iframeLeft: -124,
      iframeTop: -8,
      disableIframeInteraction: false
    },
    REDDIT: {
      containerWidth: 640,
      containerHeight: 600,
      iframeWidth: 640,
      iframeHeight: 600,
      iframeScale: 1,
      iframeLeft: 0,
      iframeTop: 0,
      disableIframeInteraction: false
    },
    LINKEDIN: {
      containerWidth: 640,
      containerHeight: 600,
      iframeWidth: 640,
      iframeHeight: 600,
      iframeScale: 1,
      iframeLeft: 0,
      iframeTop: 0,
      disableIframeInteraction: false
    },
    "YOUTUBE.shorts": {
      containerWidth: 333,
      containerHeight: 600,
      iframeWidth: 640,
      iframeHeight: 666,
      iframeScale: 1.04,
      iframeLeft: -155,
      iframeTop: -42,
      disableIframeInteraction: false
    },
    INSTAGRAM: {
      containerWidth: 338,
      containerHeight: 600,
      iframeWidth: 640,
      iframeHeight: 1333,
      iframeScale: 0.528,
      iframeLeft: 0,
      iframeTop: -70,
      disableIframeInteraction: false
    },
    "INSTAGRAM.embed": {
      containerWidth: 340,
      containerHeight: 600,
      iframeWidth: 640,
      iframeHeight: 1333,
      iframeScale: 0.75,
      iframeLeft: -71,
      iframeTop: -41,
      disableIframeInteraction: false
    },
    "TIKTOK.embed": {
      containerWidth: 303,
      containerHeight: 600,
      iframeWidth: 333,
      iframeHeight: 666,
      iframeScale: 0.92,
      iframeLeft: 0,
      iframeTop: 0,
      disableIframeInteraction: false
    },
    "INSTAGRAM.p.embed": {
      containerWidth: 503,
      containerHeight: 600,
      iframeWidth: 640,
      iframeHeight: 1333,
      iframeScale: 0.782,
      iframeLeft: 0,
      iframeTop: -69,
      disableIframeInteraction: false
    },
    "INSTAGRAM.p": {
      containerWidth: 479,
      containerHeight: 600,
      iframeWidth: 640,
      iframeHeight: 1333,
      iframeScale: 0.745,
      iframeLeft: 0,
      iframeTop: -87,
      disableIframeInteraction: false
    },
    "X.platform.embed": {
      containerWidth: 514,
      containerHeight: 600,
      iframeWidth: 550,
      iframeHeight: 640,
      iframeScale: 0.935,
      iframeLeft: 0,
      iframeTop: 0,
      disableIframeInteraction: false
    },
    "X": {
      containerWidth: 640,
      containerHeight: 600,
      iframeWidth: 744,
      iframeHeight: 640,
      iframeScale: 1.054,
      iframeLeft: -105,
      iframeTop: 0,
      disableIframeInteraction: false
    }
  };
}

function transformUrl(url) {
  if (!url) return "";
  const lower = url.toLowerCase();
  try {
    if (lower.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return "https://www.youtube.com/embed/" + videoId;
      }
    } else if (lower.includes("youtu.be/")) {
      const parts = url.split("/");
      const videoId = parts[parts.length - 1];
      if (videoId) {
        return "https://www.youtube.com/embed/" + videoId;
      }
    }
  } catch (e) {
    console.error("URL transformation error:", e);
  }
  return url;
}

function getGuidelinesForUrl(url) {
  const guidelines = getIframesGuidelines();
  const lowerUrl = url.toLowerCase();
  let key = "WEBSITES"; // default guideline

  if (lowerUrl.includes("facebook.com/reel") || lowerUrl.includes("facebook.com/plugins/vid")) {
    key = "FACEBOOK.reel";
  } else if (lowerUrl.includes("facebook.com/watch?v=")) {
    key = "FACEBOOK.video";
  } else if (lowerUrl.includes("facebook.com")) {
    key = "FACEBOOK";
  } else if (lowerUrl.includes("warpcast")) {
    key = "WARPCAST";
  } else if (lowerUrl.includes("snapchat.com")) {
    key = "SNAPCHAT";
  } else if (
    (lowerUrl.includes("youtube.com") && lowerUrl.includes("/shorts")) ||
    (lowerUrl.includes("youtu.be") && lowerUrl.includes("shorts"))
  ) {
    key = "YOUTUBE.shorts";
  } else if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
    key = "YOUTUBE";
  } else if (lowerUrl.includes("tiktok.com/embed")) {
    key = "TIKTOK.embed";
  } else if (lowerUrl.includes("tiktok.com")) {
    key = "TIKTOK";
  } else if (lowerUrl.includes("reddit.com")) {
    key = "REDDIT";
  } else if (lowerUrl.includes("linkedin.com")) {
    key = "LINKEDIN";
  } else if (lowerUrl.includes("instagram.com/reel") && lowerUrl.endsWith("/embed")) {
    key = "INSTAGRAM.embed";
  } else if (lowerUrl.includes("instagram.com/p") && lowerUrl.endsWith("/embed")) {
    key = "INSTAGRAM.p.embed";
  } else if (lowerUrl.includes("instagram.com/p")) {
    key = "INSTAGRAM.p";
  } else if (lowerUrl.includes("instagram.com")) {
    key = "INSTAGRAM";
  } else if (lowerUrl.includes("platform.twitter.com/embed") || lowerUrl.includes("platform.x.com/embed")) {
    key = "X.platform.embed";
  } else if (lowerUrl.includes("twitter.com") || lowerUrl.includes("x.com")) {
    key = "X";
  }
  return guidelines[key] || guidelines.WEBSITES;
}

// Sets up a ResizeObserver on the container and calls the updateDimensions callback
function useResizeObserver(containerRef, isContainerManualRef, updateDimensions) {
  useEffect(() => {
    if (
      !isContainerManualRef.current &&
      containerRef.current &&
      typeof ResizeObserver !== "undefined"
    ) {
      const observer = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const newWidth = entry.contentRect.width;
          if (!isContainerManualRef.current) {
            updateDimensions(newWidth);
          }
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, [isContainerManualRef.current, containerRef.current]);
}

// Fallback window resize listener when ResizeObserver is not available.
function useWindowResize(isContainerManual, updateDimensions) {
  useEffect(() => {
    if (!isContainerManual) {
      const handleResize = () => {
        const newWidth = window.innerWidth;
        updateDimensions(newWidth);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isContainerManual]);
}

async function editFileSegment(filePath, originalSegment, newSegment) {
  if (!window.app) throw new Error("Obsidian app context not found");
  const file = app.vault.getAbstractFileByPath(filePath);
  if (!file) {
    throw new Error("File not found: " + filePath);
  }
  const fileContent = await app.vault.read(file);
  const index = fileContent.indexOf(originalSegment);
  if (index === -1) {
    throw new Error("Original segment not found in the file content.");
  }
  const updatedContent =
    fileContent.substring(0, index) +
    newSegment +
    fileContent.substring(index + originalSegment.length);
  await app.vault.modify(file, updatedContent);
  return updatedContent;
}

function EditableSectionUI({ sectionText, filePath, onSectionUpdate }) {
  const [editing, setEditing] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!editing) {
      const handleGlobalKeyDown = (e) => {
        const tag = document.activeElement.tagName.toLowerCase();
        if (tag === "input" || tag === "textarea") return;

        if (e.key === "Enter" || e.key === "Return") {
          e.preventDefault();
          setEditing(true);
          setTimeout(() => {
            textareaRef.current && textareaRef.current.focus();
          }, 0);
        }
      };

      window.addEventListener("keydown", handleGlobalKeyDown);
      return () => window.removeEventListener("keydown", handleGlobalKeyDown);
    }
  }, [editing]);

  const handleTextareaKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === "Return") && !e.shiftKey) {
      e.preventDefault();
      const originalSegment = sectionText;
      const newText = textareaRef.current.value;
      editFileSegment(filePath, originalSegment, newText)
        .then(() => {
          onSectionUpdate(newText);
          setEditing(false);
        })
        .catch((error) => console.error("Error updating file:", error));
    }
  };

  return (
    <div style={styles.editorSection}>
      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "10px" }}>
          <textarea
            defaultValue={sectionText}
            ref={textareaRef}
            onKeyDown={handleTextareaKeyDown}
            style={styles.editorTextarea}
          />
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              style={styles.saveBtn}
              onClick={async () => {
                const originalSegment = sectionText;
                const newText = textareaRef.current.value;
                try {
                  await editFileSegment(filePath, originalSegment, newText);
                  onSectionUpdate(newText);
                  setEditing(false);
                } catch (error) {
                  console.error("Error updating file:", error);
                }
              }}
            >
              <dc.Icon icon="save" style={{ marginRight: "4px", fontSize: "14px" }} />
              Save
            </button>
            <button style={styles.cancelBtn} onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <pre style={styles.editorPre}>
            {sectionText}
          </pre>
          <button style={styles.editBtn} onClick={() => setEditing(true)}>
            <dc.Icon icon="edit" style={{ marginRight: "6px", fontSize: "13px" }} />
            Edit Section
          </button>
        </div>
      )}
    </div>
  );
}

function FileSectionsProvider({
  fileName,
  folderPath,
  onSectionsLoaded,
  onFilePathLoaded,
  editable = false,
  currentSectionIndex = 0,
  onSectionUpdate,
}) {
  const queryString = useMemo(() => {
    if (folderPath) {
      return `@page and startswith($path, "${folderPath}/data/") and endswith($path, "${fileName}")`;
    }
    return `@page and endswith($path, "${fileName}")`;
  }, [folderPath, fileName]);
  const pages = dc.useQuery(queryString);

  const fallbackQueryString = useMemo(() => {
    if (folderPath) {
      return `@page and startswith($path, "${folderPath}/data/")`;
    }
    return `@page and $name.contains("EXPERIENCES.enigmas")`;
  }, [folderPath]);
  const fallbackPages = dc.useQuery(fallbackQueryString);

  const targetPage = useMemo(() => {
    if (pages && pages.length > 0) {
      const exactMatch = pages.find((page) => {
        const segments = page.$path.split("/");
        const currentFileName = segments[segments.length - 1];
        return currentFileName === fileName;
      });
      if (exactMatch) return exactMatch;
      return pages[0];
    }
    
    if (fallbackPages && fallbackPages.length > 0) {
      return fallbackPages[0];
    }
    return null;
  }, [pages, fallbackPages, fileName]);

  const [filePath, setFilePath] = useState("");
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (targetPage) {
      const loadedPath = targetPage.$path;
      setFilePath(loadedPath);
      if (onFilePathLoaded) onFilePathLoaded(loadedPath);
      const file = app.vault.getAbstractFileByPath(loadedPath);
      if (file) {
        app.vault.read(file).then((content) => {
          let fullText = content || "";

          const headerMarker = "#### AENIGMAS";
          const markerIndex = fullText.indexOf(headerMarker);
          if (markerIndex !== -1) {
            fullText = fullText.substring(markerIndex + headerMarker.length);
          }

          const rawSections = fullText
            .split(/^\s*-{3,}\s*$/m)
            .filter((section) => section.replace(/\s+/g, "") !== "");

          function cleanLines(text) {
            const lines = text.split(/\r?\n/);
            while (lines.length && /^\s*$/.test(lines[0])) {
              lines.shift();
            }
            while (lines.length && /^\s*$/.test(lines[lines.length - 1])) {
              lines.pop();
            }
            return lines.map((line) => line.replace(/^\s+/, "")).join("\n");
          }

          const sectionsData = rawSections.map((originalSection) => {
            const finalText = cleanLines(originalSection);

            const iframeTagRegex = /<iframe\b[^>]*>[\s\S]*?<\/iframe>/i;
            const srcRegex = /<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i;
            let iframeTag = "";
            let iframeSrc = "";

            const iframeTagMatch = originalSection.match(iframeTagRegex);
            if (iframeTagMatch) {
              iframeTag = iframeTagMatch[0];
              const srcMatch = iframeTag.match(srcRegex);
              if (srcMatch) {
                iframeSrc = srcMatch[1];
              }
            } else {
              const urlRegex = /(https:\/\/[^\s]+)/;
              const urlMatch = finalText.match(urlRegex);
              if (urlMatch) {
                iframeSrc = urlMatch[1];
              }
            }

            if (iframeSrc && iframeSrc.includes("youtube.com/embed/")) {
              const youtubeUrlRegex = /(https:\/\/(?:www\.)?youtube\.com\/(?!embed)[^"'\s]+)/;
              const youtubeMatch = finalText.match(youtubeUrlRegex);
              if (youtubeMatch) {
                iframeSrc = youtubeMatch[1];
              }
            }

            if (iframeSrc && iframeSrc.includes("instagram.com")) {
              iframeSrc = iframeSrc.replace(/\/embed\/?$/, '');
            }

            return {
              text: finalText,
              iframeTag,
              iframeSrc,
            };
          });

          setSections(sectionsData);
          if (onSectionsLoaded) onSectionsLoaded(sectionsData);
        });
      }
    }
  }, [targetPage, fileName]);

  if (editable && sections.length > 0) {
    const currentSection = sections[currentSectionIndex];
    return (
      <EditableSectionUI
        sectionText={currentSection.text}
        filePath={filePath}
        onSectionUpdate={(newText) => {
          const newSections = [...sections];
          newSections[currentSectionIndex].text = newText;
          setSections(newSections);
          if (onSectionUpdate) onSectionUpdate(newText);
        }}
      />
    );
  }
  return null;
}

function IframeContainer({
  width,
  height,
  iframeSrc,
  iframeWidth,
  iframeHeight,
  iframeScale,
  iframeLeft,
  iframeTop,
  disableIframeInteraction,
  iframeWrapperRef
}) {
  return (
    <div
      style={{
        position: "relative",
        width: width + "px",
        height: height + "px",
        border: "1px solid hsla(0,0%,100%,0.08)",
        borderRadius: "12px",
        backgroundColor: "#050505",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        margin: "0 auto",
        boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
      }}
    >
      <div style={styles.watermark}>
        <dc.Icon icon="monitor" style={{ fontSize: "28px", color: "hsla(0,0%,100%,0.05)" }} />
      </div>
      <div
        ref={iframeWrapperRef}
        style={{
          position: "absolute",
          left: iframeLeft + "px",
          top: iframeTop + "px",
          width: iframeWidth + "px",
          height: iframeHeight + "px",
          overflow: "hidden",
          pointerEvents: disableIframeInteraction ? "none" : "auto"
        }}
      >
        {transformUrl(iframeSrc) ? (
          <iframe
            src={transformUrl(iframeSrc)}
            title="Controlled iFrame"
            width={iframeWidth}
            height={iframeHeight}
            loading="lazy"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{
              border: "none",
              transform: `scale(${iframeScale})`,
              transformOrigin: "top left"
            }}
          ></iframe>
        ) : null}
      </div>
    </div>
  );
}

function View({ title = "PHYSICAL.enigmas", spawnType = "fullTab", folderPath }) {
  const lowerSpawnType = (spawnType || "").toLowerCase();
  const isDisabled = lowerSpawnType === "disabled" || lowerSpawnType === "disable";
  const isLocked = lowerSpawnType.includes(".locked");
  const baseSpawnType = lowerSpawnType.replace(".locked", "");
  const showFullTabToggle = !isLocked && !isDisabled;
  const initialFullTab = !isDisabled && baseSpawnType === "fulltab";
  
  const fileName = `${title}..md`;

  const [width, setWidth] = useState(800); 
  const [height, setHeight] = useState(600); 
  const [isContainerManual, setIsContainerManual] = useState(false);
  const isContainerManualRef = useRef(isContainerManual);
  useEffect(() => {
    isContainerManualRef.current = isContainerManual;
  }, [isContainerManual]);

  const [iframeSrc, setIframeSrc] = useState("");
  const [iframeWidth, setIframeWidth] = useState(800); 
  const [iframeHeight, setIframeHeight] = useState(666); 
  const [iframeScale, setIframeScale] = useState(1);     
  const [iframeLeft, setIframeLeft] = useState(10);        
  const [iframeTop, setIframeTop] = useState(10);          
  const [disableIframeInteraction, setDisableIframeInteraction] = useState(true);

  const containerRef = useRef(null);
  const iframeWrapperRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showFineControls, setShowFineControls] = useState(false);

  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  
  const [isFullTab, setIsFullTab] = useState(initialFullTab);
  
  // Custom Reparenting Hook
  useFullTab({ isFullTab, containerRef });

  const [sections, setSections] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedFilePath, setLoadedFilePath] = useState("");
  const [entryInput, setEntryInput] = useState("1");

  useEffect(() => {
    setEntryInput(String(currentIndex + 1));
  }, [currentIndex]);

  const titleRef = useRef(null);

  const headerText = useMemo(() => {
    if (loadedFilePath) {
      const segments = loadedFilePath.split("/");
      const filename = segments[segments.length - 1];
      return filename.replace(/\.\.md$/, "").replace(/\.md$/, "");
    }
    const parts = fileName.split("..md");
    return parts[0] || fileName.replace(/\.[^/.]+$/, "");
  }, [loadedFilePath, fileName]);

  function simulateTitleClickWithPressDelay(pressDelay = 200) {
    if (!titleRef.current) return;
    
    const mouseDownEvent = new MouseEvent("mousedown", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    titleRef.current.dispatchEvent(mouseDownEvent);

    setTimeout(() => {
      if (!titleRef.current) return;
      
      const mouseUpEvent = new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      titleRef.current.dispatchEvent(mouseUpEvent);

      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      titleRef.current.dispatchEvent(clickEvent);
    }, pressDelay);
  }

  function simulateTitleClickDelayed(delay = 500, pressDelay = 200) {
    setTimeout(() => {
      simulateTitleClickWithPressDelay(pressDelay);
    }, delay);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      simulateTitleClickWithPressDelay();
    }, 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const goNext = () => {
    setCurrentIndex((prev) => {
      if (prev < sections.length - 1) {
        return prev + 1;
      } else {
        simulateTitleClickDelayed();
        return prev;
      }
    });
  };

  const goPrev = () => {
    setCurrentIndex((prev) => {
      if (prev > 0) {
        return prev - 1;
      } else {
        simulateTitleClickDelayed();
        return prev;
      }
    });
  };

  function updateCurrentIndexFromInput() {
    const parsed = parseInt(entryInput, 10);
    if (!isNaN(parsed) && sections.length > 0) {
      let newIndex = parsed - 1;
      if (newIndex < 0) newIndex = 0;
      if (newIndex >= sections.length) newIndex = sections.length - 1;
      setCurrentIndex(newIndex);
    }
  }

  function handleEntryInputKeyDown(e) {
    if (e.key === "Enter") {
      updateCurrentIndexFromInput();
    }
  }
  
  function handleEntryInputBlur() {
    updateCurrentIndexFromInput();
  }

  useEffect(() => {
    function handleKeyDown(e) {
      const tag = document.activeElement.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      if (!e.altKey) return;

      if (showFineControls && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        return;
      }

      if (!showFineControls) {
        if (e.key === "ArrowRight" || e.key === "d") {
          setMenuOpen(true);
          e.preventDefault();
        } else if (e.key === "ArrowLeft" || e.key === "a") {
          setMenuOpen(false);
          e.preventDefault();
        } else if (e.key === "ArrowUp" || e.key === "w") {
          goPrev();
          e.preventDefault();
        } else if (e.key === "ArrowDown" || e.key === "s") {
          goNext();
          e.preventDefault();
        } else if (e.key === " ") {
          setDisableIframeInteraction((prev) => !prev);
          e.preventDefault();
        } else if (e.key === "v") {
          openCurrentLink();
          e.preventDefault();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFineControls, goPrev, goNext]);

  useEffect(() => {
    function handleWheel(e) {
      if (!showFineControls) return;

      const baseFactor = 0.2;
      const ilitFactor = 0.5;
      const scaleFactor = 0.001;

      if (e.metaKey && e.altKey && e.shiftKey) {
        if (e.deltaX !== 0) {
          setIframeLeft((prev) => prev + e.deltaX * ilitFactor);
        }
        if (e.deltaY !== 0) {
          setIframeTop((prev) => prev + e.deltaY * ilitFactor);
        }
        e.preventDefault();
      }
      else if (e.metaKey && e.altKey && !e.shiftKey) {
        if (e.deltaY !== 0) {
          setIframeScale((prev) => {
            const newScale = Math.max(0.1, prev + (e.deltaY > 0 ? -scaleFactor : scaleFactor));
            return parseFloat(newScale.toFixed(3));
          });
          e.preventDefault();
        }
      }
      else if (e.metaKey && e.shiftKey && !e.altKey) {
        if (e.deltaX !== 0) {
          setWidth((prev) => Math.max(10, prev + e.deltaX * baseFactor));
          e.preventDefault();
        }
        if (e.deltaY !== 0) {
          setHeight((prev) => Math.max(10, prev + e.deltaY * baseFactor));
          e.preventDefault();
        }
      }
      else if (e.metaKey && !e.shiftKey && !e.altKey) {
        if (e.deltaX !== 0) {
          setIframeWidth((prev) => Math.max(10, prev + e.deltaX * baseFactor));
          e.preventDefault();
        }
        if (e.deltaY !== 0) {
          setIframeHeight((prev) => Math.max(10, prev + e.deltaY * baseFactor));
          e.preventDefault();
        }
      }
    }
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [showFineControls]);

  function openCurrentLink() {
    if (iframeSrc) {
      window.open(iframeSrc, "_blank");
    }
  }

  const handleTouchStart = (e) => {
    e.stopPropagation();
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    e.stopPropagation();
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    e.stopPropagation();
    const swipeDistance = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 50; 
    
    if (swipeDistance > minSwipeDistance) {
      goNext();
    } else if (swipeDistance < -minSwipeDistance) {
      goPrev();
    }

    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
    container.addEventListener('touchmove', handleTouchMove, { capture: true, passive: true });
    container.addEventListener('touchend', handleTouchEnd, { capture: true, passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart, { capture: true });
      container.removeEventListener('touchmove', handleTouchMove, { capture: true });
      container.removeEventListener('touchend', handleTouchEnd, { capture: true });
    };
  }, [goNext, goPrev]);

  const updateDimensions = (newWidth) => {
    setWidth(newWidth);
    setIframeWidth(newWidth);
  };
  
  useResizeObserver(
    containerRef,
    isContainerManualRef,
    updateDimensions
  );
  
  useWindowResize(isContainerManual, updateDimensions);

  const applyGuidelines = (url) => {
    const guidelines = getGuidelinesForUrl(url);
    if (guidelines) {
      setIsContainerManual(true);
      isContainerManualRef.current = true;
      setWidth(guidelines.containerWidth);
      setHeight(guidelines.containerHeight);
      setIframeWidth(guidelines.iframeWidth);
      setIframeHeight(guidelines.iframeHeight);
      setIframeScale(guidelines.iframeScale);
      setIframeLeft(guidelines.iframeLeft);
      setIframeTop(guidelines.iframeTop);
      setDisableIframeInteraction(guidelines.disableIframeInteraction);
    }
  };

  useEffect(() => {
    if (sections.length > 0 && sections[currentIndex]) {
      const newUrl = sections[currentIndex].iframeSrc;
      if (newUrl) {
        setIframeSrc(newUrl);
        applyGuidelines(newUrl);
      } else {
        setIframeSrc("");
      }
    }
  }, [currentIndex, sections]);

  const handleContainerClick = (e) => {
    if (!disableIframeInteraction) return;
    window.requestAnimationFrame(() => {
      const containerRect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - containerRect.left;
      const clickY = e.clientY - containerRect.top;
      if (
        clickX >= iframeLeft &&
        clickX <= iframeLeft + iframeWidth &&
        clickY >= iframeTop &&
        clickY <= iframeTop + iframeHeight
      ) {
        const relativeX = (clickX - iframeLeft) / iframeScale;
        const relativeY = (clickY - iframeTop) / iframeScale;
        if (iframeWrapperRef.current) {
          const iframe = iframeWrapperRef.current.querySelector("iframe");
          if (iframe) {
            try {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
              const targetElement = iframeDoc.elementFromPoint(relativeX, relativeY);
              if (targetElement) {
                const simulatedClick = new MouseEvent("click", {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                  clientX: relativeX,
                  clientY: relativeY,
                });
                targetElement.dispatchEvent(simulatedClick);
              }
            } catch (error) {
              console.error("Unable to simulate click in iframe:", error);
            }
          }
        }
      }
    });
  };

  return (
    <div style={styles.cfContainer}>
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        style={styles.viewerArea}
      >
        {/* Glassmorphism Header */}
        <div style={styles.cfHeader}>
          <div style={styles.headerTitleArea}>
            <dc.Icon icon="rss" style={styles.headerIcon} />
            <h1 ref={titleRef} style={styles.headerTitle}>
              {headerText}
            </h1>
          </div>
          
          {/* Navigation & Action Controls */}
          <div style={styles.controlsRow}>
            <div style={styles.navButtonGroup}>
              <button
                disabled={showFineControls || currentIndex <= 0}
                style={currentIndex > 0 && !showFineControls ? styles.navBtn : styles.navBtnDisabled}
                onClick={currentIndex > 0 && !showFineControls ? goPrev : undefined}
                title="Previous section"
              >
                <dc.Icon icon="chevron-left" style={{ fontSize: "16px" }} />
              </button>
              
              {sections.length > 0 && (
                <div style={styles.counterBadge}>
                  <input
                    type="number"
                    value={entryInput}
                    onChange={(e) => setEntryInput(e.target.value)}
                    onKeyDown={handleEntryInputKeyDown}
                    onBlur={handleEntryInputBlur}
                    style={styles.counterInput}
                  />
                  <span style={styles.counterTotal}>/ {sections.length}</span>
                </div>
              )}
              
              <button
                disabled={showFineControls || currentIndex >= sections.length - 1}
                style={currentIndex < sections.length - 1 && !showFineControls ? styles.navBtn : styles.navBtnDisabled}
                onClick={currentIndex < sections.length - 1 && !showFineControls ? goNext : undefined}
                title="Next section"
              >
                <dc.Icon icon="chevron-right" style={{ fontSize: "16px" }} />
              </button>
            </div>
            
            <div style={styles.actionButtonGroup}>
              <button
                style={disableIframeInteraction ? styles.actionBtn : styles.actionBtnActive}
                onClick={(e) => {
                  e.stopPropagation();
                  setDisableIframeInteraction(!disableIframeInteraction);
                }}
                title={disableIframeInteraction ? "Interact mode is Lock" : "Interact mode is Unlock"}
              >
                <dc.Icon icon={disableIframeInteraction ? "lock" : "unlock"} style={{ fontSize: "14px" }} />
                <span style={{ fontSize: "11px", fontWeight: "600", marginLeft: "4px" }}>
                  {disableIframeInteraction ? "LOCK" : "UNLOCKED"}
                </span>
              </button>
              
              <button
                style={styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  openCurrentLink();
                }}
                title="Open original website link in browser"
              >
                <dc.Icon icon="external-link" style={{ fontSize: "14px" }} />
              </button>
              
              <button
                style={menuOpen ? styles.actionBtnActive : styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                title="Edit current section text"
              >
                <dc.Icon icon="edit-3" style={{ fontSize: "14px" }} />
              </button>
              
              <button
                style={showFineControls ? styles.actionBtnActive : styles.actionBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFineControls((prev) => !prev);
                }}
                title="Tune layout fine offsets"
              >
                <dc.Icon icon="sliders" style={{ fontSize: "14px" }} />
              </button>
              
              {showFullTabToggle && (
                <button
                  style={isFullTab ? styles.actionBtnActive : styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullTab(!isFullTab);
                  }}
                  title={isFullTab ? "Exit Fullscreen Portal" : "Enter Fullscreen Portal"}
                >
                  <dc.Icon icon={isFullTab ? "minimize-2" : "maximize-2"} style={{ fontSize: "14px" }} />
                </button>
              )}
            </div>
          </div>

          {/* Fine Tuning Panel */}
          {showFineControls && (
            <div style={styles.fineTunePanel}>
              <div style={styles.fineField}>
                <span style={styles.fineLabel}>C.W</span>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                  style={styles.fineInput}
                />
              </div>
              <div style={styles.fineField}>
                <span style={styles.fineLabel}>C.H</span>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
                  style={styles.fineInput}
                />
              </div>
              <div style={styles.fineField}>
                <span style={styles.fineLabel}>I.W</span>
                <input
                  type="number"
                  value={iframeWidth}
                  onChange={(e) => setIframeWidth(parseFloat(e.target.value) || 0)}
                  style={styles.fineInput}
                />
              </div>
              <div style={styles.fineField}>
                <span style={styles.fineLabel}>I.H</span>
                <input
                  type="number"
                  value={iframeHeight}
                  onChange={(e) => setIframeHeight(parseFloat(e.target.value) || 0)}
                  style={styles.fineInput}
                />
              </div>
              <div style={styles.fineField}>
                <span style={styles.fineLabel}>I.S</span>
                <input
                  type="number"
                  step="0.001"
                  value={iframeScale}
                  onChange={(e) => setIframeScale(parseFloat(e.target.value) || 1)}
                  style={styles.fineInput}
                />
              </div>
              <div style={styles.fineField}>
                <span style={styles.fineLabel}>I.L</span>
                <input
                  type="number"
                  value={iframeLeft}
                  onChange={(e) => setIframeLeft(parseFloat(e.target.value) || 0)}
                  style={styles.fineInput}
                />
              </div>
              <div style={styles.fineField}>
                <span style={styles.fineLabel}>I.T</span>
                <input
                  type="number"
                  value={iframeTop}
                  onChange={(e) => setIframeTop(parseFloat(e.target.value) || 0)}
                  style={styles.fineInput}
                />
              </div>
            </div>
          )}
        </div>

        {/* Scrollable Main Stream */}
        <div style={styles.streamBody}>
          {iframeSrc ? (
            <div style={styles.stageFrame}>
              <IframeContainer
                width={width}
                height={height}
                iframeSrc={iframeSrc}
                iframeWidth={iframeWidth}
                iframeHeight={iframeHeight}
                iframeScale={iframeScale}
                iframeLeft={iframeLeft}
                iframeTop={iframeTop}
                disableIframeInteraction={disableIframeInteraction}
                iframeWrapperRef={iframeWrapperRef}
              />
            </div>
          ) : (
            <div style={styles.noFrameStage}>
              <dc.Icon icon="alert-circle" style={{ fontSize: "36px", color: "hsla(0,0%,100%,0.2)" }} />
              <span style={{ color: "hsla(0,0%,100%,0.4)", fontSize: "14px", marginTop: "8px" }}>
                No active media embed link detected in this section.
              </span>
            </div>
          )}
        </div>

        {/* Hamburger/Slide drawer for edit pane */}
        {menuOpen && (
          <div style={styles.drawerPane}>
            <div style={styles.drawerHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <dc.Icon icon="file-text" style={{ fontSize: "16px", color: "hsl(250, 84%, 66%)" }} />
                <h2 style={styles.drawerTitle}>Edit Document Block</h2>
              </div>
              <button onClick={() => setMenuOpen(false)} style={styles.drawerCloseBtn}>
                <dc.Icon icon="x" style={{ fontSize: "14px" }} />
              </button>
            </div>
            <div style={styles.drawerBody}>
              <FileSectionsProvider
                fileName={fileName}
                folderPath={folderPath}
                editable={true}
                currentSectionIndex={currentIndex}
                onSectionUpdate={(newText) => {
                  const newSections = [...sections];
                  newSections[currentIndex].text = newText;
                  setSections(newSections);
                }}
              />
            </div>
          </div>
        )}
      </div>

      <FileSectionsProvider 
        fileName={fileName} 
        folderPath={folderPath}
        onSectionsLoaded={setSections} 
        onFilePathLoaded={setLoadedFilePath} 
      />
    </div>
  );
}

// Curated Elite HSL Styling System (OLED Edge-to-Edge Theme)
const styles = {
  cfContainer: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    overflow: "hidden",
    backgroundColor: "hsl(220, 20%, 4%)",
    color: "hsl(220, 10%, 90%)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  viewerArea: {
    flex: "1 1 auto",
    overflow: "hidden",
    position: "relative",
    touchAction: "none",
    height: "100%",
    width: "100%"
  },
  cfHeader: {
    padding: "16px 24px",
    backgroundColor: "hsla(220, 20%, 4%, 0.7)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid hsla(0, 0%, 100%, 0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    position: "relative",
    zIndex: 10,
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
  },
  headerTitleArea: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  headerIcon: {
    fontSize: "18px",
    color: "hsl(250, 84%, 66%)"
  },
  headerTitle: {
    margin: 0,
    fontSize: "1.1em",
    fontWeight: "600",
    letterSpacing: "0.2px",
    color: "hsl(220, 10%, 95%)"
  },
  controlsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap"
  },
  navButtonGroup: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "hsla(0,0%,100%,0.03)",
    borderRadius: "10px",
    padding: "4px",
    border: "1px solid hsla(0,0%,100%,0.04)"
  },
  navBtn: {
    background: "none",
    border: "none",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    color: "hsl(220, 10%, 80%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  navBtnDisabled: {
    background: "none",
    border: "none",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    color: "hsla(0,0%,100%,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "default"
  },
  counterBadge: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "hsl(220, 10%, 75%)",
    fontSize: "13px",
    padding: "0 8px"
  },
  counterInput: {
    width: "36px",
    textAlign: "center",
    background: "hsla(0,0%,100%,0.04)",
    color: "hsl(220, 10%, 90%)",
    border: "1px solid hsla(0,0%,100%,0.08)",
    borderRadius: "6px",
    padding: "3px",
    fontSize: "12px",
    outline: "none",
    transition: "all 0.2s ease"
  },
  counterTotal: {
    color: "hsla(0,0%,100%,0.4)"
  },
  actionButtonGroup: {
    display: "flex",
    alignItems: "center",
    gap: "6px"
  },
  actionBtn: {
    background: "hsla(0,0%,100%,0.04)",
    color: "hsl(220, 10%, 80%)",
    border: "1px solid hsla(0,0%,100%,0.06)",
    borderRadius: "8px",
    padding: "0 10px",
    height: "32px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease"
  },
  actionBtnActive: {
    background: "hsla(250, 84%, 66%, 0.2)",
    color: "hsl(250, 84%, 85%)",
    border: "1px solid hsl(250, 84%, 66%)",
    borderRadius: "8px",
    padding: "0 10px",
    height: "32px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease"
  },
  fineTunePanel: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
    padding: "12px",
    backgroundColor: "hsla(0,0%,0%,0.4)",
    borderRadius: "10px",
    border: "1px solid hsla(0,0%,100%,0.06)"
  },
  fineField: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    background: "hsla(0,0%,100%,0.02)",
    border: "1px solid hsla(0,0%,100%,0.04)",
    padding: "4px 8px",
    borderRadius: "6px"
  },
  fineLabel: {
    color: "hsla(0,0%,100%,0.4)",
    fontSize: "11px",
    fontWeight: "bold"
  },
  fineInput: {
    width: "48px",
    background: "none",
    border: "none",
    color: "hsl(220, 10%, 90%)",
    fontSize: "12px",
    outline: "none",
    textAlign: "center"
  },
  streamBody: {
    width: "100%",
    height: "calc(100% - 110px)",
    overflowY: "auto",
    padding: "32px 16px 80px 16px",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  stageFrame: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  noFrameStage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    textAlign: "center"
  },
  watermark: {
    position: "absolute",
    zIndex: 1,
    pointerEvents: "none"
  },
  drawerPane: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "350px",
    height: "100%",
    background: "hsla(220, 20%, 4%, 0.95)",
    backdropFilter: "blur(30px)",
    borderLeft: "1px solid hsla(0, 0%, 100%, 0.08)",
    padding: "24px",
    boxSizing: "border-box",
    overflowY: "auto",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    boxShadow: "-10px 0 30px rgba(0,0,0,0.6)"
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid hsla(0,0%,100%,0.06)",
    paddingBottom: "12px"
  },
  drawerTitle: {
    margin: 0,
    color: "hsl(220, 10%, 90%)",
    fontSize: "15px",
    fontWeight: "600"
  },
  drawerCloseBtn: {
    border: "none",
    background: "hsla(0,0%,100%,0.04)",
    color: "hsla(0,0%,100%,0.5)",
    borderRadius: "6px",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease"
  },
  drawerBody: {
    flex: "1 1 auto",
    overflowY: "auto"
  },
  editorSection: {
    padding: "4px",
    height: "100%",
    boxSizing: "border-box"
  },
  editorTextarea: {
    width: "100%",
    height: "400px",
    background: "hsl(220, 15%, 2%)",
    color: "hsl(220, 10%, 85%)",
    border: "1px solid hsla(0,0%,100%,0.08)",
    borderRadius: "8px",
    padding: "12px",
    fontFamily: "monospace",
    fontSize: "12px",
    lineHeight: "1.6",
    resize: "vertical",
    outline: "none"
  },
  editorPre: {
    width: "100%",
    height: "400px",
    overflowY: "auto",
    background: "hsla(0,0%,100%,0.01)",
    border: "1px solid hsla(0,0%,100%,0.03)",
    borderRadius: "8px",
    padding: "12px",
    margin: 0,
    fontFamily: "monospace",
    fontSize: "12px",
    lineHeight: "1.6",
    color: "hsla(0,0%,100%,0.6)",
    whiteSpace: "pre-wrap"
  },
  saveBtn: {
    background: "hsl(250, 84%, 66%)",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    display: "flex",
    alignItems: "center"
  },
  cancelBtn: {
    background: "hsla(0,0%,100%,0.04)",
    color: "hsl(220, 10%, 80%)",
    border: "1px solid hsla(0,0%,100%,0.06)",
    borderRadius: "6px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "13px"
  },
  editBtn: {
    marginTop: "12px",
    background: "hsla(0,0%,100%,0.04)",
    color: "hsl(220, 10%, 85%)",
    border: "1px solid hsla(0,0%,100%,0.08)",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease"
  }
};

return { View };
