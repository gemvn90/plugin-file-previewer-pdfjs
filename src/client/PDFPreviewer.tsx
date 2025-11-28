import React, { useState, useEffect } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { Button, Spin, Modal } from 'antd';
import { saveAs } from 'file-saver';
import { useT } from './locale';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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

export function PDFPreviewer({ index, list = [], onSwitchIndex }: PDFPreviewerProps) {
  const t = useT();
  
  // Early return if index is invalid or file doesn't exist
  if (index == null || index < 0 || index >= list.length) {
    return null;
  }
  
  const file = list[index];
  
  // Double check file exists and has required properties
  if (!file || !file.url) {
    return null;
  }
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!file?.url) return;
    try {
      const url = file.url.startsWith('http')
        ? file.url
        : `${window.location.origin}/${file.url.replace(/^\//, '')}`;
      setPdfUrl(url);
    } catch (err) {
      console.error('Error setting PDF URL:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [file?.url]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setError(error);
    setLoading(false);
  }

  const handleDownload = () => {
    if (file) {
      saveAs(file.url, `${file.title}${file.extname}`);
    }
  };

  const changePage = (offset: number) => {
    setPageNumber(prev => Math.max(1, Math.min(prev + offset, numPages || 1)));
  };

  const handleClose = () => {
    onSwitchIndex(null);
  };

  return (
    <Modal
      open={index != null}
      title={file.title}
      onCancel={handleClose}
      footer={[
        <Button key="prev" onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
          {t('Previous')}
        </Button>,
        <Button key="next" onClick={() => changePage(1)} disabled={pageNumber >= (numPages || 1)}>
          {t('Next')}
        </Button>,
        <Button key="download" onClick={handleDownload}>
          {t('Download')}
        </Button>,
        <Button key="close" onClick={handleClose}>
          {t('Close')}
        </Button>,
      ]}
      width="85vw"
      centered
    >
      <Spin spinning={loading}>
        <div style={{ height: '70vh', overflow: 'auto' }}>
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
          >
            <Page
              pageNumber={pageNumber}
              width={1200}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          </Document>
        </div>
        {error ? (
          <div style={{ color: 'red', textAlign: 'center', padding: 20 }}>
            {t('Failed to load PDF:')} {error.message}
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            {t('Page')} {pageNumber} {t('of')} {numPages}
          </div>
        )}
      </Spin>
    </Modal>
  );
}
