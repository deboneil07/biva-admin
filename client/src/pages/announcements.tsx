import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Save,
    X,
    Bell,
    RefreshCw,
    Monitor,
    Smartphone,
    Tablet,
    Upload,
    Trash,
    RotateCcw,
    Loader2,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
    useCreateAnnouncement,
    useDeleteAnnouncement,
    type CreateAnnouncementRequest,
} from "../hooks/useAnnouncements";

// Textarea component
interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

function Textarea({ className, ...props }: TextareaProps) {
    return (
        <textarea
            className={`min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y ${className || ""}`}
            {...props}
        />
    );
}

// Types for announcements
interface AnnouncementData {
    title: string;
    body: string;
    image?: string;
    styling: {
        backgroundColor: string;
        textColor: string;
        borderColor: string;
        fontSize: "sm" | "md" | "lg";
        alignment: "left" | "center" | "right";
    };
    onClose?: () => void;
}

interface Announcement {
    id: string;
    title: string;
    body: string;
    displayType: "banner" | "modal" | "popup" | "notification";
    image?: string | File; // Can be URL string or File object
    imagePreview?: string; // For displaying preview in UI
    styling: {
        backgroundColor: string;
        textColor: string;
        borderColor: string;
        fontSize: "sm" | "md" | "lg";
        alignment: "left" | "center" | "right";
    };
}

const defaultStyling = {
    backgroundColor: "#ffffff",
    textColor: "#000000",
    borderColor: "#e2e8f0",
    fontSize: "md" as const,
    alignment: "center" as const,
};

