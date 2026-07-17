import { useState, useEffect, useRef } from "react";
import { Bold, Italic, Underline, Heading1, Heading2, List, Link, Smile } from "lucide-react";
import { toast } from "react-toastify";
import { theme } from "../theme.js";
import { getContentByKey, createOrUpdateContent } from "../services/api.js";

const tabs = [
  { label: "ABOUT US", key: "aboutus" },
  { label: "TERMS & CONDITIONS", key: "terms" },
  { label: "PRIVACY POLICY", key: "privacy" },
  { label: "ANDROID APP URL", key: "android_url" },
  { label: "IOS APP URL", key: "ios_url" },
  { label: "SHARE APP", key: "share_app" },
  { label: "CONTACT US", key: "contact" },
];

export default function ManageContent() {
  const [activeTab, setActiveTab] = useState("ABOUT US");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef(null);

  // Get current tab key
  const getCurrentTabKey = () => {
    const tab = tabs.find(t => t.label === activeTab);
    return tab ? tab.key : "aboutus";
  };

  // Fetch content when tab changes
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const key = getCurrentTabKey();
        const response = await getContentByKey(key);
        const htmlContent = response.data?.description || "";
        setContent(htmlContent);
        if (editorRef.current) {
          editorRef.current.innerHTML = htmlContent;
        }
      } catch (error) {
        console.error("Error fetching content:", error);
        setContent("");
        if (editorRef.current) {
          editorRef.current.innerHTML = "";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [activeTab]);

  // Handle toolbar actions
  const handleToolbarAction = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Handle editor input
  const handleEditorInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  // Handle save
  const handleSave = async () => {
    setSaving(true);
    try {
      const key = getCurrentTabKey();
      await createOrUpdateContent({
        key,
        description: content,
        title: activeTab,
        status: "active"
      });
      toast.success("Content saved successfully!");
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: theme.colors.secondary }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
          Manage Content
        </h1>
        <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
          Dashboard Manage Content
        </span>
      </div>

      {/* Card */}
      <div className="bg-white border rounded-xl p-6 shadow-sm" style={{ borderColor: theme.colors.border }}>
        {/* Tabs */}
        <div className="flex flex-wrap gap-3 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition
                ${
                  activeTab === tab.label
                    ? "text-white shadow"
                    : `border hover:${theme.colors.secondary}`
                }
              `}
              style={{
                backgroundColor: activeTab === tab.label ? theme.colors.primary : 'transparent',
                borderColor: theme.colors.primary,
                color: activeTab === tab.label ? 'white' : theme.colors.primary
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          <h2 className="text-lg font-semibold mb-3" style={{ color: theme.colors.textPrimary }}>
            {activeTab}
          </h2>

          {/* Rich text editor placeholder */}
          <div className="border rounded-lg" style={{ borderColor: theme.colors.border }}>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2 p-3 border-b bg-gray-50" style={{ borderColor: theme.colors.border }}>
              {[
                { icon: Bold, label: "Bold", command: "bold" },
                { icon: Italic, label: "Italic", command: "italic" },
                { icon: Underline, label: "Underline", command: "underline" },
                { icon: Heading1, label: "Heading 1", command: "formatBlock", value: "h1" },
                { icon: Heading2, label: "Heading 2", command: "formatBlock", value: "h2" },
                { icon: List, label: "List", command: "insertUnorderedList" },
                { icon: Smile, label: "Emoji", command: "insertText", value: "😊" }
              ].map(({ icon: Icon, label, command, value }) => (
                <button
                  key={label}
                  onClick={() => handleToolbarAction(command, value)}
                  className="px-2 py-1 text-sm rounded hover:bg-white border border-transparent hover:border-gray-300 transition-colors"
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable={!loading}
              className="w-full p-4 text-sm focus:outline-none rounded-b-lg min-h-[200px]"
              style={{ color: theme.colors.textPrimary }}
              onInput={handleEditorInput}
              data-placeholder="Write your content here..."
            />
            {loading && (
              <div className="text-center py-4 text-sm text-gray-500">
                Loading content...
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 text-white rounded-lg font-medium transition hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: theme.colors.primary }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
