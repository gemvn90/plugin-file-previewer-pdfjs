interface FileType {
    url: string;
    title: string;
    extname: string;
    mimetype?: string;
}
interface PDFPreviewerProps {
    index: number;
    list: FileType[];
    onSwitchIndex: (index: number | null) => void;
}
export declare function PDFPreviewer({ index, list, onSwitchIndex }: PDFPreviewerProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=PDFPreviewer.d.ts.map