// REUSABLE ANNOUNCEMENT TEMPLATES
export const BannerTemplate: React.FC<AnnouncementData> = ({
    title,
    body,
    image,
    styling,
    onClose,
}) => {
    if (!title) return null;

    const style: React.CSSProperties = {
        backgroundColor: styling.backgroundColor,
        color: styling.textColor,
        textAlign: styling.alignment,
        fontSize:
            styling.fontSize === "sm"
                ? "14px"
                : styling.fontSize === "lg"
                  ? "18px"
                  : "16px",
    };

    return (
        <div
            className="w-full p-4 shadow-sm border-b relative z-50"
            style={style}
        >
            <div className="flex items-center gap-3 max-w-7xl mx-auto">
                {image && (
                    <img
                        src={image}
                        alt="Announcement"
                        className="w-12 h-12 rounded object-cover flex-shrink-0"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold mb-1 truncate">{title}</h4>
                    <p className="text-sm opacity-90 line-clamp-2">{body}</p>
                </div>
                {onClose && (
                    <X
                        className="w-5 h-5 opacity-50 cursor-pointer hover:opacity-75 flex-shrink-0"
                        onClick={onClose}
                    />
                )}
            </div>
        </div>
    );
};

export const ModalTemplate: React.FC<AnnouncementData> = ({
    title,
    body,
    image,
    styling,
    onClose,
}) => {
    if (!title) return null;

    const style: React.CSSProperties = {
        backgroundColor: styling.backgroundColor,
        color: styling.textColor,
        textAlign: styling.alignment,
        fontSize:
            styling.fontSize === "sm"
                ? "14px"
                : styling.fontSize === "lg"
                  ? "18px"
                  : "16px",
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden border max-h-[90vh] overflow-y-auto"
                style={{
                    backgroundColor: style.backgroundColor,
                    color: style.color,
                }}
            >
                {image && (
                    <div className="relative h-48 overflow-hidden">
                        <img
                            src={image}
                            alt="Announcement"
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h4
                            className="font-semibold text-lg pr-4"
                            style={{ textAlign: style.textAlign }}
                        >
                            {title}
                        </h4>
                        {onClose && (
                            <X
                                className="w-5 h-5 opacity-50 cursor-pointer hover:opacity-75 flex-shrink-0"
                                onClick={onClose}
                            />
                        )}
                    </div>
                    <p
                        className="mb-4 leading-relaxed"
                        style={{ textAlign: style.textAlign }}
                    >
                        {body}
                    </p>
                    {onClose && (
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClose}
                            >
                                Close
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const NotificationTemplate: React.FC<AnnouncementData> = ({
    title,
    body,
    styling,
    onClose,
}) => {
    if (!title) return null;

    const style: React.CSSProperties = {
        backgroundColor: styling.backgroundColor,
        color: styling.textColor,
        textAlign: styling.alignment,
        fontSize:
            styling.fontSize === "sm"
                ? "14px"
                : styling.fontSize === "lg"
                  ? "18px"
                  : "16px",
        borderLeftColor: styling.borderColor || "#3b82f6",
    };

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
            <div
                className="p-4 rounded-lg shadow-lg border-l-4 bg-white border border-gray-200"
                style={style}
            >
                <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1 truncate">
                            {title}
                        </h4>
                        <p className="text-sm line-clamp-3">{body}</p>
                    </div>
                    {onClose && (
                        <X
                            className="w-4 h-4 opacity-50 cursor-pointer hover:opacity-75 flex-shrink-0"
                            onClick={onClose}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export const PopupTemplate: React.FC<AnnouncementData> = ({
    title,
    body,
    image,
    styling,
    onClose,
}) => {
    if (!title) return null;

    const style: React.CSSProperties = {
        backgroundColor: styling.backgroundColor,
        color: styling.textColor,
        textAlign: styling.alignment,
        fontSize:
            styling.fontSize === "sm"
                ? "14px"
                : styling.fontSize === "lg"
                  ? "18px"
                  : "16px",
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
            <div
                className="p-4 rounded-lg shadow-lg bg-white border"
                style={style}
            >
                <div className="flex justify-between items-start mb-3">
                    <h4
                        className="font-medium text-sm pr-4"
                        style={{ textAlign: style.textAlign }}
                    >
                        {title}
                    </h4>
                    {onClose && (
                        <X
                            className="w-4 h-4 opacity-50 cursor-pointer hover:opacity-75 flex-shrink-0"
                            onClick={onClose}
                        />
                    )}
                </div>
                <p
                    className="text-sm mb-4 leading-relaxed"
                    style={{ textAlign: style.textAlign }}
                >
                    {body}
                </p>
                {image && (
                    <img
                        src={image}
                        alt="Announcement"
                        className="w-full h-20 object-cover rounded"
                    />
                )}
            </div>
        </div>
    );
};

const WEBSITE_URL = "https://thebiva.com/";

// Memoized iframe component
const WebsiteIframe = React.memo(({ refreshKey }: { refreshKey: number }) => {
    return (
        <iframe
            key={`iframe-${refreshKey}`}
            src={WEBSITE_URL}
            className="w-full h-full border-0"
            title="Website Preview"
            sandbox="allow-scripts allow-same-origin allow-forms"
        />
    );
});

WebsiteIframe.displayName = "WebsiteIframe";

// Memoized overlay components
const PreviewBanner = React.memo((props: AnnouncementData) => {
    if (!props.title) return null;
    return (
        <div className="absolute top-0 left-0 right-0 z-50">
            <BannerTemplate {...props} />
        </div>
    );
});

PreviewBanner.displayName = "PreviewBanner";

const PreviewModal = React.memo((props: AnnouncementData) => {
    if (!props.title) return null;

    const fontSize =
        props.styling.fontSize === "sm"
            ? "14px"
            : props.styling.fontSize === "lg"
              ? "20px"
              : "16px";
    const titleSize =
        props.styling.fontSize === "sm"
            ? "18px"
            : props.styling.fontSize === "lg"
              ? "24px"
              : "20px";

    return (
        <div className="absolute inset-0 z-50">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                <div
                    className="rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-0"
                    style={{
                        backgroundColor: props.styling.backgroundColor,
                        color: props.styling.textColor,
                    }}
                >
                    {/* Header with close button */}
                    <div
                        className="flex items-center justify-between px-6 py-4 border-b"
                        style={{ borderColor: `${props.styling.textColor}15` }}
                    >
                        <h4
                            className="font-bold tracking-tight"
                            style={{
                                textAlign: props.styling.alignment,
                                fontSize: titleSize,
                                color: props.styling.textColor,
                            }}
                        >
                            {props.title}
                        </h4>
                        {props.onClose && (
                            <button
                                onClick={props.onClose}
                                className="rounded-full p-2 transition-all duration-200 hover:bg-opacity-10"
                                style={{
                                    backgroundColor: `${props.styling.textColor}00`,
                                    color: props.styling.textColor,
                                }}
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor = `${props.styling.textColor}15`)
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor = `${props.styling.textColor}00`)
                                }
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Image */}
                    {props.image && (
                        <div className="relative w-full aspect-video overflow-hidden">
                            <img
                                src={props.image}
                                alt="Announcement"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="px-6 py-5">
                        <p
                            className="leading-relaxed"
                            style={{
                                textAlign: props.styling.alignment,
                                fontSize: fontSize,
                                color: props.styling.textColor,
                                opacity: 0.9,
                            }}
                        >
                            {props.body}
                        </p>
                    </div>

                    {/* Footer with action button */}
                    {props.onClose && (
                        <div className="px-6 pb-6 flex justify-end gap-3">
                            <button
                                onClick={props.onClose}
                                className="px-6 py-2.5 rounded-full font-semibold transition-all duration-200 hover:opacity-90"
                                style={{
                                    backgroundColor: props.styling.textColor,
                                    color: props.styling.backgroundColor,
                                    fontSize: "14px",
                                }}
                            >
                                Got it
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

PreviewModal.displayName = "PreviewModal";

const PreviewNotification = React.memo((props: AnnouncementData) => {
    if (!props.title) return null;
    return (
        <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="relative w-full h-full">
                <div className="absolute top-4 right-4 max-w-sm">
                    <div
                        className="p-4 rounded-lg shadow-lg border-l-4 bg-white border border-gray-200 pointer-events-auto"
                        style={{
                            backgroundColor: props.styling.backgroundColor,
                            color: props.styling.textColor,
                            borderLeftColor:
                                props.styling.borderColor || "#3b82f6",
                            fontSize:
                                props.styling.fontSize === "sm"
                                    ? "14px"
                                    : props.styling.fontSize === "lg"
                                      ? "18px"
                                      : "16px",
                        }}
                    >
                        <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm mb-1 truncate">
                                    {props.title}
                                </h4>
                                <p className="text-sm line-clamp-3">
                                    {props.body}
                                </p>
                            </div>
                            {props.onClose && (
                                <X
                                    className="w-4 h-4 opacity-50 cursor-pointer hover:opacity-75 flex-shrink-0"
                                    onClick={props.onClose}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

PreviewNotification.displayName = "PreviewNotification";

const PreviewPopup = React.memo((props: AnnouncementData) => {
    if (!props.title) return null;

    const fontSize =
        props.styling.fontSize === "sm"
            ? "13px"
            : props.styling.fontSize === "lg"
              ? "16px"
              : "14px";
    const titleSize =
        props.styling.fontSize === "sm"
            ? "15px"
            : props.styling.fontSize === "lg"
              ? "18px"
              : "16px";

    return (
        <div className="absolute inset-0 z-50 pointer-events-none">
            <div className="relative w-full h-full">
                <div className="absolute bottom-4 right-4 max-w-sm animate-in slide-in-from-bottom-2">
                    <div
                        className="rounded-2xl shadow-2xl border-0 pointer-events-auto overflow-hidden backdrop-blur-sm"
                        style={{
                            backgroundColor: props.styling.backgroundColor,
                            color: props.styling.textColor,
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between px-5 pt-4 pb-3">
                            <div className="flex items-start gap-3 flex-1">
                                <div
                                    className="rounded-full p-2 mt-0.5"
                                    style={{
                                        backgroundColor: `${props.styling.textColor}15`,
                                    }}
                                >
                                    <Bell
                                        className="w-4 h-4"
                                        style={{
                                            color: props.styling.textColor,
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4
                                        className="font-bold leading-tight"
                                        style={{
                                            textAlign: props.styling.alignment,
                                            fontSize: titleSize,
                                            color: props.styling.textColor,
                                        }}
                                    >
                                        {props.title}
                                    </h4>
                                </div>
                            </div>
                            {props.onClose && (
                                <button
                                    onClick={props.onClose}
                                    className="rounded-full p-1.5 transition-all duration-200 ml-2 flex-shrink-0"
                                    style={{
                                        backgroundColor: `${props.styling.textColor}00`,
                                        color: props.styling.textColor,
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor = `${props.styling.textColor}15`)
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor = `${props.styling.textColor}00`)
                                    }
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Image */}
                        {props.image && (
                            <div className="px-5 pb-3">
                                <img
                                    src={props.image}
                                    alt="Announcement"
                                    className="w-full h-32 object-cover rounded-xl"
                                />
                            </div>
                        )}

                        {/* Content */}
                        <div className="px-5 pb-4">
                            <p
                                className="leading-relaxed"
                                style={{
                                    textAlign: props.styling.alignment,
                                    fontSize: fontSize,
                                    color: props.styling.textColor,
                                    opacity: 0.85,
                                }}
                            >
                                {props.body}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

PreviewPopup.displayName = "PreviewPopup";

export default function AnnouncementsPage() {
    const [previewDevice, setPreviewDevice] = useState<
        "desktop" | "tablet" | "mobile"
    >("desktop");
    const [iframeRefreshKey, setIframeRefreshKey] = useState(0);

    // Announcement types and tab order
    const announcementTypes = [
        { type: "banner", label: "Banner" },
        { type: "modal", label: "Modal" },
        { type: "notification", label: "Notification" },
        { type: "popup", label: "Popup" },
    ] as const;

    // State: array of 4 forms, one per type
    const [forms, setForms] = useState<Announcement[]>(() =>
        announcementTypes.map((t) => ({
            id: "",
            title: "",
            body: "",
            displayType: t.type,
            image: "",
            styling: { ...defaultStyling },
        })),
    );
    // Track which tab is active
    const [activeTab, setActiveTab] = useState(0);

    // TanStack Query for fetching existing announcements
    const { data: existing, isLoading: isLoadingExisting } = useQuery({
        queryKey: ["announcements", "all"],
        queryFn: async () => {
            // Replace with your actual fetch logic
            const res = await fetch("/api/announcements");
            if (!res.ok) throw new Error("Failed to fetch");
            return res.json();
        },
        staleTime: 1000 * 60 * 5,
    });

    // On mount or when existing changes, prefill forms
    useEffect(() => {
        if (existing && Array.isArray(existing)) {
            setForms((prev) =>
                announcementTypes.map((t, idx) => {
                    const found = existing.find(
                        (a: Announcement) => a.displayType === t.type,
                    );
                    return found
                        ? { ...prev[idx], ...found }
                        : { ...prev[idx], displayType: t.type };
                }),
            );
        }
    }, [existing]);

    // Mutations for sending all announcements
    const createAnnouncementMutation = useCreateAnnouncement();

    // Local "set" for each tab
    const [localForms, setLocalForms] = useState<Announcement[]>(() =>
        announcementTypes.map((t) => ({
            id: "",
            title: "",
            body: "",
            displayType: t.type,
            image: "",
            styling: { ...defaultStyling },
        })),
    );

    // On tab change, sync local form with main form
    useEffect(() => {
        setLocalForms(forms);
    }, [forms]);

    // Update local form for active tab
    const updateLocalForm = (field: keyof Announcement, value: any) => {
        setLocalForms((prev) =>
            prev.map((f, idx) =>
                idx === activeTab ? { ...f, [field]: value } : f,
            ),
        );
    };

    const updateLocalStyling = (
        field: keyof Announcement["styling"],
        value: any,
    ) => {
        setLocalForms((prev) =>
            prev.map((f, idx) =>
                idx === activeTab
                    ? {
                          ...f,
                          styling: {
                              ...(f.styling || defaultStyling),
                              [field]: value,
                          },
                      }
                    : f,
            ),
        );
    };

    const handleImageUpload = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                console.log(
                    "📎 File selected:",
                    file.name,
                    file.type,
                    file.size,
                );
                // Store the actual File object directly
                setLocalForms((prev) =>
                    prev.map((f, idx) =>
                        idx === activeTab
                            ? {
                                  ...f,
                                  image: file,
                                  imagePreview: URL.createObjectURL(file),
                              }
                            : f,
                    ),
                );
            }
        },
        [activeTab],
    );

    const removeImage = useCallback(() => {
        updateLocalForm("image", "");
        setLocalForms((prev) =>
            prev.map((f, idx) =>
                idx === activeTab ? { ...f, imagePreview: "" } : f,
            ),
        );
    }, [activeTab]);

    const refreshIframe = useCallback(() => {
        setIframeRefreshKey((prev) => prev + 1);
    }, []);

    const getDeviceDimensions = () => {
        switch (previewDevice) {
            case "mobile":
                return { width: "375px", height: "667px" };
            case "tablet":
                return { width: "768px", height: "1024px" };
            default:
                return { width: "100%", height: "600px" };
        }
    };

    // "Set" button: update main forms array with local form for active tab
    const handleSet = () => {
        setForms((prev) =>
            prev.map((f, idx) =>
                idx === activeTab ? localForms[activeTab] : f,
            ),
        );
    };

    const handleAnnounce = () => {
        // Prepare announcements array in the format expected by the hook
        const announcements = forms.map(
            ({ title, body, displayType, styling, image }) => {
                console.log(`📤 Preparing ${displayType}:`, {
                    title,
                    hasImage: !!image,
                    imageType: typeof image,
                    isFile: image instanceof File,
                    fileName: image instanceof File ? image.name : "not a file",
                });

                return {
                    title,
                    body,
                    displayType,
                    styling,
                    image, // Can be File object or existing URL string
                };
            },
        );

        console.log("🚀 Sending announcements:", announcements);

        // Call the mutation with the correct payload structure
        createAnnouncementMutation.mutate(
            { announcements },
            {
                onSuccess: () => {
                    // Logic after successful creation (e.g., reset forms or show toast)
                    console.log("Announcements created successfully!");
                },
                onError: (error) => {
                    // Logic for handling errors
                    console.error("Failed to create announcements:", error);
                },
            },
        );
    };

    // Preview data for active tab
    const previewStyle = useMemo(
        (): Announcement["styling"] => ({
            backgroundColor:
                localForms[activeTab].styling?.backgroundColor ||
                defaultStyling.backgroundColor,
            textColor:
                localForms[activeTab].styling?.textColor ||
                defaultStyling.textColor,
            borderColor:
                localForms[activeTab].styling?.borderColor ||
                defaultStyling.borderColor,
            fontSize:
                localForms[activeTab].styling?.fontSize ||
                defaultStyling.fontSize,
            alignment:
                localForms[activeTab].styling?.alignment ||
                defaultStyling.alignment,
        }),
        [localForms, activeTab],
    );

    const announcementData: AnnouncementData = {
        title: localForms[activeTab].title || "",
        body: localForms[activeTab].body || "",
        image:
            localForms[activeTab].imagePreview ||
            (typeof localForms[activeTab].image === "string"
                ? localForms[activeTab].image
                : undefined),
        styling: previewStyle,
    };

    // Preview section for active tab
    const PreviewSection = React.memo(() => {
        const dimensions = getDeviceDimensions();
        const displayType = announcementTypes[activeTab].type;

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Preview</h3>
                    <div className="flex items-center gap-2">
                        <div className="flex bg-muted rounded-md p-1">
                            <Button
                                variant={
                                    previewDevice === "desktop"
                                        ? "default"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() => setPreviewDevice("desktop")}
                                className="px-2"
                            >
                                <Monitor className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={
                                    previewDevice === "tablet"
                                        ? "default"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() => setPreviewDevice("tablet")}
                                className="px-2"
                            >
                                <Tablet className="w-4 h-4" />
                            </Button>
                            <Button
                                variant={
                                    previewDevice === "mobile"
                                        ? "default"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() => setPreviewDevice("mobile")}
                                className="px-2"
                            >
                                <Smartphone className="w-4 h-4" />
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshIframe}
                        >
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-3 py-1 rounded">
                    {WEBSITE_URL}
                </div>

                <div
                    className="relative border rounded-lg overflow-hidden bg-background"
                    style={{ height: "600px" }}
                >
                    <div className="flex justify-center p-4 h-full">
                        <div
                            className="relative border rounded-lg overflow-hidden shadow-sm bg-background"
                            style={dimensions}
                        >
                            {/* Website Iframe Container */}
                            <div
                                className="w-full h-full"
                                style={{
                                    marginTop:
                                        localForms[activeTab].title &&
                                        displayType === "banner"
                                            ? "80px"
                                            : "0",
                                    height:
                                        localForms[activeTab].title &&
                                        displayType === "banner"
                                            ? "calc(100% - 80px)"
                                            : "100%",
                                }}
                            >
                                <WebsiteIframe refreshKey={iframeRefreshKey} />
                            </div>

                            {/* Announcement Overlays */}
                            {displayType === "banner" && (
                                <PreviewBanner {...announcementData} />
                            )}

                            {displayType === "modal" && (
                                <PreviewModal {...announcementData} />
                            )}

                            {displayType === "notification" && (
                                <PreviewNotification {...announcementData} />
                            )}

                            {displayType === "popup" && (
                                <PreviewPopup {...announcementData} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Badge variant="outline" className="text-xs">
                        {previewDevice} view
                    </Badge>
                </div>
            </div>
        );
    });

    PreviewSection.displayName = "PreviewSection";

    return (
        <div className="flex flex-1 min-h-screen">
            <div className="flex flex-1 gap-6 p-6">
                {/* Left Panel - Tabs and Form */}
                <div className="flex-1 max-w-lg">
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Create Announcement
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Design your announcement for thebiva.com
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="flex mb-4 border-b">
                            {announcementTypes.map((t, idx) => (
                                <button
                                    key={t.type}
                                    className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                                        activeTab === idx
                                            ? "border-primary text-primary"
                                            : "border-transparent text-muted-foreground"
                                    }`}
                                    onClick={() => setActiveTab(idx)}
                                    type="button"
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>

                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg">
                                    {announcementTypes[activeTab].label}{" "}
                                    Announcement
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Success/Error Messages */}
                                {createAnnouncementMutation.isSuccess && (
                                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm">
                                            Announcements sent successfully!
                                        </span>
                                    </div>
                                )}

                                {createAnnouncementMutation.isError && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">
                                            {createAnnouncementMutation.error
                                                ?.message ||
                                                "Failed to send announcements"}
                                        </span>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={
                                            localForms[activeTab].title || ""
                                        }
                                        onChange={(e) =>
                                            updateLocalForm(
                                                "title",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter title"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="body">Message</Label>
                                    <Textarea
                                        id="body"
                                        value={localForms[activeTab].body || ""}
                                        onChange={(e) =>
                                            updateLocalForm(
                                                "body",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter your message"
                                        className="mt-1 min-h-[100px]"
                                    />
                                </div>

                                <div>
                                    <Label>Image (Optional)</Label>
                                    {localForms[activeTab].image ||
                                    localForms[activeTab].imagePreview ? (
                                        <div className="relative mt-1">
                                            <img
                                                src={
                                                    localForms[activeTab]
                                                        .imagePreview ||
                                                    (typeof localForms[
                                                        activeTab
                                                    ].image === "string"
                                                        ? localForms[activeTab]
                                                              .image
                                                        : "")
                                                }
                                                alt="Preview"
                                                className="w-full h-32 object-cover rounded border"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2"
                                            >
                                                <Trash className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="border-2 border-dashed rounded p-4 text-center mt-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                                id={`image-upload-${activeTab}`}
                                            />
                                            <Label
                                                htmlFor={`image-upload-${activeTab}`}
                                                className="cursor-pointer flex flex-col items-center gap-2"
                                            >
                                                <Upload className="w-6 h-6 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">
                                                    Upload image
                                                </span>
                                            </Label>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label>Styling</Label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">
                                                Background
                                            </Label>
                                            <div className="flex gap-1 mt-1">
                                                <Input
                                                    type="color"
                                                    value={
                                                        localForms[activeTab]
                                                            .styling
                                                            ?.backgroundColor ||
                                                        defaultStyling.backgroundColor
                                                    }
                                                    onChange={(e) =>
                                                        updateLocalStyling(
                                                            "backgroundColor",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-10 h-8 p-1"
                                                />
                                                <Input
                                                    value={
                                                        localForms[activeTab]
                                                            .styling
                                                            ?.backgroundColor ||
                                                        defaultStyling.backgroundColor
                                                    }
                                                    onChange={(e) =>
                                                        updateLocalStyling(
                                                            "backgroundColor",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1 text-xs font-mono"
                                                    placeholder="#ffffff"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs">
                                                Text Color
                                            </Label>
                                            <div className="flex gap-1 mt-1">
                                                <Input
                                                    type="color"
                                                    value={
                                                        localForms[activeTab]
                                                            .styling
                                                            ?.textColor ||
                                                        defaultStyling.textColor
                                                    }
                                                    onChange={(e) =>
                                                        updateLocalStyling(
                                                            "textColor",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-10 h-8 p-1"
                                                />
                                                <Input
                                                    value={
                                                        localForms[activeTab]
                                                            .styling
                                                            ?.textColor ||
                                                        defaultStyling.textColor
                                                    }
                                                    onChange={(e) =>
                                                        updateLocalStyling(
                                                            "textColor",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1 text-xs font-mono"
                                                    placeholder="#000000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs">
                                                Size
                                            </Label>
                                            <Select
                                                value={
                                                    localForms[activeTab]
                                                        .styling?.fontSize ||
                                                    "md"
                                                }
                                                onValueChange={(value) =>
                                                    updateLocalStyling(
                                                        "fontSize",
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="mt-1 h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="sm">
                                                        Small
                                                    </SelectItem>
                                                    <SelectItem value="md">
                                                        Medium
                                                    </SelectItem>
                                                    <SelectItem value="lg">
                                                        Large
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="text-xs">
                                                Alignment
                                            </Label>
                                            <Select
                                                value={
                                                    localForms[activeTab]
                                                        .styling?.alignment ||
                                                    "center"
                                                }
                                                onValueChange={(value) =>
                                                    updateLocalStyling(
                                                        "alignment",
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="mt-1 h-8">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="left">
                                                        Left
                                                    </SelectItem>
                                                    <SelectItem value="center">
                                                        Center
                                                    </SelectItem>
                                                    <SelectItem value="right">
                                                        Right
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="gap-2 pt-4">
                                <Button
                                    onClick={handleSet}
                                    className="flex-1"
                                    disabled={
                                        !localForms[activeTab].title ||
                                        !localForms[activeTab].body
                                    }
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Set
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                {/* Right Panel - Preview */}
                <div className="flex-1">
                    <div className="sticky top-6">
                        <PreviewSection />
                    </div>
                </div>
            </div>
            {/* Announce Button */}
            <div className="fixed bottom-8 right-8 z-50">
                <Button
                    size="lg"
                    className="shadow-lg"
                    onClick={handleAnnounce}
                    disabled={createAnnouncementMutation.isPending}
                >
                    {createAnnouncementMutation.isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Announcing...
                        </>
                    ) : (
                        <>
                            <Bell className="w-4 h-4 mr-2" />
                            Announce
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
