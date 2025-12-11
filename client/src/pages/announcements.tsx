import React, { useState, useMemo, useCallback } from "react";
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
    Megaphone,
    Globe,
    RefreshCw,
    Monitor,
    Smartphone,
    Tablet,
    Image as ImageIcon,
    Upload,
    Trash,
    RotateCcw,
    Loader2,
    CheckCircle,
    AlertCircle,
} from "lucide-react";
import {
    useCreateAnnouncement,
    type CreateAnnouncementRequest,
} from "../hooks/useAnnouncements";

// Textarea component
interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

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
    image?: string;
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

    const fontSize = props.styling.fontSize === "sm" ? "14px" : props.styling.fontSize === "lg" ? "20px" : "16px";
    const titleSize = props.styling.fontSize === "sm" ? "18px" : props.styling.fontSize === "lg" ? "24px" : "20px";

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
                    <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: `${props.styling.textColor}15` }}>
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
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${props.styling.textColor}15`}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${props.styling.textColor}00`}
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
                            borderLeftColor: props.styling.borderColor || "#3b82f6",
                            fontSize: props.styling.fontSize === "sm" ? "14px" : props.styling.fontSize === "lg" ? "18px" : "16px"
                        }}
                    >
                        <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm mb-1 truncate">
                                    {props.title}
                                </h4>
                                <p className="text-sm line-clamp-3">{props.body}</p>
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

    const fontSize = props.styling.fontSize === "sm" ? "13px" : props.styling.fontSize === "lg" ? "16px" : "14px";
    const titleSize = props.styling.fontSize === "sm" ? "15px" : props.styling.fontSize === "lg" ? "18px" : "16px";

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
                                <div className="rounded-full p-2 mt-0.5" style={{ backgroundColor: `${props.styling.textColor}15` }}>
                                    <Bell className="w-4 h-4" style={{ color: props.styling.textColor }} />
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
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${props.styling.textColor}15`}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${props.styling.textColor}00`}
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

    const [formData, setFormData] = useState<Partial<Announcement>>({
        title: "",
        body: "",
        displayType: "banner",
        styling: { ...defaultStyling },
    });

    // Use the TanStack Query mutation hook
    const createAnnouncementMutation = useCreateAnnouncement();

    const handleSave = () => {
        if (!formData.title || !formData.body) return;

        const requestData: CreateAnnouncementRequest = {
            title: formData.title,
            body: formData.body,
            displayType: formData.displayType || "banner",
            image: formData.image, // This is the base64 string from your image upload
            styling: formData.styling || defaultStyling,
        };

        createAnnouncementMutation.mutate(requestData, {
            onSuccess: (response) => {
                console.log("Announcement saved successfully:", response);
                // Optionally reset the form
                handleReset();
            },
            onError: (error) => {
                console.error("Failed to save announcement:", error.message);
                // Handle error (show toast, etc.)
            },
        });
    };

    const handleReset = () => {
        setFormData({
            title: "",
            body: "",
            displayType: "banner",
            styling: { ...defaultStyling },
        });
    };

    const updateFormData = useCallback(
        (field: keyof Announcement, value: any) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
        },
        [],
    );

    const updateStyling = useCallback(
        (field: keyof Announcement["styling"], value: any) => {
            setFormData((prev) => ({
                ...prev,
                styling: { ...prev.styling, [field]: value },
            }));
        },
        [],
    );

    const handleImageUpload = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                    updateFormData("image", reader.result as string);
                };
                reader.readAsDataURL(file);
            }
        },
        [updateFormData],
    );

    const removeImage = useCallback(() => {
        updateFormData("image", "");
    }, [updateFormData]);

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

    const previewStyle = useMemo(
        () => ({
            backgroundColor:
                formData.styling?.backgroundColor ||
                defaultStyling.backgroundColor,
            color: formData.styling?.textColor || defaultStyling.textColor,
            borderColor:
                formData.styling?.borderColor || defaultStyling.borderColor,
            fontSize: formData.styling?.fontSize || defaultStyling.fontSize,
            alignment: formData.styling?.alignment || defaultStyling.alignment,
        }),
        [formData.styling],
    );

    const announcementData: AnnouncementData = {
        title: formData.title || "",
        body: formData.body || "",
        image: formData.image,
        styling: previewStyle,
    };

    const PreviewSection = React.memo(() => {
        const dimensions = getDeviceDimensions();

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
                                        formData.title &&
                                            formData.displayType === "banner"
                                            ? "80px"
                                            : "0",
                                    height:
                                        formData.title &&
                                            formData.displayType === "banner"
                                            ? "calc(100% - 80px)"
                                            : "100%",
                                }}
                            >
                                <WebsiteIframe refreshKey={iframeRefreshKey} />
                            </div>

                            {/* Announcement Overlays */}
                            {formData.displayType === "banner" && (
                                <PreviewBanner {...announcementData} />
                            )}

                            {formData.displayType === "modal" && (
                                <PreviewModal {...announcementData} />
                            )}

                            {formData.displayType === "notification" && (
                                <PreviewNotification {...announcementData} />
                            )}

                            {formData.displayType === "popup" && (
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
                {/* Left Panel - Form */}
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

                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg">
                                    Announcement
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Success/Error Messages */}
                                {createAnnouncementMutation.isSuccess && (
                                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
                                        <CheckCircle className="w-4 h-4" />
                                        <span className="text-sm">
                                            Announcement created successfully!
                                        </span>
                                    </div>
                                )}

                                {createAnnouncementMutation.isError && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">
                                            {createAnnouncementMutation.error
                                                ?.message ||
                                                "Failed to create announcement"}
                                        </span>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title || ""}
                                        onChange={(e) =>
                                            updateFormData(
                                                "title",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter title"
                                        className="mt-1"
                                        disabled={
                                            createAnnouncementMutation.isPending
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="body">Message</Label>
                                    <Textarea
                                        id="body"
                                        value={formData.body || ""}
                                        onChange={(e) =>
                                            updateFormData(
                                                "body",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Enter your message"
                                        className="mt-1 min-h-[100px]"
                                        disabled={
                                            createAnnouncementMutation.isPending
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="displayType">
                                        Display Type
                                    </Label>
                                    <Select
                                        value={formData.displayType || "banner"}
                                        onValueChange={(value) =>
                                            updateFormData("displayType", value)
                                        }
                                        disabled={
                                            createAnnouncementMutation.isPending
                                        }
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="banner">
                                                Banner
                                            </SelectItem>
                                            <SelectItem value="modal">
                                                Modal
                                            </SelectItem>
                                            <SelectItem value="popup">
                                                Popup
                                            </SelectItem>
                                            <SelectItem value="notification">
                                                Notification
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Image (Optional)</Label>
                                    {formData.image ? (
                                        <div className="relative mt-1">
                                            <img
                                                src={formData.image}
                                                alt="Preview"
                                                className="w-full h-32 object-cover rounded border"
                                            />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2"
                                                disabled={
                                                    createAnnouncementMutation.isPending
                                                }
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
                                                id="image-upload"
                                                disabled={
                                                    createAnnouncementMutation.isPending
                                                }
                                            />
                                            <Label
                                                htmlFor="image-upload"
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
                                                        formData.styling
                                                            ?.backgroundColor ||
                                                        defaultStyling.backgroundColor
                                                    }
                                                    onChange={(e) =>
                                                        updateStyling(
                                                            "backgroundColor",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-10 h-8 p-1"
                                                    disabled={
                                                        createAnnouncementMutation.isPending
                                                    }
                                                />
                                                <Input
                                                    value={
                                                        formData.styling
                                                            ?.backgroundColor ||
                                                        defaultStyling.backgroundColor
                                                    }
                                                    onChange={(e) =>
                                                        updateStyling(
                                                            "backgroundColor",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1 text-xs font-mono"
                                                    placeholder="#ffffff"
                                                    disabled={
                                                        createAnnouncementMutation.isPending
                                                    }
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
                                                        formData.styling
                                                            ?.textColor ||
                                                        defaultStyling.textColor
                                                    }
                                                    onChange={(e) =>
                                                        updateStyling(
                                                            "textColor",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-10 h-8 p-1"
                                                    disabled={
                                                        createAnnouncementMutation.isPending
                                                    }
                                                />
                                                <Input
                                                    value={
                                                        formData.styling
                                                            ?.textColor ||
                                                        defaultStyling.textColor
                                                    }
                                                    onChange={(e) =>
                                                        updateStyling(
                                                            "textColor",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="flex-1 text-xs font-mono"
                                                    placeholder="#000000"
                                                    disabled={
                                                        createAnnouncementMutation.isPending
                                                    }
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
                                                    formData.styling
                                                        ?.fontSize || "md"
                                                }
                                                onValueChange={(value) =>
                                                    updateStyling(
                                                        "fontSize",
                                                        value,
                                                    )
                                                }
                                                disabled={
                                                    createAnnouncementMutation.isPending
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
                                                    formData.styling
                                                        ?.alignment || "center"
                                                }
                                                onValueChange={(value) =>
                                                    updateStyling(
                                                        "alignment",
                                                        value,
                                                    )
                                                }
                                                disabled={
                                                    createAnnouncementMutation.isPending
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
                                    onClick={handleSave}
                                    className="flex-1"
                                    disabled={
                                        createAnnouncementMutation.isPending ||
                                        !formData.title ||
                                        !formData.body
                                    }
                                >
                                    {createAnnouncementMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={
                                        createAnnouncementMutation.isPending
                                    }
                                >
                                    <RotateCcw className="w-4 h-4" />
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
        </div>
    );
}
